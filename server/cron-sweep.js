/**
 * EcoKnot — Predictive Gifting Engine: Cron Sweep Job
 * ====================================================
 * Standalone Node.js script that runs as a scheduled background task.
 *
 * SCHEDULE: Every day at 00:00 (midnight) server time.
 *
 * LOGIC:
 *   1. Query `care_lendar_events` for rows where:
 *        event_date - CURRENT_DATE = 14  (exactly 14 days away)
 *        AND notification_triggered = FALSE
 *   2. For each matching event:
 *      a. Fetch the linked recipient's profile from `customer_recipients`.
 *      b. Call OpenAI GPT-4o (or mock engine if key not set) with a
 *         personalised system prompt to generate a gift box draft JSON.
 *      c. Persist the draft in `care_lendar_events.suggested_box_draft`.
 *      d. Set `notification_triggered = TRUE` and record the timestamp.
 *      e. Insert a row in `notifications` for in-app notification display.
 *
 * USAGE (standalone):
 *   node server/cron-sweep.js             # Run immediately once
 *   node server/cron-sweep.js --schedule  # Start scheduler (cron: 00:00 daily)
 *
 * ENVIRONMENT VARIABLES (in .env):
 *   OPENAI_API_KEY   — OpenAI API key (optional; falls back to mock engine)
 *   SERVER_PORT      — EcoKnot server port for internal API calls (default 3000)
 *   DB_PATH          — Path to db.json (default: ./db.json)
 *   TZ               — Server timezone for cron scheduling (default: Asia/Ho_Chi_Minh)
 *
 * FOR PRODUCTION (PostgreSQL / Supabase):
 *   Replace the `readDb()` / `writeDb()` helpers below with pg/supabase queries.
 *   The SQL view `upcoming_events_14d` is provided in server/schema.sql for this.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE    = process.env.DB_PATH || path.join(__dirname, '..', 'db.json');
const SERVER_URL = `http://127.0.0.1:${process.env.SERVER_PORT || 3000}`;

// ──────────────────────────────────────────────────
// JSON File DB helpers (swap for pg/supabase queries)
// ──────────────────────────────────────────────────
function readDb() {
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// ──────────────────────────────────────────────────
// Mock Predictive Engine (fallback if no OPENAI_API_KEY)
// ──────────────────────────────────────────────────
function runMockPredictiveGifting(recipient, event, products) {
  const filtered = products.filter(p =>
    p.tags.some(t => recipient.interests.includes(t))
  );
  const items = filtered.length >= 3 ? filtered.slice(0, 3) : products.slice(0, 3);

  const reasoning = {};
  items.forEach(p => {
    reasoning[p.id] = `Được chọn vì phù hợp với phong cách ${recipient.style_preference} và sở thích của ${recipient.name}`;
  });

  const isVintage = recipient.style_preference === 'vintage';

  return {
    simulation: true,
    isPredictive: true,
    insight: `Món quà được thiết kế đặc biệt dành riêng cho ${recipient.name} (mối quan hệ ${recipient.relationship_type}), ` +
      `tập trung vào các sản phẩm thuộc sở thích ${(recipient.interests || []).join(', ')} ` +
      `với phong cách thiết kế ${recipient.style_preference}. ` +
      `Chỉ còn 14 ngày nữa là đến ${event.title} — đây là khoảnh khắc hoàn hảo để chuẩn bị!`,
    giftBox: {
      boxMaterial:   isVintage ? 'box-bamboo' : 'box-kraft',
      boxSize:       'size-m',
      boxColor:      isVintage ? '#dfd6c0' : '#8fad88',
      ribbon:        'rib-jute',
      ribbonColor:   '#bda58d'
    },
    productIds: items.map(p => p.id),
    reasoning
  };
}

// ──────────────────────────────────────────────────
// OpenAI Predictive Gift Generator
// ──────────────────────────────────────────────────
async function callOpenAI(recipient, event, products, apiKey) {
  const { OpenAI } = await import('openai');
  const openai = new OpenAI({ apiKey });

  const productManifest = products.map(p => ({
    id: p.id, name: p.name, price: p.price,
    tags: p.tags, description: p.description
  }));

  const systemPrompt = `Bạn là Trợ lý AI Gợi Ý Quà Tặng cá nhân hóa của EcoKnot Gifting.
Thiết kế một hộp quà độc bản dành riêng cho người nhận dựa trên hồ sơ mối quan hệ và dịp tặng quà được cung cấp.

Danh sách sản phẩm khả dụng (BẠN CHỈ ĐƯỢC CHỌN TỪ DANH SÁCH NÀY):
${JSON.stringify(productManifest, null, 2)}

Vỏ hộp (boxMaterial): "box-kraft" hoặc "box-bamboo"
Kích cỡ (boxSize): "size-s" (2-3 món) | "size-m" (4-5 món) | "size-l" (6-8 món)
Ruy-băng (ribbon): "rib-jute" | "rib-cotton"

Trả về duy nhất JSON có cấu trúc:
{
  "insight": "Đoạn phân tích tâm lý người nhận (3-4 câu)",
  "giftBox": { "boxMaterial": "...", "boxSize": "...", "boxColor": "#hex", "ribbon": "...", "ribbonColor": "#hex" },
  "productIds": ["id1", "id2", "id3"],
  "reasoning": { "id1": "Lý do...", "id2": "..." }
}`;

  const userPrompt = `Người nhận: ${recipient.name}
Mối quan hệ: ${recipient.relationship_type}
Sở thích: ${(recipient.interests || []).join(', ')}
Phong cách: ${recipient.style_preference}
Dịp: ${event.event_type} — "${event.title}"
Lịch sử quà đã tặng: ${JSON.stringify(recipient.gift_history || [])}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userPrompt   }
    ]
  });

  const parsed = JSON.parse(response.choices[0].message.content);

  // Anti-hallucination filter: remove invalid product IDs
  const validIds = new Set(products.map(p => p.id));
  parsed.productIds = (parsed.productIds || []).filter(id => validIds.has(id));
  if (parsed.productIds.length === 0) {
    parsed.productIds = products.slice(0, 3).map(p => p.id);
  }

  parsed.isPredictive = true;
  parsed.simulation   = false;
  return parsed;
}

// ──────────────────────────────────────────────────
// Core Sweep Logic (runs once per execution)
// ──────────────────────────────────────────────────
async function runDailySweep() {
  const startTime = Date.now();
  console.log(`\n[Care-lendar Cron] ========================================`);
  console.log(`[Care-lendar Cron] Sweep started at ${new Date().toISOString()}`);
  console.log(`[Care-lendar Cron] ========================================`);

  let db;
  try {
    db = readDb();
  } catch (err) {
    console.error('[Care-lendar Cron] ❌ Failed to read database:', err.message);
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const TARGET_DAYS_BEFORE = 14;

  // Filter events: only those NOT yet triggered AND exactly 14 days away
  const targetEvents = db.care_lendar_events.filter(ev => {
    if (ev.notification_triggered) return false;
    const evDate = new Date(ev.event_date);
    evDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round((evDate - today) / (1000 * 60 * 60 * 24));
    return diffDays === TARGET_DAYS_BEFORE;
  });

  console.log(`[Care-lendar Cron] Found ${targetEvents.length} event(s) at t-${TARGET_DAYS_BEFORE} to process.`);

  if (targetEvents.length === 0) {
    console.log(`[Care-lendar Cron] ✅ Nothing to process. Sweep complete.`);
    return;
  }

  const apiKey   = process.env.OPENAI_API_KEY;
  const results  = [];

  for (const event of targetEvents) {
    const recipient = db.customer_recipients.find(r => r.id === event.recipient_id);
    if (!recipient) {
      console.warn(`[Care-lendar Cron] ⚠️  Recipient ${event.recipient_id} not found for event ${event.id}. Skipping.`);
      continue;
    }

    console.log(`\n[Care-lendar Cron] Processing: "${event.title}" for ${recipient.name} (${event.event_date})`);

    let boxDraft;
    try {
      if (apiKey) {
        console.log(`[Care-lendar Cron] → Calling OpenAI GPT-4o...`);
        boxDraft = await callOpenAI(recipient, event, db.products, apiKey);
        console.log(`[Care-lendar Cron] ✅ OpenAI draft generated. Products: ${boxDraft.productIds.join(', ')}`);
      } else {
        console.log(`[Care-lendar Cron] → No OPENAI_API_KEY found. Using Mock Engine.`);
        boxDraft = runMockPredictiveGifting(recipient, event, db.products);
        console.log(`[Care-lendar Cron] ✅ Mock draft generated. Products: ${boxDraft.productIds.join(', ')}`);
      }
    } catch (err) {
      console.error(`[Care-lendar Cron] ❌ Gift generation failed for event ${event.id}:`, err.message);
      boxDraft = runMockPredictiveGifting(recipient, event, db.products);
    }

    // Persist draft to event
    event.suggested_box_draft       = boxDraft;
    event.notification_triggered    = true;
    event.notification_triggered_at = new Date().toISOString();

    // Create in-app notification
    const notification = {
      id:         Date.now() + Math.floor(Math.random() * 1000),
      user_id:    event.user_id,
      event_id:   event.id,
      title:      `🎁 Gợi ý quà tặng cho ${recipient.name}`,
      message:    `Chỉ còn 14 ngày nữa là đến ${event.title} của ${recipient.name}. ` +
                  `EcoKnot đã chuẩn bị sẵn một bản thiết kế hộp quà dành riêng cho ${recipient.name}, ` +
                  `bạn có muốn xem thử?`,
      channel:    'web',
      is_read:    false,
      created_at: new Date().toISOString()
    };

    db.notifications.unshift(notification);
    results.push({
      eventId:       event.id,
      eventTitle:    event.title,
      recipientName: recipient.name,
      draftProducts: boxDraft.productIds
    });

    console.log(`[Care-lendar Cron] 📬 Notification created: "${notification.title}"`);
  }

  // Persist all changes back to DB
  try {
    writeDb(db);
    console.log(`\n[Care-lendar Cron] 💾 Database updated successfully.`);
  } catch (err) {
    console.error('[Care-lendar Cron] ❌ Failed to write database:', err.message);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n[Care-lendar Cron] ========================================`);
  console.log(`[Care-lendar Cron] ✅ Sweep complete in ${elapsed}s`);
  console.log(`[Care-lendar Cron] Triggered: ${results.length} event(s)`);
  results.forEach((r, i) => {
    console.log(`[Care-lendar Cron]   ${i + 1}. [ID:${r.eventId}] "${r.eventTitle}" → ${r.recipientName} → Products: [${r.draftProducts.join(', ')}]`);
  });
  console.log(`[Care-lendar Cron] ========================================\n`);
}

// ──────────────────────────────────────────────────
// Entry Point
// ──────────────────────────────────────────────────
const args = process.argv.slice(2);

if (args.includes('--schedule')) {
  // Recurring scheduler using dynamic import of node-cron
  // Install: npm install node-cron
  // Cron: "0 0 * * *"  → runs at 00:00 every day
  console.log('[Care-lendar Cron] Starting scheduled mode (runs daily at 00:00)...');
  console.log('[Care-lendar Cron] Timezone: ' + (process.env.TZ || 'Asia/Ho_Chi_Minh'));

  import('node-cron').then(({ default: cron }) => {
    const TIMEZONE = process.env.TZ || 'Asia/Ho_Chi_Minh';

    // Run immediately on start to catch any missed events
    console.log('[Care-lendar Cron] Running initial sweep on startup...');
    runDailySweep().catch(console.error);

    // Schedule daily at 00:00
    cron.schedule('0 0 * * *', () => {
      runDailySweep().catch(err => {
        console.error('[Care-lendar Cron] Scheduled sweep failed:', err);
      });
    }, { timezone: TIMEZONE });

    console.log('[Care-lendar Cron] ✅ Scheduler active. Waiting for next trigger...');
  }).catch(() => {
    console.error('[Care-lendar Cron] node-cron not installed. Run: npm install node-cron');
    console.error('[Care-lendar Cron] Falling back to one-time execution...');
    runDailySweep().catch(console.error);
  });

} else {
  // One-time immediate execution (default)
  runDailySweep().catch(err => {
    console.error('[Care-lendar Cron] Fatal error:', err);
    process.exit(1);
  });
}
