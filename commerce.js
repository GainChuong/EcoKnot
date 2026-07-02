// ============================================================
// EcoKnot Commerce Module
// Cart Panel, Checkout, VietQR, Tracking, Account, Invoice
// ============================================================

(function() {
  'use strict';

  // ─── Constants ───────────────────────────────────────────────────────────────
  var SHIP_FEES = { standard: 35000, express: 55000, same_day: 75000 };

  var STATUS_COLORS = {
    pending_payment: '#f59e0b', pending_quote: '#8b5cf6',
    paid: '#10b981', in_production: '#059669', eco_packaging: '#0d9488',
    dispatched: '#0891b2', delivered: '#e11d48', cancelled: '#6b7280'
  };
  var STATUS_LABELS = {
    pending_payment: 'Ch\u1edd thanh to\u00e1n', pending_quote: 'Ch\u1edd b\u00e1o gi\u00e1 B2B',
    paid: '\u0110\u00e3 ti\u1ebfp nh\u1eadn', in_production: '\u0110ang chu\u1ea9n b\u1ecb',
    eco_packaging: '\u0110\u00f3ng g\u00f3i', dispatched: '\u0110ang giao',
    delivered: '\u0110\u00e3 giao', cancelled: '\u0110\u00e3 h\u1ee7y'
  };
  var STATUS_ICONS = {
    pending_payment: 'fa-clock', pending_quote: 'fa-file-invoice',
    paid: 'fa-circle-check', in_production: 'fa-leaf',
    eco_packaging: 'fa-box-open', dispatched: 'fa-truck',
    delivered: 'fa-heart', cancelled: 'fa-ban'
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  function fmt(n) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);
  }

  function getSubtotal() {
    if (!window.state || !window.state.cart) return 0;
    return window.state.cart.reduce(function(s, i) { return s + (i.price || 0) * (i.qty || 1); }, 0);
  }

  function getEcoMetrics() {
    var plastic = 0, co2 = 0;
    if (window.state && window.state.cart) {
      window.state.cart.forEach(function(item) {
        if (item.metrics) {
          plastic += (item.metrics.virgin_plastic_saved_g || item.metrics.virginPlasticReduction || 0) * (item.qty || 1);
          co2 += (item.metrics.co2_saved_kg || item.metrics.carbonFootprintAvoided || 0) * (item.qty || 1);
        }
      });
    }
    return { plastic: Math.round(plastic), co2: co2.toFixed(2) };
  }

  function saveCart() {
    if (window.saveStateToStorage) window.saveStateToStorage();
    if (window.updateCartCount) window.updateCartCount();
  }

  function toast(msg) {
    if (window.showToast) window.showToast(msg);
  }

  function nav(route) {
    if (window.navigateTo) window.navigateTo(route);
  }

  // ─── Cart Panel ───────────────────────────────────────────────────────────────
  function openCartPanel() {
    if (window.state) window.state.cartPanelOpen = true;
    var panel = document.getElementById('cart-panel');
    var overlay = document.getElementById('cart-overlay');
    if (panel) panel.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderCartPanelItems();
  }

  function closeCartPanel() {
    if (window.state) window.state.cartPanelOpen = false;
    var panel = document.getElementById('cart-panel');
    var overlay = document.getElementById('cart-overlay');
    if (panel) panel.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function addToCart(cartItem) {
    if (!window.state) window.state = {};
    if (!window.state.cart) window.state.cart = [];
    if (!cartItem.id) cartItem.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
    var idx = window.state.cart.findIndex(function(i) { return i.id === cartItem.id; });
    if (idx !== -1) {
      window.state.cart[idx].qty = (window.state.cart[idx].qty || 1) + (cartItem.qty || 1);
    } else {
      window.state.cart.push(Object.assign({}, cartItem, { qty: cartItem.qty || 1 }));
    }
    saveCart();
    toast('\u0110\u00e3 th\u00eam v\u00e0o gi\u1ecf h\u00e0ng!');
    openCartPanel();
  }

  function removeCartItem(itemId) {
    if (!window.state || !window.state.cart) return;
    window.state.cart = window.state.cart.filter(function(i) { return i.id !== itemId; });
    saveCart();
    renderCartPanelItems();
  }

  function updateCartItemQty(itemId, delta) {
    if (!window.state || !window.state.cart) return;
    var idx = window.state.cart.findIndex(function(i) { return i.id === itemId; });
    if (idx === -1) return;
    window.state.cart[idx].qty = Math.max(1, (window.state.cart[idx].qty || 1) + delta);
    saveCart();
    renderCartPanelItems();
  }

  function renderCartPanelItems() {
    var listEl = document.getElementById('cart-items-list');
    var emptyEl = document.getElementById('cart-empty-state');
    var footerEl = document.getElementById('cart-panel-footer');
    var countEl = document.getElementById('cart-panel-count');
    if (!listEl) return;

    var cart = (window.state && window.state.cart) ? window.state.cart : [];
    var totalItems = cart.reduce(function(t, i) { return t + (i.qty || 1); }, 0);
    if (countEl) countEl.textContent = totalItems + ' m\u00f3n';

    if (cart.length === 0) {
      listEl.innerHTML = '';
      if (emptyEl) emptyEl.style.display = 'flex';
      if (footerEl) footerEl.style.display = 'none';
      return;
    }
    if (emptyEl) emptyEl.style.display = 'none';
    if (footerEl) footerEl.style.display = 'block';

    listEl.innerHTML = cart.map(function(item) {
      var products = item.items || [];
      var boxIcon = item.box === 'box-bamboo' ? '\ud83c\udf3f' : '\ud83d\udce6';
      var ribbonColor = item.ribbonColor || '#bda58d';
      var productPills = products.slice(0, 4).map(function(p) {
        return '<span class="cart-product-pill">' + (p.name || '') + '</span>';
      }).join('');
      var morePills = products.length > 4 ? '<span class="cart-product-pill">+' + (products.length - 4) + ' m\u00f3n</span>' : '';
      var cardText = item.cardText ? '<div class="cart-item-card-text">\u201c' + item.cardText + '\u201d</div>' : '';

      return '<div class="cart-item-card">' +
        '<div class="cart-item-header">' +
          '<div class="cart-item-box-preview" style="background-color:' + (item.boxColor || '#f3ede2') + ';">' +
            '<span>' + boxIcon + '</span>' +
            '<div class="cart-item-box-ribbon" style="background-color:' + ribbonColor + ';"></div>' +
          '</div>' +
          '<div class="cart-item-info">' +
            '<div class="cart-item-name">H\u1ed9p qu\u00e0 (' + products.length + ' s\u1ea3n ph\u1ea9m)</div>' +
            '<div class="cart-item-meta">' + (item.box === 'box-bamboo' ? 'Tre \u0111an' : 'Kraft FSC') + ' &middot; ' + (item.ribbon === 'rib-cotton' ? 'D\u00e2y cotton' : 'S\u1ee3i \u0111ay') + '</div>' +
          '</div>' +
          '<div class="cart-item-price">' + fmt((item.price || 0) * (item.qty || 1)) + '</div>' +
        '</div>' +
        (products.length > 0 ? '<div class="cart-item-products">' + productPills + morePills + '</div>' : '') +
        cardText +
        '<div class="cart-item-actions">' +
          '<div class="cart-qty-control">' +
            '<button class="cart-qty-btn" onclick="window.EC.updateCartItemQty(\'' + item.id + '\', -1)"><i class="fa-solid fa-minus"></i></button>' +
            '<span class="cart-qty-value">' + (item.qty || 1) + '</span>' +
            '<button class="cart-qty-btn" onclick="window.EC.updateCartItemQty(\'' + item.id + '\', 1)"><i class="fa-solid fa-plus"></i></button>' +
          '</div>' +
          '<button class="cart-item-remove" onclick="window.EC.removeCartItem(\'' + item.id + '\')"><i class="fa-solid fa-trash-can"></i> X\u00f3a</button>' +
        '</div>' +
      '</div>';
    }).join('');

    var subtotal = getSubtotal();
    var deliveryMethod = (window.state && window.state.checkout && window.state.checkout.deliveryMethod) || 'standard';
    var shipFee = SHIP_FEES[deliveryMethod] || 35000;
    var eco = getEcoMetrics();

    var subtotalEl = document.getElementById('cart-subtotal');
    var totalEl = document.getElementById('cart-total');
    var ecoEl = document.getElementById('cart-eco-text');
    if (subtotalEl) subtotalEl.textContent = fmt(subtotal);
    if (totalEl) totalEl.textContent = fmt(subtotal + shipFee);
    if (ecoEl) ecoEl.innerHTML = 'Gi\u1ecf h\u00e0ng n\u00e0y ti\u1ebft ki\u1ec7m <strong>' + eco.plastic + 'g</strong> nh\u1ef1a nguy\u00ean sinh';
  }

  // Bind cart panel events
  function initCartPanel() {
    var closeBtn = document.getElementById('cart-panel-close');
    var overlay = document.getElementById('cart-overlay');
    var toggleBtn = document.getElementById('cart-toggle-btn');
    var checkoutBtn = document.getElementById('cart-checkout-btn');
    var continueBtn = document.getElementById('cart-continue-btn');
    var emptyCta = document.getElementById('cart-empty-cta');

    if (closeBtn) closeBtn.addEventListener('click', closeCartPanel);
    if (overlay) overlay.addEventListener('click', closeCartPanel);
    if (toggleBtn) toggleBtn.addEventListener('click', function() {
      var s = window.state;
      if (s && s.cartPanelOpen) closeCartPanel();
      else openCartPanel();
    });
    if (checkoutBtn) checkoutBtn.addEventListener('click', function() {
      var cart = (window.state && window.state.cart) || [];
      if (cart.length === 0) { toast('Gi\u1ecf h\u00e0ng \u0111ang tr\u1ed1ng!'); return; }
      closeCartPanel();
      nav('checkout');
    });
    if (continueBtn) continueBtn.addEventListener('click', closeCartPanel);
    if (emptyCta) emptyCta.addEventListener('click', function() {
      closeCartPanel();
      nav('customizer');
    });
  }

  // ─── Checkout ─────────────────────────────────────────────────────────────────
  function renderCheckout() {
    var view = document.getElementById('app-view');
    if (!view) return;
    if (!window.state.checkout) window.state.checkout = {};
    var step = window.state.checkout.step || 1;
    var deliveryMethod = window.state.checkout.deliveryMethod || 'standard';
    var shipFee = SHIP_FEES[deliveryMethod] || 35000;
    var subtotal = getSubtotal();
    var total = subtotal + shipFee - (window.state.checkout.couponDiscount || 0);

    var stepLabels = ['Giao h\u00e0ng', 'V\u1eadn chuy\u1ec3n', 'Thanh to\u00e1n', 'X\u00e1c nh\u1eadn'];
    var stepperHtml = stepLabels.map(function(label, i) {
      var num = i + 1;
      var cls = num < step ? 'completed' : num === step ? 'active' : '';
      return '<div class="stepper-step ' + cls + '">' +
        '<div class="stepper-dot">' + (num < step ? '<i class="fa-solid fa-check"></i>' : num) + '</div>' +
        '<div class="stepper-label">' + label + '</div>' +
      '</div>';
    }).join('');

    var summaryHtml =
      '<div class="checkout-summary-card">' +
      '<h4><i class="fa-solid fa-basket-shopping" style="color:var(--color-accent)"></i> T\u00f3m t\u1eaft</h4>' +
      ((window.state.cart || []).map(function(item) {
        return '<div class="summary-item">' +
          '<div class="summary-item-thumb">\ud83d\udce6</div>' +
          '<div class="summary-item-info"><div class="summary-item-name">H\u1ed9p qu\u00e0 (' + ((item.items || []).length) + ' SP)</div><div class="summary-item-sub">x' + (item.qty || 1) + '</div></div>' +
          '<div class="summary-item-price">' + fmt((item.price || 0) * (item.qty || 1)) + '</div>' +
        '</div>';
      }).join('')) +
      '<hr class="summary-divider">' +
      '<div class="summary-row"><span>T\u1ea1m t\u00ednh</span><span>' + fmt(subtotal) + '</span></div>' +
      '<div class="summary-row"><span>V\u1eadn chuy\u1ec3n</span><span>' + fmt(shipFee) + '</span></div>' +
      '<div class="summary-row total"><span>T\u1ed5ng c\u1ed9ng</span><span>' + fmt(total) + '</span></div>' +
      '</div>';

    var formHtml = '';
    var si = window.state.checkout.shippingInfo || {};

    if (step === 1) {
      formHtml =
        '<div class="checkout-form-card">' +
        '<h3><i class="fa-solid fa-location-dot"></i> Th\u00f4ng tin giao h\u00e0ng</h3>' +
        '<div class="form-grid-2">' +
          '<div class="form-group" style="grid-column:1/-1"><label>H\u1ecd v\u00e0 t\u00ean <span class="required">*</span></label><input type="text" id="ck-name" class="form-control" value="' + (si.name || '') + '" placeholder="Nguy\u1ec5n V\u0103n A"></div>' +
          '<div class="form-group"><label>S\u1ed1 \u0111i\u1ec7n tho\u1ea1i <span class="required">*</span></label><input type="tel" id="ck-phone" class="form-control" value="' + (si.phone || '') + '" placeholder="09xxxxxxxx"></div>' +
          '<div class="form-group"><label>Email <span class="required">*</span></label><input type="email" id="ck-email" class="form-control" value="' + (si.email || (window.state.user ? window.state.user.email : '')) + '" placeholder="email@example.com"></div>' +
          '<div class="form-group" style="grid-column:1/-1"><label>T\u1ec9nh / Th\u00e0nh ph\u1ed1 <span class="required">*</span></label><input type="text" id="ck-province" class="form-control" value="' + (si.province || '') + '" placeholder="TP. H\u1ed3 Ch\u00ed Minh"></div>' +
          '<div class="form-group"><label>Qu\u1eadn / Huy\u1ec7n</label><input type="text" id="ck-district" class="form-control" value="' + (si.district || '') + '" placeholder="Qu\u1eadn 1"></div>' +
          '<div class="form-group"><label>Ph\u01b0\u1eddng / X\u00e3</label><input type="text" id="ck-ward" class="form-control" value="' + (si.ward || '') + '" placeholder="Ph\u01b0\u1eddng B\u1ebfn Ngh\u00e9"></div>' +
          '<div class="form-group" style="grid-column:1/-1"><label>S\u1ed1 nh\u00e0, t\u00ean \u0111\u01b0\u1eddng <span class="required">*</span></label><input type="text" id="ck-address" class="form-control" value="' + (si.address || '') + '" placeholder="123 L\u00ea L\u1ee3i"></div>' +
          '<div class="form-group" style="grid-column:1/-1"><label>Ghi ch\u00fa</label><input type="text" id="ck-note" class="form-control" value="' + (si.note || '') + '" placeholder="C\u1ea7u thang m\u00e1y..."></div>' +
        '</div>' +
        '<div class="checkout-nav">' +
          '<button class="btn btn-outline" onclick="window.navigateTo(\'home\')"><i class="fa-solid fa-arrow-left"></i> H\u1ee7y</button>' +
          '<button class="btn btn-primary" id="ck-step1-next">Ti\u1ebfp theo <i class="fa-solid fa-arrow-right"></i></button>' +
        '</div></div>';

    } else if (step === 2) {
      var dm = window.state.checkout.deliveryMethod || 'standard';
      var opts = [
        { id: 'standard', name: 'Ti\u00eau chu\u1ea9n (3-5 ng\u00e0y)', icon: 'fa-truck', fee: 35000 },
        { id: 'express', name: 'Nhanh (1-2 ng\u00e0y)', icon: 'fa-bolt', fee: 55000 },
        { id: 'same_day', name: 'Trong ng\u00e0y', icon: 'fa-rocket', fee: 75000 }
      ];
      formHtml =
        '<div class="checkout-form-card">' +
        '<h3><i class="fa-solid fa-truck"></i> Ph\u01b0\u01a1ng th\u1ee9c v\u1eadn chuy\u1ec3n</h3>' +
        '<div class="delivery-options">' +
        opts.map(function(opt) {
          return '<div class="delivery-option-card ' + (dm === opt.id ? 'selected' : '') + '" onclick="window.EC.selectDelivery(\'' + opt.id + '\', this)">' +
            '<div class="delivery-option-icon"><i class="fa-solid ' + opt.icon + '"></i></div>' +
            '<div class="delivery-option-info"><div class="delivery-option-name">' + opt.name + '</div></div>' +
            '<div class="delivery-option-price">' + fmt(opt.fee) + '</div>' +
          '</div>';
        }).join('') +
        '</div>' +
        '<div class="checkout-nav">' +
          '<button class="btn btn-outline" onclick="window.EC.goCheckoutStep(1)"><i class="fa-solid fa-arrow-left"></i> Quay l\u1ea1i</button>' +
          '<button class="btn btn-primary" onclick="window.EC.goCheckoutStep(3)">Ti\u1ebfp theo <i class="fa-solid fa-arrow-right"></i></button>' +
        '</div></div>';

    } else if (step === 3) {
      var pm = window.state.checkout.paymentMethod || 'vietqr';
      var payOpts = [
        { id: 'vietqr', name: 'VietQR / Chuy\u1ec3n kho\u1ea3n', desc: 'Qu\u00e9t QR \u2014 t\u1ef1 \u0111\u1ed9ng x\u00e1c nh\u1eadn', icon: 'fa-qrcode', badge: '\u26a1 Nhanh nh\u1ea5t' },
        { id: 'cod', name: 'Thanh to\u00e1n khi nh\u1eadn h\u00e0ng (COD)', desc: 'Tr\u1ea3 ti\u1ec1n m\u1eb7t cho ng\u01b0\u1eddi giao', icon: 'fa-money-bill-wave', badge: '' },
        { id: 'b2b_quote', name: 'Y\u00eau c\u1ea7u b\u00e1o gi\u00e1 & VAT', desc: 'D\u00e0nh ri\u00eang cho doanh nghi\u1ec7p', icon: 'fa-file-invoice', badge: 'B2B' }
      ];
      formHtml =
        '<div class="checkout-form-card">' +
        '<h3><i class="fa-solid fa-credit-card"></i> Ph\u01b0\u01a1ng th\u1ee9c thanh to\u00e1n</h3>' +
        '<div class="payment-options">' +
        payOpts.map(function(opt) {
          return '<div class="payment-option-card ' + (pm === opt.id ? 'selected' : '') + '" onclick="window.EC.selectPayment(\'' + opt.id + '\', this)">' +
            '<div class="payment-option-icon"><i class="fa-solid ' + opt.icon + '"></i></div>' +
            '<div class="payment-option-info"><div class="payment-option-name">' + opt.name + '</div><div class="payment-option-desc">' + opt.desc + '</div></div>' +
            (opt.badge ? '<span class="payment-option-badge">' + opt.badge + '</span>' : '') +
          '</div>';
        }).join('') +
        '</div>' +
        (pm === 'b2b_quote' ? '<div style="margin-top:1rem;padding:1rem;background:#faf8f5;border-radius:8px;border:1px solid var(--color-border-light);">' +
          '<div class="form-group" style="margin-bottom:0.75rem"><label>T\u00ean c\u00f4ng ty</label><input type="text" id="ck-company" class="form-control" placeholder="C\u00f4ng ty TNHH ABC"></div>' +
          '<div class="form-group"><label>M\u00e3 s\u1ed1 thu\u1ebf</label><input type="text" id="ck-taxid" class="form-control" placeholder="0312345678"></div>' +
        '</div>' : '') +
        '<div class="checkout-nav">' +
          '<button class="btn btn-outline" onclick="window.EC.goCheckoutStep(2)"><i class="fa-solid fa-arrow-left"></i> Quay l\u1ea1i</button>' +
          '<button class="btn btn-primary" onclick="window.EC.goCheckoutStep(4)">Ti\u1ebfp theo <i class="fa-solid fa-arrow-right"></i></button>' +
        '</div></div>';

    } else if (step === 4) {
      var pm4 = window.state.checkout.paymentMethod || 'vietqr';
      var pmLabels = { vietqr: 'VietQR / Chuy\u1ec3n kho\u1ea3n', cod: 'COD', b2b_quote: 'B\u00e1o gi\u00e1 & VAT' };
      formHtml =
        '<div class="checkout-form-card">' +
        '<h3><i class="fa-solid fa-circle-check"></i> X\u00e1c nh\u1eadn \u0111\u01a1n h\u00e0ng</h3>' +
        '<div style="font-size:0.87rem;color:var(--color-text-light);display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1.5rem;">' +
          '<div><strong>Giao t\u1edbi:</strong> ' + (si.name || '') + ', ' + (si.phone || '') + '</div>' +
          '<div><strong>\u0110\u1ecba ch\u1ec9:</strong> ' + (si.address || '') + ', ' + (si.province || '') + '</div>' +
          '<div><strong>V\u1eadn chuy\u1ec3n:</strong> ' + deliveryMethod + '</div>' +
          '<div><strong>Thanh to\u00e1n:</strong> ' + (pmLabels[pm4] || pm4) + '</div>' +
        '</div>' +
        '<div class="checkout-nav">' +
          '<button class="btn btn-outline" onclick="window.EC.goCheckoutStep(3)"><i class="fa-solid fa-arrow-left"></i> Quay l\u1ea1i</button>' +
          '<button class="btn btn-primary" id="ck-place-order"><i class="fa-solid fa-paper-plane"></i> \u0110\u1eb7t h\u00e0ng ngay</button>' +
        '</div></div>';
    }

    view.innerHTML =
      '<div class="checkout-container">' +
      '<div style="text-align:center;margin-bottom:0.5rem;"><h1 style="font-family:var(--font-title);font-size:1.6rem;font-weight:800;color:var(--color-text);"><i class="fa-solid fa-leaf" style="color:var(--color-accent)"></i> Thanh to\u00e1n</h1></div>' +
      '<div class="checkout-stepper">' + stepperHtml + '</div>' +
      '<div class="checkout-layout"><div>' + formHtml + '</div>' + summaryHtml + '</div>' +
      '</div>';

    if (step === 1) {
      var nextBtn = document.getElementById('ck-step1-next');
      if (nextBtn) nextBtn.addEventListener('click', function() {
        var name = (document.getElementById('ck-name') || {}).value || '';
        var phone = (document.getElementById('ck-phone') || {}).value || '';
        var email = (document.getElementById('ck-email') || {}).value || '';
        var province = (document.getElementById('ck-province') || {}).value || '';
        var address = (document.getElementById('ck-address') || {}).value || '';
        if (!name.trim() || !phone.trim() || !email.trim() || !province.trim() || !address.trim()) {
          toast('Vui l\u00f2ng \u0111i\u1ec1n \u0111\u1ee7 th\u00f4ng tin b\u1eaft bu\u1ed9c!');
          return;
        }
        window.state.checkout.shippingInfo = {
          name: name.trim(), phone: phone.trim(), email: email.trim(),
          province: province.trim(),
          district: ((document.getElementById('ck-district') || {}).value || '').trim(),
          ward: ((document.getElementById('ck-ward') || {}).value || '').trim(),
          address: address.trim(),
          note: ((document.getElementById('ck-note') || {}).value || '').trim()
        };
        goCheckoutStep(2);
      });
    }
    if (step === 4) {
      var placeBtn = document.getElementById('ck-place-order');
      if (placeBtn) placeBtn.addEventListener('click', placeOrder);
    }
  }

  function goCheckoutStep(step) {
    if (!window.state.checkout) window.state.checkout = {};
    window.state.checkout.step = step;
    renderCheckout();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function selectDelivery(method, el) {
    document.querySelectorAll('.delivery-option-card').forEach(function(c) { c.classList.remove('selected'); });
    if (el) el.classList.add('selected');
    window.state.checkout.deliveryMethod = method;
    window.state.checkout.shipFee = SHIP_FEES[method] || 35000;
  }

  function selectPayment(method, el) {
    document.querySelectorAll('.payment-option-card').forEach(function(c) { c.classList.remove('selected'); });
    if (el) el.classList.add('selected');
    window.state.checkout.paymentMethod = method;
    renderCheckout();
  }

  async function placeOrder() {
    var si = window.state.checkout.shippingInfo || {};
    var pm = window.state.checkout.paymentMethod || 'vietqr';
    var dm = window.state.checkout.deliveryMethod || 'standard';
    var shipFee = SHIP_FEES[dm];
    var subtotal = getSubtotal();
    var total = subtotal + shipFee;
    var placeBtn = document.getElementById('ck-place-order');
    if (placeBtn) { placeBtn.disabled = true; placeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> \u0110ang x\u1eed l\u00fd...'; }

    try {
      var res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: window.state.user ? window.state.user.email : null,
          customerName: si.name, customerPhone: si.phone, customerEmail: si.email,
          shippingAddress: si.address, province: si.province, district: si.district, ward: si.ward,
          deliveryMethod: dm, paymentMethod: pm, subtotal: subtotal, shipFee: shipFee,
          discount: 0, notes: si.note || '',
          vatInvoiceRequired: pm === 'b2b_quote',
          companyName: (document.getElementById('ck-company') || {}).value || null,
          companyTaxId: (document.getElementById('ck-taxid') || {}).value || null,
          cartItems: window.state.cart || []
        })
      });
      if (!res.ok) throw new Error('failed');
      var data = await res.json();
      window.state.cart = [];
      saveCart();
      showOrderResult(data);
    } catch (err) {
      toast('\u0110\u1eb7t h\u00e0ng th\u1ea5t b\u1ea1i. Vui l\u00f2ng th\u1eed l\u1ea1i!');
      if (placeBtn) { placeBtn.disabled = false; placeBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> \u0110\u1eb7t h\u00e0ng ngay'; }
    }
  }

  function showOrderResult(data) {
    var view = document.getElementById('app-view');
    if (!view) return;
    if (data.status === 'pending_payment' && data.vietqrUrl) {
      var seconds = 900;
      view.innerHTML =
        '<div class="checkout-container"><div class="vietqr-container" style="max-width:480px;margin:2rem auto;">' +
        '<div class="vietqr-title">\ud83c\udf3f Qu\u00e9t m\u00e3 VietQR \u0111\u1ec3 thanh to\u00e1n</div>' +
        '<div class="vietqr-subtitle">M\u00e3 QR \u0111\u00e3 \u0111i\u1ec1n s\u1eb5n s\u1ed1 ti\u1ec1n v\u00e0 n\u1ed9i dung chuy\u1ec3n kho\u1ea3n</div>' +
        '<div class="vietqr-qr-wrap"><img src="' + data.vietqrUrl + '" class="vietqr-qr-img" alt="VietQR" onerror="this.parentElement.innerHTML=\'<div class=vietqr-loading>\ud83d\udcf7</div>\'"></div>' +
        '<div class="vietqr-amount">' + fmt(data.total) + '</div>' +
        '<div class="vietqr-ref">N\u1ed9i dung: ECOKNOT ' + data.orderId + '</div>' +
        '<div class="vietqr-bank-info"><i class="fa-solid fa-building-columns"></i> NH MB Bank &middot; TK: 0912345678</div>' +
        '<div class="vietqr-timer"><i class="fa-regular fa-clock"></i> H\u1ebft hi\u1ec7u l\u1ef1c: <span class="vietqr-timer-val" id="vietqr-countdown">15:00</span></div>' +
        '<div style="font-size:0.78rem;color:var(--color-text-light);margin-bottom:1rem;">M\u00e3 \u0111\u01a1n: <strong>' + data.orderId + '</strong></div>' +
        '<button class="btn-manual-confirm" id="manual-confirm-btn"><i class="fa-solid fa-circle-check"></i> T\u00f4i \u0111\u00e3 chuy\u1ec3n kho\u1ea3n (X\u00e1c nh\u1eadn th\u1ee7 c\u00f4ng)</button>' +
        '<div style="margin-top:0.75rem;font-size:0.72rem;color:var(--color-text-light);"><i class="fa-solid fa-flask-vial"></i> Dev mode: Nh\u1ea5n \u0111\u1ec3 gi\u1ea3 l\u1eadp thanh to\u00e1n th\u00e0nh c\u00f4ng</div>' +
        '</div></div>';

      var intv = setInterval(function() {
        seconds--;
        var m = String(Math.floor(seconds / 60)).padStart(2, '0');
        var s = String(seconds % 60).padStart(2, '0');
        var el = document.getElementById('vietqr-countdown');
        if (el) el.textContent = m + ':' + s;
        if (seconds <= 0) { clearInterval(intv); nav('home'); }
      }, 1000);

      var confirmBtn = document.getElementById('manual-confirm-btn');
      var orderId = data.orderId;
      if (confirmBtn) confirmBtn.addEventListener('click', async function() {
        clearInterval(intv);
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> \u0110ang x\u00e1c nh\u1eadn...';
        try {
          var r = await fetch('/api/payment/manual-confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: orderId })
          });
          var result = await r.json();
          if (result.success) showOrderSuccessScreen(orderId);
          else toast(result.error || 'X\u00e1c nh\u1eadn th\u1ea5t b\u1ea1i!');
        } catch (e) { toast('L\u1ed7i k\u1ebft n\u1ed1i!'); }
      });
    } else {
      showOrderSuccessScreen(data.orderId, data.status);
    }
  }

  function showOrderSuccessScreen(orderId, status) {
    var view = document.getElementById('app-view');
    if (!view) return;
    var isBiz = status === 'pending_quote';
    view.innerHTML =
      '<div class="checkout-container"><div class="order-success-screen">' +
      '<div class="order-success-icon">' + (isBiz ? '\ud83d\udcc4' : '\ud83c\udf89') + '</div>' +
      '<div class="order-success-title">' + (isBiz ? 'Y\u00eau c\u1ea7u b\u00e1o gi\u00e1 \u0111\u00e3 g\u1eedi!' : '\u0110\u1eb7t h\u00e0ng th\u00e0nh c\u00f4ng!') + '</div>' +
      '<p style="color:var(--color-text-light);font-size:0.88rem;max-width:400px;margin:0 auto;">' +
      (isBiz ? 'EcoKnot s\u1ebd li\u00ean h\u1ec7 trong v\u00f2ng 24 gi\u1edd \u0111\u1ec3 x\u00e1c nh\u1eadn b\u00e1o gi\u00e1 v\u00e0 h\u00f3a \u0111\u01a1n VAT.' : 'C\u1ea3m \u01a1n b\u1ea1n \u0111\u00e3 ch\u1ecdn EcoKnot! H\u1ed9p qu\u00e0 xanh s\u1ebd \u0111\u01b0\u1ee3c chu\u1ea9n b\u1ecb v\u1edbi t\u00ecnh y\u00eau th\u01b0\u01a1ng.') + '</p>' +
      '<div class="order-success-id">' + orderId + '</div>' +
      '<div class="order-success-actions">' +
        '<button class="btn btn-primary" onclick="window.state.trackingPrefill=\'' + orderId + '\';window.navigateTo(\'tracking\')"><i class="fa-solid fa-location-dot"></i> Theo d\u00f5i \u0111\u01a1n</button>' +
        '<button class="btn btn-outline" onclick="window.navigateTo(\'home\')"><i class="fa-solid fa-home"></i> V\u1ec1 trang ch\u1ee7</button>' +
      '</div></div></div>';
  }

  // ─── Order Tracking ────────────────────────────────────────────────────────────
  function renderTracking() {
    var view = document.getElementById('app-view');
    if (!view) return;
    var prefill = (window.state && window.state.trackingPrefill) || '';
    if (window.state) window.state.trackingPrefill = null;

    view.innerHTML =
      '<div class="tracking-page">' +
      '<div class="tracking-search-card">' +
        '<h2><i class="fa-solid fa-location-dot" style="color:var(--color-accent)"></i> Theo d\u00f5i \u0111\u01a1n h\u00e0ng</h2>' +
        '<p>Nh\u1eadp m\u00e3 \u0111\u01a1n h\u00e0ng v\u00e0 s\u1ed1 \u0111i\u1ec7n tho\u1ea1i ho\u1eb7c email \u0111\u1ec3 ki\u1ec3m tra. Kh\u00f4ng c\u1ea7n \u0111\u0103ng nh\u1eadp.</p>' +
        '<div class="tracking-search-row">' +
          '<div class="form-group"><label>M\u00e3 \u0111\u01a1n h\u00e0ng</label><input type="text" id="track-order-id" class="form-control" value="' + prefill + '" placeholder="EK-20260620-1001"></div>' +
          '<div class="form-group"><label>S\u1ed1 \u0111i\u1ec7n tho\u1ea1i ho\u1eb7c Email</label><input type="text" id="track-contact" class="form-control" placeholder="09xxxxxxxx ho\u1eb7c email"></div>' +
          '<button class="btn btn-primary" id="track-search-btn" style="height:42px;align-self:end;"><i class="fa-solid fa-magnifying-glass"></i> Tra c\u1ee9u</button>' +
        '</div>' +
        '<div id="track-error" style="display:none;margin-top:0.75rem;color:var(--color-danger);font-size:0.82rem;"></div>' +
      '</div>' +
      '<div id="tracking-result-area"></div></div>';

    document.getElementById('track-search-btn').addEventListener('click', performOrderTrack);
    var contactEl = document.getElementById('track-contact');
    var orderIdEl = document.getElementById('track-order-id');
    if (contactEl) contactEl.addEventListener('keydown', function(e) { if (e.key === 'Enter') performOrderTrack(); });
    if (orderIdEl) orderIdEl.addEventListener('keydown', function(e) { if (e.key === 'Enter') performOrderTrack(); });

    if (prefill && window.state && window.state.user) {
      if (contactEl) contactEl.value = window.state.user.email || '';
      performOrderTrack();
    }
  }

  async function performOrderTrack() {
    var orderIdEl = document.getElementById('track-order-id');
    var contactEl = document.getElementById('track-contact');
    var errorEl = document.getElementById('track-error');
    var resultArea = document.getElementById('tracking-result-area');
    var searchBtn = document.getElementById('track-search-btn');

    var orderId = orderIdEl ? orderIdEl.value.trim() : '';
    var contact = contactEl ? contactEl.value.trim() : '';

    if (!orderId) { if (errorEl) { errorEl.textContent = 'Vui l\u00f2ng nh\u1eadp m\u00e3 \u0111\u01a1n h\u00e0ng'; errorEl.style.display = 'block'; } return; }
    if (!contact) { if (errorEl) { errorEl.textContent = 'Vui l\u00f2ng nh\u1eadp s\u1ed1 \u0111i\u1ec7n tho\u1ea1i ho\u1eb7c email'; errorEl.style.display = 'block'; } return; }
    if (errorEl) errorEl.style.display = 'none';
    if (searchBtn) { searchBtn.disabled = true; searchBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>'; }
    if (resultArea) resultArea.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--color-text-light)"><i class="fa-solid fa-spinner fa-spin" style="font-size:1.5rem"></i></div>';

    try {
      var isEmail = contact.indexOf('@') !== -1;
      var res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderId, phone: isEmail ? null : contact, email: isEmail ? contact : null })
      });
      if (!res.ok) {
        var err = await res.json();
        if (errorEl) { errorEl.textContent = err.error || 'Kh\u00f4ng t\u00ecm th\u1ea5y \u0111\u01a1n h\u00e0ng'; errorEl.style.display = 'block'; }
        if (resultArea) resultArea.innerHTML = '';
        return;
      }
      var data = await res.json();
      renderTrackingResult(data, resultArea);
    } catch (e) {
      if (errorEl) { errorEl.textContent = 'L\u1ed7i k\u1ebft n\u1ed1i. Th\u1eed l\u1ea1i sau.'; errorEl.style.display = 'block'; }
      if (resultArea) resultArea.innerHTML = '';
    } finally {
      if (searchBtn) { searchBtn.disabled = false; searchBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Tra c\u1ee9u'; }
    }
  }

  function renderTrackingResult(data, container) {
    if (!container) return;
    var order = data.order;
    var timeline = data.timeline || [];
    var sm = order.statusMeta || {};

    var timelineHtml = timeline.map(function(step) {
      var carrierLink = '';
      if (step.key === 'dispatched' && order.carrier_tracking_id) {
        carrierLink = '<a class="carrier-tracking-cta" href="https://tracking.ghn.dev/?order_code=' + order.carrier_tracking_id + '" target="_blank" rel="noopener"><i class="fa-solid fa-external-link-alt"></i> ' + (order.carrier_name || 'GHN') + ': ' + order.carrier_tracking_id + '</a>';
      }
      return '<div class="timeline-step ' + step.status + '">' +
        '<div class="timeline-dot"><i class="fa-solid ' + step.icon + '"></i></div>' +
        '<div class="timeline-label">' + step.label + '</div>' +
        '<div class="timeline-desc">' + step.desc + '</div>' +
        carrierLink +
      '</div>';
    }).join('');

    container.innerHTML =
      '<div class="tracking-result-card">' +
      '<div class="tracking-result-header">' +
        '<div><div class="tracking-order-id">\ud83d\udce6 ' + order.id + '</div>' +
          '<div style="font-size:0.78rem;color:var(--color-text-light);margin-top:0.25rem;">\u0110\u1eb7t ng\u00e0y: ' + new Date(order.created_at).toLocaleString('vi-VN') + ' &middot; T\u1ed5ng: ' + fmt(order.total) + '</div>' +
          '<div style="font-size:0.78rem;color:var(--color-text-light);margin-top:0.2rem;"><i class="fa-solid fa-location-dot"></i> ' + order.shipping_address + '</div>' +
        '</div>' +
        '<div class="tracking-status-badge" style="background-color:' + (sm.color || '#6b7280') + '">' +
          '<i class="fa-solid ' + (sm.icon || 'fa-circle') + '"></i> ' + (sm.label || order.status) + '</div>' +
      '</div>' +
      '<div class="order-timeline"><h4><i class="fa-solid fa-timeline"></i> H\u00e0nh tr\u00ecnh \u0111\u01a1n h\u00e0ng</h4>' +
      '<div class="timeline-track">' + timelineHtml + '</div></div>' +
      '</div>';
  }

  // ─── Account Page ──────────────────────────────────────────────────────────────
  function renderAccount() {
    var view = document.getElementById('app-view');
    if (!view) return;
    if (!window.state || !window.state.user) {
      view.innerHTML =
        '<div class="tracking-page" style="text-align:center;padding-top:3rem;">' +
        '<div style="font-size:3rem;margin-bottom:1rem;">\ud83d\udd12</div>' +
        '<h2 style="font-family:var(--font-title);font-size:1.3rem;margin-bottom:0.5rem;">Vui l\u00f2ng \u0111\u0103ng nh\u1eadp</h2>' +
        '<button class="btn btn-primary" onclick="document.getElementById(\'login-header-btn\').click()"><i class="fa-solid fa-right-to-bracket"></i> \u0110\u0103ng nh\u1eadp</button></div>';
      return;
    }

    var activeTab = (window.state && window.state.accountTab) || 'orders';
    var initials = (window.state.user.email || 'U').charAt(0).toUpperCase();
    view.innerHTML =
      '<div class="account-page">' +
      '<div class="account-profile-header">' +
        '<div class="account-avatar">' + initials + '</div>' +
        '<div class="account-profile-info"><h2>' + (window.state.user.displayName || window.state.user.email) + '</h2>' +
        '<p>' + window.state.user.email + '</p><p style="margin-top:0.3rem;color:var(--color-accent);font-size:0.78rem;"><i class="fa-solid fa-leaf"></i> Th\u00e0nh vi\u00ean EcoKnot</p></div>' +
      '</div>' +
      '<div class="account-tabs">' +
        '<button class="account-tab ' + (activeTab === 'orders' ? 'active' : '') + '" onclick="window.EC.switchAccountTab(\'orders\')"><i class="fa-solid fa-box"></i> L\u1ecbch s\u1eed \u0111\u01a1n h\u00e0ng</button>' +
        '<button class="account-tab ' + (activeTab === 'profile' ? 'active' : '') + '" onclick="window.EC.switchAccountTab(\'profile\')"><i class="fa-solid fa-user"></i> Th\u00f4ng tin c\u00e1 nh\u00e2n</button>' +
      '</div>' +
      '<div id="account-tab-content"><div style="text-align:center;padding:2rem;color:var(--color-text-light)"><i class="fa-solid fa-spinner fa-spin" style="font-size:1.5rem"></i></div></div>' +
      '</div>';

    loadAccountTab(activeTab);
  }

  function switchAccountTab(tab) {
    if (window.state) window.state.accountTab = tab;
    document.querySelectorAll('.account-tab').forEach(function(t) { t.classList.remove('active'); });
    var btn = document.querySelector('.account-tab[onclick*="' + tab + '"]');
    if (btn) btn.classList.add('active');
    loadAccountTab(tab);
  }

  async function loadAccountTab(tab) {
    var contentEl = document.getElementById('account-tab-content');
    if (!contentEl) return;
    if (tab === 'profile') {
      contentEl.innerHTML =
        '<div class="checkout-form-card"><h3><i class="fa-solid fa-user"></i> Th\u00f4ng tin c\u00e1 nh\u00e2n</h3>' +
        '<div class="form-group" style="margin-bottom:0.75rem"><label>Email</label><input type="text" class="form-control" value="' + window.state.user.email + '" disabled></div>' +
        '<div class="form-group"><label>T\u00ean hi\u1ec3n th\u1ecb</label><input type="text" class="form-control" id="profile-name" value="' + (window.state.user.displayName || '') + '"></div>' +
        '<button class="btn btn-primary" style="margin-top:1rem" onclick="window.EC.saveProfileName()"><i class="fa-solid fa-floppy-disk"></i> L\u01b0u thay \u0111\u1ed5i</button></div>';
      return;
    }

    contentEl.innerHTML = '<div style="text-align:center;padding:2rem;"><i class="fa-solid fa-spinner fa-spin" style="font-size:1.5rem;color:var(--color-text-light)"></i></div>';
    try {
      var res = await fetch('/api/orders?userId=' + encodeURIComponent(window.state.user.email));
      var orders = await res.json();
      if (!Array.isArray(orders) || orders.length === 0) {
        contentEl.innerHTML =
          '<div style="text-align:center;padding:3rem 1rem;color:var(--color-text-light);">' +
          '<div style="font-size:3rem;margin-bottom:1rem;">\ud83d\udecd\ufe0f</div><p>B\u1ea1n ch\u01b0a c\u00f3 \u0111\u01a1n h\u00e0ng n\u00e0o.</p>' +
          '<button class="btn btn-primary" style="margin-top:1rem" onclick="window.navigateTo(\'customizer\')"><i class="fa-solid fa-gift"></i> T\u1ea1o h\u1ed9p qu\u00e0 \u0111\u1ea7u ti\u00ean</button></div>';
        return;
      }

      contentEl.innerHTML = orders.map(function(order) {
        var items = order.order_items || [];
        var fi = items[0];
        var prods = (fi && fi.items_json) || [];
        var sc = STATUS_COLORS[order.status] || '#6b7280';
        var sl = STATUS_LABELS[order.status] || order.status;
        var dt = new Date(order.created_at).toLocaleDateString('vi-VN');
        return '<div class="order-history-card">' +
          '<div class="order-history-header">' +
            '<div><div class="order-history-id">\ud83d\udce6 ' + order.id + '</div>' +
            '<div class="order-history-date">\ud83d\udcc5 ' + dt + '</div></div>' +
            '<span class="order-history-status" style="background:' + sc + '20;color:' + sc + ';border:1px solid ' + sc + '40;">' + sl + '</span>' +
          '</div>' +
          (prods.length > 0 ? '<div class="order-history-items">' +
            prods.slice(0, 4).map(function(p) { return '<span class="order-history-item-pill">\ud83c\udf43 ' + (p.name || '').substring(0, 22) + '</span>'; }).join('') +
            (prods.length > 4 ? '<span class="order-history-item-pill">+' + (prods.length - 4) + '</span>' : '') +
          '</div>' : '') +
          '<div class="order-history-footer">' +
            '<div class="order-history-total">' + fmt(order.total) + '</div>' +
            '<div class="order-history-actions">' +
              '<button class="btn-invoice" onclick="window.EC.printInvoice(\'' + order.id + '\')"><i class="fa-solid fa-file-invoice"></i> H\u00f3a \u0111\u01a1n</button>' +
              '<button class="btn-reorder" onclick="window.EC.reorderBox(\'' + order.id + '\')"><i class="fa-solid fa-rotate-right"></i> \u0110\u1eb7t l\u1ea1i</button>' +
            '</div></div>' +
        '</div>';
      }).join('');
    } catch (e) {
      contentEl.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--color-danger)">L\u1ed7i t\u1ea3i d\u1eef li\u1ec7u.</div>';
    }
  }

  function saveProfileName() {
    var nameEl = document.getElementById('profile-name');
    if (!nameEl || !nameEl.value.trim()) return;
    window.state.user.displayName = nameEl.value.trim();
    if (window.saveStateToStorage) window.saveStateToStorage();
    toast('\u0110\u00e3 l\u01b0u!');
  }

  async function printInvoice(orderId) {
    try {
      var res = await fetch('/api/orders/' + orderId + '/invoice-data');
      if (!res.ok) { toast('Kh\u00f4ng th\u1ec3 t\u1ea3i h\u00f3a \u0111\u01a1n!'); return; }
      var inv = await res.json();
      var g = function(id) { return document.getElementById(id); };

      if (g('print-invoice-number')) g('print-invoice-number').textContent = inv.invoice_number;
      if (g('print-invoice-date')) g('print-invoice-date').textContent = inv.issue_date;
      if (g('print-buyer-name')) g('print-buyer-name').innerHTML = '<strong>' + inv.buyer.name + '</strong>';
      if (g('print-buyer-address')) g('print-buyer-address').textContent = inv.buyer.address;
      if (g('print-buyer-phone')) g('print-buyer-phone').textContent = inv.buyer.phone;
      if (g('print-buyer-tax') && inv.buyer.tax_id) { g('print-buyer-tax').style.display = ''; if (g('print-buyer-tax-val')) g('print-buyer-tax-val').textContent = inv.buyer.tax_id; }
      if (g('print-subtotal')) g('print-subtotal').textContent = fmt(inv.summary.subtotal);
      if (g('print-ship')) g('print-ship').textContent = fmt(inv.summary.ship_fee);
      if (g('print-discount')) g('print-discount').textContent = inv.summary.discount > 0 ? '-' + fmt(inv.summary.discount) : '\u2014';
      if (g('print-total')) g('print-total').textContent = fmt(inv.summary.total);
      if (g('print-payment-method')) g('print-payment-method').textContent = inv.payment.method;
      if (g('print-txn-id')) g('print-txn-id').textContent = inv.payment.transaction_id || '\u2014';
      if (g('print-co2')) g('print-co2').textContent = inv.eco_metrics.total_co2_saved_kg;
      if (g('print-plastic')) g('print-plastic').textContent = inv.eco_metrics.total_plastic_saved_g;

      var lineItemsEl = g('print-line-items');
      if (lineItemsEl) {
        lineItemsEl.innerHTML = inv.line_items.map(function(li, i) {
          return '<tr><td>' + (i+1) + '</td><td>' + li.description + '</td><td>' +
            (li.products || []).map(function(p) { return p.name; }).join(', ') +
            '</td><td>' + li.qty + '</td><td>' + fmt(li.unit_price) + '</td><td>' + fmt(li.subtotal) + '</td></tr>';
        }).join('');
      }

      var printArea = document.getElementById('invoice-print-area');
      if (printArea) printArea.style.display = 'block';
      setTimeout(function() { window.print(); if (printArea) printArea.style.display = 'none'; }, 200);
    } catch (e) { toast('L\u1ed7i t\u1ea3i h\u00f3a \u0111\u01a1n!'); }
  }

  async function reorderBox(orderId) {
    if (!window.state || !window.state.user) { toast('Vui l\u00f2ng \u0111\u0103ng nh\u1eadp!'); return; }
    try {
      var res = await fetch('/api/orders/' + orderId + '/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: window.state.user.email })
      });
      if (!res.ok) { toast('Kh\u00f4ng th\u1ec3 \u0111\u1eb7t l\u1ea1i!'); return; }
      var data = await res.json();
      if (!window.state.cart) window.state.cart = [];
      data.cartItems.forEach(function(item) { window.state.cart.push(item); });
      saveCart();
      toast('\u0110\u00e3 th\u00eam ' + data.cartItems.length + ' h\u1ed9p qu\u00e0 v\u00e0o gi\u1ecf h\u00e0ng!');
      openCartPanel();
    } catch (e) { toast('L\u1ed7i. Th\u1eed l\u1ea1i!'); }
  }

  // ─── Route Registration ────────────────────────────────────────────────────────
  function registerCommerceRoutes() {
    // Register render functions in the app router
    if (window.routes) {
      window.routes['checkout'] = renderCheckout;
      window.routes['tracking'] = renderTracking;
      window.routes['account'] = renderAccount;
    }
    // Also assign directly to window so router fallback works
    window.renderCheckout = renderCheckout;
    window.renderTracking = renderTracking;
    window.renderAccount = renderAccount;

    // Extend navigateTo to handle commerce routes if not already handled
    var origNavigateTo = window.navigateTo;
    if (origNavigateTo && typeof origNavigateTo === 'function') {
      window.navigateTo = function(route, params) {
        if (!window.state.checkout) window.state.checkout = {};
        if (route === 'checkout' && window.state.checkout.step === undefined) {
          window.state.checkout.step = 1;
        }
        return origNavigateTo(route, params);
      };
    }
  }

  // ─── Init ─────────────────────────────────────────────────────────────────────
  function init() {
    // Ensure state has cart
    if (window.state && !window.state.cart) window.state.cart = [];

    // Bind cart panel events
    initCartPanel();

    // Register commerce routes
    registerCommerceRoutes();

    // Expose public API
    window.EC = {
      addToCart: addToCart,
      openCartPanel: openCartPanel,
      closeCartPanel: closeCartPanel,
      removeCartItem: removeCartItem,
      updateCartItemQty: updateCartItemQty,
      renderCartPanelItems: renderCartPanelItems,
      goCheckoutStep: goCheckoutStep,
      selectDelivery: selectDelivery,
      selectPayment: selectPayment,
      placeOrder: placeOrder,
      renderTracking: renderTracking,
      performOrderTrack: performOrderTrack,
      renderAccount: renderAccount,
      switchAccountTab: switchAccountTab,
      printInvoice: printInvoice,
      reorderBox: reorderBox,
      saveProfileName: saveProfileName
    };

    // Shortcuts for backward compatibility
    window.addToCart = addToCart;
    window.openCartPanel = openCartPanel;
    window.closeCartPanel = closeCartPanel;
    window.printInvoice = printInvoice;
    window.reorderBox = reorderBox;
    window.switchAccountTab = switchAccountTab;

    console.log('[EcoKnot Commerce] Module initialized');
  }

  // Run on DOMContentLoaded or immediately if already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // app.js may not have run yet; defer to next tick
    setTimeout(init, 0);
  }
})();
