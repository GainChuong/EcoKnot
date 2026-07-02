-- ======================================================================
--  DATABASE SCHEMA: EcoKnot Gifting Platform
--  Compatible with: PostgreSQL 14+ / Supabase
--  Modules: AI Assist · Care-lendar · Relationship Graph · Notifications
-- ======================================================================

-- Enable pgcrypto for UUID generation (Supabase ships this by default)
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------------------------
-- TABLE 1: products
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id                       VARCHAR(50)  PRIMARY KEY,
    name                     VARCHAR(255) NOT NULL,
    category                 VARCHAR(100) NOT NULL,
    price                    INT          NOT NULL,
    image_url                VARCHAR(512),
    tags                     TEXT[]       NOT NULL DEFAULT '{}',
    description              TEXT,
    recycled_content_pct     SMALLINT     DEFAULT 0,
    recyclability_pct        SMALLINT     DEFAULT 0,
    reusable_packaging       BOOLEAN      DEFAULT FALSE,
    renewable_material       BOOLEAN      DEFAULT FALSE,
    virgin_plastic_saved_g   INT          DEFAULT 0,
    carbon_footprint_kg      DECIMAL(6,3) DEFAULT 0.000,
    origin_region            VARCHAR(255),
    materials_used           VARCHAR(255),
    packaging_type           VARCHAR(255),
    certifications           TEXT[]       DEFAULT '{}',
    created_at               TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_tags     ON products USING GIN(tags);

-- -----------------------------------------------------------------------
-- TABLE 2: users
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id                       VARCHAR(100) PRIMARY KEY,
    email                    VARCHAR(255) UNIQUE NOT NULL,
    display_name             VARCHAR(255),
    role                     VARCHAR(20)  DEFAULT 'customer',
    created_at               TIMESTAMPTZ  DEFAULT NOW()
);

-- -----------------------------------------------------------------------
-- TABLE 3: customer_preference_profiles  (AI Assist long-term memory)
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customer_preference_profiles (
    user_id                  VARCHAR(100) PRIMARY KEY
                                REFERENCES users(id) ON DELETE CASCADE,
    survey_recipients        TEXT[]       DEFAULT '{}',
    survey_interests         TEXT[]       DEFAULT '{}',
    survey_occasions         TEXT[]       DEFAULT '{}',
    budget_tier              VARCHAR(20)  DEFAULT '300_500',
    style_preference         VARCHAR(30)  DEFAULT 'eco',
    purchased_items_count    INT          DEFAULT 0,
    preferred_product_ids    TEXT[]       DEFAULT '{}',
    avoided_product_ids      TEXT[]       DEFAULT '{}',
    last_updated_at          TIMESTAMPTZ  DEFAULT NOW()
);

-- -----------------------------------------------------------------------
-- TABLE 4: ai_feedback_logs
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_feedback_logs (
    id                       BIGSERIAL    PRIMARY KEY,
    user_id                  VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prompt_id                VARCHAR(100) NOT NULL,
    ai_box_material          VARCHAR(50),
    ai_box_size              VARCHAR(50),
    ai_ribbon                VARCHAR(50),
    ai_items                 TEXT[]       NOT NULL,
    final_items              TEXT[]       NOT NULL,
    items_removed            TEXT[]       DEFAULT '{}',
    items_added              TEXT[]       DEFAULT '{}',
    items_kept               TEXT[]       DEFAULT '{}',
    changed_at               TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_feedback_user ON ai_feedback_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_time ON ai_feedback_logs(changed_at DESC);

-- -----------------------------------------------------------------------
-- TABLE 5: customer_recipients  (Relationship Graph Sub-nodes)
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customer_recipients (
    id                       BIGSERIAL    PRIMARY KEY,
    user_id                  VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name                     VARCHAR(255) NOT NULL,
    avatar_url               VARCHAR(512),
    relationship_type        VARCHAR(50)  NOT NULL,
    closeness_score          SMALLINT     DEFAULT 5 CHECK (closeness_score BETWEEN 1 AND 10),
    interests                TEXT[]       DEFAULT '{}',
    style_preference         VARCHAR(30)  DEFAULT 'eco',
    preferred_budget_tier    VARCHAR(20)  DEFAULT '300_500',
    gift_history             JSONB        DEFAULT '[]',
    total_co2_saved_kg       DECIMAL(10,3) DEFAULT 0.000,
    is_archived              BOOLEAN      DEFAULT FALSE,
    created_at               TIMESTAMPTZ  DEFAULT NOW(),
    updated_at               TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recipients_user  ON customer_recipients(user_id);
CREATE INDEX IF NOT EXISTS idx_recipients_type  ON customer_recipients(relationship_type);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_recipients_updated ON customer_recipients;
CREATE TRIGGER trg_recipients_updated
    BEFORE UPDATE ON customer_recipients
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- -----------------------------------------------------------------------
-- TABLE 6: care_lendar_events  (Scheduled gifting event calendar)
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS care_lendar_events (
    id                        BIGSERIAL    PRIMARY KEY,
    user_id                   VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id              BIGINT       REFERENCES customer_recipients(id) ON DELETE CASCADE,
    title                     VARCHAR(255) NOT NULL,
    event_date                DATE         NOT NULL,
    event_type                VARCHAR(50)  NOT NULL,
    suggested_box_draft       JSONB        DEFAULT NULL,
    notification_triggered    BOOLEAN      DEFAULT FALSE,
    notification_triggered_at TIMESTAMPTZ  DEFAULT NULL,
    recurs_annually           BOOLEAN      DEFAULT FALSE,
    created_at                TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_user  ON care_lendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_date  ON care_lendar_events(event_date);
-- Partial index to make cron sweep extremely fast (only scans untriggered rows)
CREATE INDEX IF NOT EXISTS idx_events_cron  ON care_lendar_events(event_date, notification_triggered)
    WHERE notification_triggered = FALSE;

-- -----------------------------------------------------------------------
-- TABLE 7: notifications
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id                       BIGSERIAL    PRIMARY KEY,
    user_id                  VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id                 BIGINT       REFERENCES care_lendar_events(id) ON DELETE SET NULL,
    title                    VARCHAR(255) NOT NULL,
    message                  TEXT         NOT NULL,
    channel                  VARCHAR(20)  DEFAULT 'web',
    is_read                  BOOLEAN      DEFAULT FALSE,
    read_at                  TIMESTAMPTZ  DEFAULT NULL,
    created_at               TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user    ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- -----------------------------------------------------------------------
-- VIEW: upcoming_events_14d  (used by cron sweep query)
-- -----------------------------------------------------------------------
CREATE OR REPLACE VIEW upcoming_events_14d AS
SELECT
    e.id,
    e.user_id,
    e.recipient_id,
    e.title,
    e.event_date,
    e.event_type,
    e.notification_triggered,
    (e.event_date - CURRENT_DATE) AS days_until_event,
    r.name               AS recipient_name,
    r.relationship_type  AS recipient_relationship,
    r.interests          AS recipient_interests,
    r.style_preference   AS recipient_style,
    r.gift_history       AS recipient_gift_history,
    r.total_co2_saved_kg AS recipient_co2_saved
FROM  care_lendar_events e
JOIN  customer_recipients r ON r.id = e.recipient_id
WHERE e.notification_triggered = FALSE
  AND (e.event_date - CURRENT_DATE) = 14;

-- -----------------------------------------------------------------------
-- COMMENTS (documentation)
-- -----------------------------------------------------------------------
COMMENT ON TABLE customer_recipients   IS 'Relationship Graph sub-nodes. Each row is one person in the user gifting network.';
COMMENT ON TABLE care_lendar_events    IS 'Scheduled gifting events. Cron sweep checks daily for rows where event_date - today = 14.';
COMMENT ON TABLE notifications         IS 'In-app / web push notification queue. Populated by the predictive cron sweep job.';
COMMENT ON VIEW  upcoming_events_14d   IS 'Fast cron sweep view: returns only events exactly 14 days away that have not yet been triggered.';

-- ======================================================================
-- COMMERCE MODULE: Cart · Orders · Order_Items · Payment_Logs
-- Added: 2026-07-02
-- ======================================================================

-- -----------------------------------------------------------------------
-- TABLE 8: cart  (session-level shopping cart, supports guest carts)
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cart (
    id               VARCHAR(50)  PRIMARY KEY,          -- UUID
    user_id          VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
    session_id       VARCHAR(100),                       -- For guest carts
    items            JSONB        NOT NULL DEFAULT '[]', -- Array of cart items
    created_at       TIMESTAMPTZ  DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cart_user    ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_session ON cart(session_id);

DROP TRIGGER IF EXISTS trg_cart_updated ON cart;
CREATE TRIGGER trg_cart_updated
    BEFORE UPDATE ON cart
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- -----------------------------------------------------------------------
-- TABLE 9: orders  (master order record)
-- Status workflow:
--   pending_payment → paid → in_production → eco_packaging → dispatched → delivered
--   B2B branch: pending_quote → (admin reviews) → paid → in_production → ...
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id                    VARCHAR(50)   PRIMARY KEY,    -- Format: EK-YYYYMMDD-XXXX
    user_id               VARCHAR(100)  REFERENCES users(id) ON DELETE SET NULL,
    customer_name         VARCHAR(255)  NOT NULL,
    customer_phone        VARCHAR(20)   NOT NULL,
    customer_email        VARCHAR(255)  NOT NULL,
    shipping_address      TEXT          NOT NULL,
    province              VARCHAR(100),
    district              VARCHAR(100),
    ward                  VARCHAR(100),
    delivery_method       VARCHAR(20)   DEFAULT 'standard',  -- standard | express | same_day
    payment_method        VARCHAR(30)   NOT NULL,            -- vietqr | cod | b2b_quote
    status                VARCHAR(50)   DEFAULT 'pending_payment',
    carrier_tracking_id   VARCHAR(100),                      -- GHN/GHTK tracking code
    carrier_name          VARCHAR(50),                       -- 'GHN' | 'GHTK' | 'ViettelPost'
    subtotal              INT           NOT NULL,
    ship_fee              INT           DEFAULT 0,
    discount              INT           DEFAULT 0,
    total                 INT           NOT NULL,
    coupon_code           VARCHAR(50),
    vat_invoice_required  BOOLEAN       DEFAULT FALSE,
    company_name          VARCHAR(255),
    company_tax_id        VARCHAR(50),
    notes                 TEXT,
    created_at            TIMESTAMPTZ   DEFAULT NOW(),
    updated_at            TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user   ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_phone  ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_email  ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

DROP TRIGGER IF EXISTS trg_orders_updated ON orders;
CREATE TRIGGER trg_orders_updated
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE orders IS
  'Master order record. Status: pending_payment→paid→in_production→eco_packaging→dispatched→delivered. B2B branch starts at pending_quote.';
COMMENT ON COLUMN orders.carrier_tracking_id IS 'Tracking code from GHN/GHTK; displayed to customer with deep link to carrier tracking page.';

-- -----------------------------------------------------------------------
-- TABLE 10: order_items  (line items within an order)
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id             BIGSERIAL    PRIMARY KEY,
    order_id       VARCHAR(50)  NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    item_type      VARCHAR(20)  NOT NULL,       -- 'custom_box' | 'preset_box' | 'single_product'
    box_material   VARCHAR(50),                 -- FK ref to box materials catalogue
    box_size       VARCHAR(50),
    ribbon         VARCHAR(50),
    box_color      VARCHAR(20),
    items_json     JSONB        DEFAULT '[]',   -- Products inside the box [{id, name, price, qty}]
    card_text      TEXT,                        -- Greeting card message
    photo_url      VARCHAR(512),                -- Custom photo URL
    qty            INT          DEFAULT 1,
    unit_price     INT          NOT NULL,
    subtotal       INT          NOT NULL,
    eco_metrics    JSONB        DEFAULT '{}'    -- {co2_saved_kg, virgin_plastic_saved_g}
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

COMMENT ON TABLE order_items IS 'Individual gift box line items. items_json holds the products placed inside the box.';

-- -----------------------------------------------------------------------
-- TABLE 11: payment_logs  (immutable audit trail of all payment events)
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payment_logs (
    id               BIGSERIAL    PRIMARY KEY,
    order_id         VARCHAR(50)  NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    gateway          VARCHAR(30)  NOT NULL,     -- 'payos' | 'vnpay' | 'vietqr_manual' | 'cod'
    gateway_txn_id   VARCHAR(100),              -- Transaction ID from payment gateway
    gateway_ref      VARCHAR(200),              -- Payment reference / orderCode sent to gateway
    amount           INT          NOT NULL,     -- Amount in VND (integer)
    status           VARCHAR(30)  NOT NULL,     -- 'initiated' | 'success' | 'failed' | 'cancelled'
    raw_payload      JSONB        DEFAULT '{}', -- Full raw webhook/callback body for auditing
    verified_at      TIMESTAMPTZ,               -- When payment was cryptographically verified
    created_at       TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_logs_order   ON payment_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_gateway ON payment_logs(gateway, status);
CREATE INDEX IF NOT EXISTS idx_payment_logs_txn     ON payment_logs(gateway_txn_id);

COMMENT ON TABLE payment_logs IS
  'Immutable audit trail. One row per payment event (initiate, success, failure, cancellation). Never update, always INSERT.';
COMMENT ON COLUMN payment_logs.raw_payload IS 'Full webhook/callback body stored as-is for forensic replay and reconciliation.';

-- -----------------------------------------------------------------------
-- VIEW: order_summary  (convenience view joining orders + items + payment)
-- -----------------------------------------------------------------------
CREATE OR REPLACE VIEW order_summary AS
SELECT
    o.id,
    o.user_id,
    o.customer_name,
    o.customer_phone,
    o.customer_email,
    o.status,
    o.payment_method,
    o.total,
    o.created_at,
    o.carrier_tracking_id,
    o.carrier_name,
    (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS item_count,
    (SELECT p.status FROM payment_logs p WHERE p.order_id = o.id ORDER BY p.created_at DESC LIMIT 1) AS last_payment_status
FROM orders o;

COMMENT ON VIEW order_summary IS 'Convenience read view for order listing pages. Includes latest payment status and item count.';

