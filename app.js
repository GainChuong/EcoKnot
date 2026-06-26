import { 
  ONBOARDING_QUESTIONS, 
  PRODUCTS, 
  BOX_MATERIALS, 
  BOX_SIZES, 
  RIBBON_TYPES, 
  PRESET_BOXES, 
  MOCK_ORDERS,
  GIFT_BOX_CATEGORIES,
  CATEGORY_PRESETS
} from './data.js';

// Image fallback placeholder (Green Eco Gift Box)
const IMAGE_FALLBACK = "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80";

// ==========================================================================
// APPLICATION STATE
// ==========================================================================
const state = {
  currentRoute: 'home',
  user: null, // email, password, preferenceProfile { recipient, interests, budget, occasions, style, sustainabilityScore }
  cart: [], // { id, type: 'custom'/'preset', box, size, ribbon, items: [], card: { text, font, color }, photo: null, qty, price, metrics }
  customizer: {
    step: 1,
    box: BOX_MATERIALS[0].id,
    size: BOX_SIZES[0].id,
    ribbon: RIBBON_TYPES[0].id,
    items: [],
    cardText: '',
    cardFont: 'var(--font-body)',
    cardColor: '#3E3E3E',
    photo: null,
    previewed: false
  },
  b2b: {
    logo: null,
    color: '#8FAD88',
    box: 'box-kraft',
    quantity: 100,
    items: ['prod-candle', 'prod-tea']
  },
  orders: [...MOCK_ORDERS],
  searchQuery: '',
  shopCategory: 'all',
  shopTag: 'all',
  onboardingCurrentStep: 0,
  onboardingAnswers: {},
  aiEnabled: true,
  aiHistoryDeleted: false
};

// ==========================================================================
// UTILITY FUNCTIONS
// ==========================================================================
function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.innerText = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Load state from localStorage on init
function loadStateFromStorage() {
  const storedUser = localStorage.getItem('ek_user');
  const storedCart = localStorage.getItem('ek_cart');
  const storedOrders = localStorage.getItem('ek_orders');
  const storedAiEnabled = localStorage.getItem('ek_ai_enabled');

  if (storedUser) {
    state.user = JSON.parse(storedUser);
  }
  if (storedCart) {
    state.cart = JSON.parse(storedCart);
  }
  if (storedOrders) {
    state.orders = JSON.parse(storedOrders);
  }
  if (storedAiEnabled !== null) {
    state.aiEnabled = JSON.parse(storedAiEnabled);
  }

  updateCartCount();
  updateAuthUI();
}

function saveStateToStorage() {
  if (state.user) localStorage.setItem('ek_user', JSON.stringify(state.user));
  localStorage.setItem('ek_cart', JSON.stringify(state.cart));
  localStorage.setItem('ek_orders', JSON.stringify(state.orders));
  localStorage.setItem('ek_ai_enabled', JSON.stringify(state.aiEnabled));
}

function updateCartCount() {
  const count = state.cart.reduce((total, item) => total + item.qty, 0);
  document.getElementById('cart-count').innerText = count;
}

function updateAuthUI() {
  const loginBtn = document.getElementById('login-header-btn');
  const userMenu = document.getElementById('user-menu');
  const dropdownEmail = document.getElementById('dropdown-user-email');
  
  if (state.user) {
    loginBtn.style.display = 'none';
    userMenu.style.display = 'flex';
    dropdownEmail.innerText = state.user.email || 'user@ecoknot.vn';
  } else {
    loginBtn.style.display = 'flex';
    userMenu.style.display = 'none';
  }
}

// ==========================================================================
// SPA ROUTER
// ==========================================================================
const routes = {
  home: renderHome,
  customizer: renderCustomizer,
  shop: renderShop,
  b2b: renderB2B,
  story: renderStory,
  tracking: renderTracking,
  account: renderAccount
};

function navigateTo(route) {
  state.currentRoute = route;
  window.location.hash = route;
  
  // Close mobile navigation overlay
  document.getElementById('mobile-nav').classList.remove('active');
  
  // Render route content
  const renderFn = routes[route] || renderHome;
  renderFn();
  
  // Update nav links active class
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.dataset.route === route) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================================================
// ONBOARDING SURVEY
// ==========================================================================
function openOnboardingSurvey() {
  state.onboardingCurrentStep = 0;
  state.onboardingAnswers = {};
  
  const modal = document.getElementById('onboarding-modal');
  modal.classList.add('active');
  
  renderOnboardingStep();
}

function renderOnboardingStep() {
  const step = state.onboardingCurrentStep;
  const progressBar = document.getElementById('onboarding-progress-bar');
  const questionContainer = document.getElementById('survey-question-container');
  const stepDots = document.querySelectorAll('.step-dot');
  
  // Hide all static steps
  document.querySelectorAll('.onboarding-step').forEach(el => el.classList.remove('active'));
  
  // Update progress bar
  const totalSteps = ONBOARDING_QUESTIONS.length + 1; // Welcome(0) + Questions(1-5) + Complete(6)
  progressBar.style.width = `${(step / totalSteps) * 100}%`;
  
  // Update step dots
  stepDots.forEach((dot, idx) => {
    dot.classList.remove('active', 'completed');
    if (idx === step) dot.classList.add('active');
    else if (idx < step) dot.classList.add('completed');
  });
  
  if (step === 0) {
    document.querySelector('.onboarding-step[data-step="0"]').classList.add('active');
    questionContainer.innerHTML = '';
  } else if (step > 0 && step <= ONBOARDING_QUESTIONS.length) {
    const qIndex = step - 1;
    const q = ONBOARDING_QUESTIONS[qIndex];
    
    const emojiMap = {
      friends: '👥', lovers: '💕', family: '👨‍👩‍👧‍👦', colleagues: '🤝', clients: '💼', partners: '🏢',
      design: '🎨', meaning: '💝', customization: '✏️', eco: '🌿', price: '💰', fast_shipping: '🚚',
      under_300: '💵', '300_500': '💵💵', '500_1000': '💵💵💵', over_1000: '💎',
      birthday: '🎂', christmas: '🎄', valentine: '💘', tet: '🧧', anniversary: '💍', thanks: '🙏', sorry: '😊', corporate: '🏛️',
      minimal: '◻️', vintage: '📜', luxury: '👑', cute: '🐰', modern: '💻'
    };
    
    let html = `
      <div class="onboarding-step active">
        <span class="step-counter">Câu hỏi ${step}/${ONBOARDING_QUESTIONS.length}</span>
        <h2>${q.question}</h2>
        <div class="options-grid">
    `;
    
    q.options.forEach(opt => {
      const isSelected = state.onboardingAnswers[q.id]?.includes(opt.value) || state.onboardingAnswers[q.id] === opt.value;
      const type = q.type;
      const emoji = emojiMap[opt.value] || '';
      
      html += `
        <label class="option-card ${isSelected ? 'selected' : ''}" data-question-id="${q.id}" data-value="${opt.value}">
          <input type="${type}" name="q-${q.id}" value="${opt.value}" ${isSelected ? 'checked' : ''}>
          ${emoji ? `<span class="option-emoji">${emoji}</span>` : ''}
          <span>${opt.label}</span>
        </label>
      `;
    });
    
    html += `
        </div>
        <div class="button-row">
          <button class="btn btn-outline" id="prev-survey-btn"><i class="fa-solid fa-arrow-left"></i> Quay lại</button>
          <button class="btn btn-primary" id="next-survey-btn">Tiếp theo <i class="fa-solid fa-arrow-right"></i></button>
        </div>
      </div>
    `;
    
    questionContainer.innerHTML = html;
    
    // Bind option click handlers
    document.querySelectorAll('.option-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const qId = parseInt(card.dataset.questionId);
        const val = card.dataset.value;
        const qData = ONBOARDING_QUESTIONS.find(x => x.id === qId);
        
        if (qData.type === 'checkbox') {
          if (!state.onboardingAnswers[qId]) state.onboardingAnswers[qId] = [];
          
          if (state.onboardingAnswers[qId].includes(val)) {
            state.onboardingAnswers[qId] = state.onboardingAnswers[qId].filter(x => x !== val);
          } else {
            state.onboardingAnswers[qId].push(val);
          }
        } else {
          state.onboardingAnswers[qId] = val;
        }
        renderOnboardingStep();
      });
    });

    document.getElementById('prev-survey-btn').addEventListener('click', () => {
      state.onboardingCurrentStep--;
      renderOnboardingStep();
    });

    document.getElementById('next-survey-btn').addEventListener('click', () => {
      // Validate option chosen
      if (!state.onboardingAnswers[q.id] || (Array.isArray(state.onboardingAnswers[q.id]) && state.onboardingAnswers[q.id].length === 0)) {
        showToast('Vui lòng chọn ít nhất một câu trả lời!');
        return;
      }
      state.onboardingCurrentStep++;
      renderOnboardingStep();
    });
    
  } else if (step === ONBOARDING_QUESTIONS.length + 1) {
    // Generate Preference Profile
    const emailInput = document.getElementById('ob-email').value || "guest@ecoknot.vn";
    const passwordInput = document.getElementById('ob-password').value || "123456";

    state.user = {
      email: emailInput,
      password: passwordInput,
      preferenceProfile: {
        recipient: state.onboardingAnswers[1] || [],
        interests: state.onboardingAnswers[2] || [],
        budget: state.onboardingAnswers[3] || '300_500',
        occasions: state.onboardingAnswers[4] || [],
        style: state.onboardingAnswers[5] || 'eco',
        sustainabilityScore: 4 // Default slider value
      }
    };
    
    saveStateToStorage();
    updateAuthUI();
    
    // Show completion screen
    document.querySelector('.onboarding-step[data-step="6"]').classList.add('active');
    questionContainer.innerHTML = '';
  }
}

function closeOnboarding() {
  document.getElementById('onboarding-modal').classList.remove('active');
  renderHome(); // Re-render to apply personalization
}

// ==========================================================================
// AI RECOMMENDATION ENGINE (TRANSPARENCY CENTER)
// ==========================================================================
function getPersonalizedProducts() {
  if (!state.user || !state.aiEnabled) {
    // Default trending products
    return PRODUCTS.slice(0, 4);
  }

  const pref = state.user.preferenceProfile;
  const scoredProducts = PRODUCTS.map(prod => {
    let score = 0;
    const reasons = [];

    // 1. Budget Match
    const price = prod.price;
    if (pref.budget === 'under_300' && price < 300000) { score += 3; reasons.push("Giá phù hợp ngân sách tiết kiệm của bạn"); }
    else if (pref.budget === '300_500' && price >= 300000 && price <= 500000) { score += 3; reasons.push("Nằm trong khoảng ngân sách lý tưởng (300k - 500k)"); }
    else if (pref.budget === '500_1000' && price > 500000 && price <= 1000000) { score += 3; reasons.push("Ngân sách sang trọng vừa phải (500k - 1M)"); }
    else if (pref.budget === 'over_1000' && price > 1000000) { score += 3; reasons.push("Sản phẩm quà tặng cao cấp"); }

    // 2. Style Match
    if (prod.tags.includes(pref.style)) {
      score += 4;
      reasons.push(`Đúng phong cách thiết kế ưa thích của bạn: ${pref.style.toUpperCase()}`);
    }

    // 3. Occasion Match
    const matchingOccasions = prod.tags.filter(tag => pref.occasions.includes(tag));
    if (matchingOccasions.length > 0) {
      score += matchingOccasions.length * 2;
      reasons.push("Phù hợp với các dịp tặng quà bạn quan tâm");
    }

    // 4. Sustainability Score Match
    if (pref.interests.includes('eco') || pref.sustainabilityScore >= 4) {
      if (prod.dpp && prod.dpp.recycledContent >= 80) {
        score += 2;
        reasons.push("Chất liệu có tỷ lệ tái chế rất cao (>80%)");
      }
    }

    return { product: prod, score, reasons };
  });

  // Sort by score descending
  scoredProducts.sort((a, b) => b.score - a.score);
  return scoredProducts;
}

function showAiExplanation(prodId) {
  const personalized = getPersonalizedProducts();
  const match = personalized.find(x => x.product.id === prodId);
  
  if (!match || match.reasons.length === 0) {
    alert("Sản phẩm đề xuất phổ biến dựa trên sự yêu thích của cộng đồng.");
    return;
  }

  // Create explanation popup
  let html = `
    <div class="modal-overlay active" id="ai-explain-modal" style="z-index:1005;">
      <div class="onboarding-card" style="max-width: 480px; text-align: left;">
        <button class="close-modal" onclick="document.getElementById('ai-explain-modal').remove()">&times;</button>
        <h3 class="mb-2"><i class="fa-solid fa-brain" style="color:var(--color-accent);"></i> Tại sao AI gợi ý sản phẩm này?</h3>
        <p class="mb-3" style="font-size:0.9rem;">Hệ thống học máy EcoKnot đã phân tích hồ sơ sở thích của bạn và xếp hạng sản phẩm này vì:</p>
        <ul style="display:flex; flex-direction:column; gap:0.5rem; margin-bottom:1.5rem;">
  `;

  match.reasons.forEach(reason => {
    html += `<li style="font-size:0.9rem; display:flex; gap:0.5rem; align-items:flex-start;">
      <i class="fa-solid fa-circle-check" style="color:var(--color-accent); margin-top:0.25rem;"></i>
      <span>${reason}</span>
    </li>`;
  });

  html += `
        </ul>
        <div style="background-color: var(--bg-primary); padding: 0.75rem; border-radius: var(--border-radius); font-size: 0.8rem; color: var(--color-text-light);">
          <i class="fa-solid fa-shield-halved"></i> AI chỉ sử dụng dữ liệu bạn cấp quyền. Bạn có thể xóa hoặc sửa Preference Profile trong <a href="#account" onclick="document.getElementById('ai-explain-modal').remove(); navigateTo('account');" style="color:var(--color-accent); font-weight:600; text-decoration:underline;">Tài khoản</a> bất kỳ lúc nào.
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', html);
}
window.showAiExplanation = showAiExplanation; // expose globally

// ==========================================================================
// DIGITAL PRODUCT PASSPORT (DPP)
// ==========================================================================
function openDppModal(prodId) {
  const prod = PRODUCTS.find(x => x.id === prodId);
  if (!prod || !prod.dpp) return;

  const dpp = prod.dpp;
  document.getElementById('dpp-prod-name').innerText = prod.name;
  document.getElementById('dpp-origin').innerText = dpp.origin;
  document.getElementById('dpp-image').src = prod.image;
  document.getElementById('dpp-material').innerText = dpp.material;
  document.getElementById('dpp-packaging').innerText = dpp.packaging;

  // Render cert badges
  const certContainer = document.getElementById('dpp-certs');
  certContainer.innerHTML = '';
  dpp.certifications.forEach(cert => {
    certContainer.innerHTML += `
      <span class="cert-badge-item">
        <i class="fa-solid fa-certificate" style="color:var(--color-accent);"></i> ${cert}
      </span>
    `;
  });

  // Render progress metrics
  document.getElementById('dpp-val-recycled').innerText = `${dpp.recycledContent}%`;
  document.getElementById('dpp-bar-recycled').style.width = `${dpp.recycledContent}%`;

  document.getElementById('dpp-val-recyclability').innerText = `${dpp.recyclabilityRate}%`;
  document.getElementById('dpp-bar-recyclability').style.width = `${dpp.recyclabilityRate}%`;

  document.getElementById('dpp-val-reusable').innerText = `${dpp.reusablePackaging}%`;
  document.getElementById('dpp-bar-reusable').style.width = `${dpp.reusablePackaging}%`;

  document.getElementById('dpp-val-renewable').innerText = `${dpp.renewableMaterial}%`;
  document.getElementById('dpp-bar-renewable').style.width = `${dpp.renewableMaterial}%`;

  document.getElementById('dpp-val-plastic-saved').innerText = `${dpp.virginPlasticReduction}g`;
  document.getElementById('dpp-val-co2-saved').innerText = `${dpp.carbonFootprintAvoided} kg`;

  document.getElementById('dpp-modal').classList.add('active');
}
window.openDppModal = openDppModal; // expose globally

// ==========================================================================
// RENDER PAGES
// ==========================================================================

// 1. Home Page View
function renderHome() {
  const view = document.getElementById('app-view');
  
  // Hero Video & Content
  let html = `
    <section class="hero-banner">
      <video class="hero-video-bg" autoplay loop muted playsinline>
        <source src="/images/1. Video Hero Banner (Section 1).mp4" type="video/mp4">
      </video>
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1>Hơn cả một vật phẩm, đó là nghệ thuật của sự kết nối</h1>
        <p>Chúng tôi tin rằng, mỗi món quà được trao đi không chỉ để kỷ niệm một dịp đặc biệt, mà là phương tiện để bạn gửi gắm câu chuyện, cái tôi độc bản và trách nhiệm với hành tinh xanh.</p>
        <button class="btn btn-primary" id="hero-cta-btn">Bắt đầu món quà độc bản <i class="fa-solid fa-gift"></i></button>
      </div>
    </section>
  `;

  // Danh mục sản phẩm chính
  html += `
    <section class="mb-4">
      <div class="section-title-container">
        <h2>Danh mục hộp quà</h2>
        <p class="section-subtitle">4 dòng sản phẩm phù hợp với mọi nhu cầu tặng quà của bạn</p>
      </div>
      <div class="category-grid">
  `;

  GIFT_BOX_CATEGORIES.forEach(cat => {
    html += `
      <div class="category-card" data-category="${cat.id}" style="--cat-color: ${cat.color};">
        <div class="category-icon"><i class="fa-solid ${cat.icon}"></i></div>
        <div class="category-info">
          <h3>${cat.nameVi}</h3>
          <p>${cat.description.length > 100 ? cat.description.substring(0, 100) + '...' : cat.description}</p>
          <div class="category-meta">
            <span class="category-target"><i class="fa-solid fa-user"></i> ${cat.target}</span>
            <span class="category-count">${CATEGORY_PRESETS.filter(p => p.category === cat.id).length} mẫu</span>
          </div>
        </div>
        <button class="btn btn-outline category-explore-btn" data-category="${cat.id}">Khám phá <i class="fa-solid fa-arrow-right"></i></button>
      </div>
    `;
  });

  html += `
      </div>
    </section>
  `;

  // Emotion/Occasion Categories
  html += `
    <section class="mb-4">
      <div class="section-title-container">
        <h2>Bắt đầu từ mục đích tặng quà</h2>
        <p class="section-subtitle">Chạm đến cảm xúc người nhận qua từng thông điệp cá nhân hóa</p>
      </div>
      <div class="emotion-grid">
        <div class="emotion-card" data-category="thanks">
          <div class="emotion-icon"><i class="fa-solid fa-heart"></i></div>
          <h3>Cảm ơn</h3>
          <p>Tri ân & chân thành</p>
        </div>
        <div class="emotion-card" data-category="sorry">
          <div class="emotion-icon"><i class="fa-solid fa-face-smile"></i></div>
          <h3>Xin lỗi</h3>
          <p>Hàn gắn & sẻ chia</p>
        </div>
        <div class="emotion-card" data-category="birthday">
          <div class="emotion-icon"><i class="fa-solid fa-cake-candles"></i></div>
          <h3>Sinh nhật</h3>
          <p>Niềm vui & kỷ niệm</p>
        </div>
        <div class="emotion-card" data-category="valentine">
          <div class="emotion-icon"><i class="fa-solid fa-fire"></i></div>
          <h3>Người yêu</h3>
          <p>Nồng nàn & lãng mạn</p>
        </div>
        <div class="emotion-card" data-category="tet">
          <div class="emotion-icon"><i class="fa-solid fa-leaf"></i></div>
          <h3>Dịp Tết</h3>
          <p>An khang & xanh tươi</p>
        </div>
      </div>
    </section>
  `;

  // Personalized/Featured Products
  html += `
    <section class="mb-4">
      <div class="section-title-container">
        <h2>${state.user && state.aiEnabled ? 'Đề xuất dành riêng cho bạn (AI Personalized)' : 'Hệ sinh thái sản phẩm xanh nổi bật'}</h2>
        <p class="section-subtitle">Thành phần tự nhiên, an lành cho người dùng, bền vững cho môi trường</p>
      </div>
      <div class="featured-grid">
  `;

  const itemsToRender = getPersonalizedProducts();
  
  itemsToRender.forEach(item => {
    const prod = item.product || item;
    const hasAiBadge = state.user && state.aiEnabled && item.score > 0;
    
    html += `
      <div class="product-card">
        <div class="product-badge-container">
          <span class="green-badge" onclick="openDppModal('${prod.id}')"><i class="fa-solid fa-leaf"></i> Nhãn Xanh (Passport)</span>
          ${hasAiBadge ? '<span class="tag-badge" style="background-color:var(--color-accent);">AI Gợi Ý</span>' : ''}
        </div>
        <div class="product-img-wrapper">
          <img src="${prod.image}" alt="${prod.name}" onerror="this.onerror=null; this.src='${IMAGE_FALLBACK}';">
        </div>
        <div class="product-info">
          <div class="product-meta">
            <h3>${prod.name}</h3>
            <p class="product-desc">${prod.description}</p>
          </div>
          
          <div class="product-footer">
            <span class="product-price">${formatCurrency(prod.price)}</span>
            <button class="btn btn-outline btn-custom-direct" data-prod-id="${prod.id}"><i class="fa-solid fa-square-plus"></i> Chọn quà</button>
          </div>
          
          ${hasAiBadge ? `
            <div class="ai-recommendation-block">
              <button class="ai-reason-btn" onclick="showAiExplanation('${prod.id}')">
                <i class="fa-solid fa-brain"></i> Tại sao AI gợi ý?
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  });

  html += `
      </div>
      <div class="text-center">
        <a href="#shop" class="btn btn-secondary" id="go-shop-btn">Xem tất cả sản phẩm xanh</a>
      </div>
    </section>
  `;

  // B2B Corporate Banner Callout
  html += `
    <section class="b2b-home-callout">
      <div class="b2b-callout-info">
        <h3>Quà tặng Doanh nghiệp (B2B)</h3>
        <p>Giải pháp quà tặng phát thải thấp cho đối tác và nhân viên. Tự động khắc logo thương hiệu, tùy biến màu sắc nhận diện và nhận bảng chiết khấu báo giá tức thì lên đến 15%.</p>
        <button class="btn btn-primary" id="b2b-cta-btn">Thiết kế mẫu hộp B2B <i class="fa-solid fa-arrow-right"></i></button>
      </div>
      <div class="b2b-callout-img">
        <img src="/images/2. Ảnh Khởi nguồn (Section 2 – chia đôi màn hình).png" alt="Quà tặng doanh nghiệp xanh">
      </div>
    </section>
  `;

  // Social Proof UGC
  html += `
    <section class="mb-4">
      <div class="section-title-container">
        <h2>Cộng đồng yêu thích EcoKnot</h2>
        <p class="section-subtitle">Đánh giá thực tế từ khách hàng đã chung tay xây dựng phong cách sống xanh</p>
      </div>
      <div class="ugc-grid">
        <div class="ugc-card">
          <div class="ugc-user">
            <img class="ugc-avatar" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Avatar">
            <div>
              <div class="ugc-name">Khánh Linh</div>
              <div class="verified-badge"><i class="fa-solid fa-circle-check"></i> Đã mua hàng</div>
            </div>
          </div>
          <div class="ugc-stars"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i></div>
          <p class="ugc-text">"Công cụ Custom quà siêu tiện. Mình chọn ly tre khắc tên bạn thân làm quà sinh nhật, bạn ấy thích lắm. Đóng gói rất mộc mạc đúng gu."</p>
        </div>
        <div class="ugc-card">
          <div class="ugc-user">
            <img class="ugc-avatar" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Avatar">
            <div>
              <div class="ugc-name">Minh Hoàng</div>
              <div class="verified-badge"><i class="fa-solid fa-circle-check"></i> Đã mua hàng</div>
            </div>
          </div>
          <div class="ugc-stars"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i></div>
          <p class="ugc-text">"Hộp tre đan thủ công nhìn sang cực kỳ. Hơn nữa lại có Digital Passport biết rõ nguồn gốc và CO2 tránh được. Chắc chắn sẽ ủng hộ tiếp!"</p>
        </div>
        <div class="ugc-card">
          <div class="ugc-user">
            <img class="ugc-avatar" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="Avatar">
            <div>
              <div class="ugc-name">Lan Anh</div>
              <div class="verified-badge"><i class="fa-solid fa-circle-check"></i> Đã mua hàng</div>
            </div>
          </div>
          <div class="ugc-stars"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i></div>
          <p class="ugc-text">"Website mộc mạc tinh tế, thao tác mượt mà. Onboarding Survey của AI đề xuất nến thơm đúng mùi hương mình yêu thích."</p>
        </div>
      </div>
    </section>
  `;

  // Why EcoKnot AI
  html += `
    <section class="why-ai-grid mb-4">
      <div class="why-ai-col">
        <div class="why-ai-icon"><i class="fa-solid fa-shield-halved"></i></div>
        <h3>Cá nhân hóa minh bạch</h3>
        <p>AI gợi ý sản phẩm dựa trên hồ sơ bạn cung cấp. Không thu thập dữ liệu ngầm.</p>
      </div>
      <div class="why-ai-col">
        <div class="why-ai-icon"><i class="fa-solid fa-circle-info"></i></div>
        <h3>Bạn luôn biết lý do</h3>
        <p>Nhấp vào nút "Tại sao AI gợi ý" để xem chính xác các chỉ số xếp hạng sản phẩm.</p>
      </div>
      <div class="why-ai-col">
        <div class="why-ai-icon"><i class="fa-solid fa-user-gear"></i></div>
        <h3>Kiểm soát hoàn toàn</h3>
        <p>Chỉnh sửa, cập nhật hoặc xóa dữ liệu Preference Profile bất kỳ lúc nào.</p>
      </div>
      <div class="why-ai-col">
        <div class="why-ai-icon"><i class="fa-solid fa-leaf"></i></div>
        <h3>Đóng góp bền vững</h3>
        <p>Biết rõ khối lượng nhựa giảm thiểu và CO₂ tránh phát thải của từng đơn hàng.</p>
      </div>
    </section>
  `;

  view.innerHTML = html;

  // Bind Event Listeners
  document.getElementById('hero-cta-btn').addEventListener('click', () => navigateTo('customizer'));
  document.getElementById('b2b-cta-btn').addEventListener('click', () => navigateTo('b2b'));
  
  // Custom design click direct from shop
  document.querySelectorAll('.btn-custom-direct').forEach(btn => {
    btn.addEventListener('click', () => {
      const prodId = btn.dataset.prodId;
      state.customizer.items = [prodId]; // Pre-add item
      navigateTo('customizer');
      showToast('Đã thêm sản phẩm chọn vào customizer!');
    });
  });

  // Category card clicks
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.category-explore-btn')) return;
      const catId = card.dataset.category;
      state.shopCategory = catId;
      state.shopTag = 'all';
      navigateTo('shop');
    });
  });

  // Category explore buttons
  document.querySelectorAll('.category-explore-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const catId = btn.dataset.category;
      state.shopCategory = catId;
      state.shopTag = 'all';
      navigateTo('shop');
    });
  });

  // Emotion card clicks
  document.querySelectorAll('.emotion-card').forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.dataset.category;
      state.shopTag = cat;
      navigateTo('shop');
    });
  });
}

// 2. Customizer Page View (Tạo Hộp Quà)
function renderCustomizer() {
  const view = document.getElementById('app-view');
  
  // Calculate price dynamically
  const activeBox = BOX_MATERIALS.find(x => x.id === state.customizer.box);
  const activeSize = BOX_SIZES.find(x => x.id === state.customizer.size);
  const activeRibbon = RIBBON_TYPES.find(x => x.id === state.customizer.ribbon);
  
  let boxPrice = activeBox.price + activeSize.price;
  let ribbonPrice = activeRibbon.price;
  let itemsPrice = state.customizer.items.reduce((total, id) => {
    const prod = PRODUCTS.find(x => x.id === id);
    return total + (prod ? prod.price : 0);
  }, 0);
  
  const totalPrice = boxPrice + ribbonPrice + itemsPrice;

  let html = `
    <div class="section-title-container">
      <h2>Tự tạo hộp quà xanh độc bản</h2>
      <p class="section-subtitle">Đo ni đóng giày cho cảm xúc của bạn qua 5 bước trực quan</p>
    </div>
    
    <div class="customizer-layout">
      <!-- Workspace: Live Preview (Sticky Left) -->
      <div class="customizer-workspace">
        <div class="workspace-header">
          <h3>Xem trước thiết kế</h3>
          <span class="price-tracker" id="customizer-total-price">${formatCurrency(totalPrice)}</span>
        </div>
        
        <div class="live-preview-box-container">
          <!-- Live mockup frame rendering materials and selections -->
          <div class="box-mockup ${state.customizer.box === 'box-bamboo' ? 'bamboo' : ''}" id="customizer-box-mockup">
            <!-- Ribbon bands -->
            <div class="ribbon-overlay active-ribbon" style="--ribbon-color: ${activeRibbon.color};"></div>
            <div class="ribbon-horizontal active-ribbon" style="--ribbon-color: ${activeRibbon.color};"></div>
            <div class="ribbon-knot active-ribbon" style="--ribbon-color: ${activeRibbon.color};"></div>

            <!-- Items Slots grid (Max 8 slots depending on size) -->
            <div class="items-inside-preview">
  `;

  // Draw slots
  const maxSlots = activeSize.maxItems;
  for (let i = 0; i < maxSlots; i++) {
    const itemId = state.customizer.items[i];
    if (itemId) {
      const prod = PRODUCTS.find(x => x.id === itemId);
      html += `
        <div class="item-preview-slot selected-slot" title="${prod.name}">
          <img src="${prod.image}" alt="${prod.name}" onerror="this.onerror=null; this.src='${IMAGE_FALLBACK}';">
        </div>
      `;
    } else {
      html += `<div class="item-preview-slot"><i class="fa-solid fa-plus" style="opacity:0.3;"></i></div>`;
    }
  }

  html += `
            </div>

            <!-- Greeting Card & Custom Image overlay -->
            <div class="preview-card-message" id="preview-card-container" style="display: ${state.customizer.cardText || state.customizer.photo ? 'flex' : 'none'};">
              ${state.customizer.photo ? `<img class="preview-card-photo" src="${state.customizer.photo}" alt="Uploaded photo">` : ''}
              <div class="preview-card-text" style="font-family: ${state.customizer.cardFont}; color: ${state.customizer.cardColor};">
                ${state.customizer.cardText || "Lời chúc của bạn..."}
              </div>
            </div>
          </div>
        </div>
        <p class="live-preview-overlay-text mb-2"><i class="fa-solid fa-eye"></i> Đây là bản thiết kế 2D thời gian thực của hộp quà.</p>
      </div>

      <!-- Panel: Configuration Steps (Right) -->
      <div class="customizer-panel">
        <nav class="steps-navigation">
          <button class="step-nav-btn ${state.customizer.step === 1 ? 'active' : ''}" data-step="1">1. Hộp & Nơ</button>
          <button class="step-nav-btn ${state.customizer.step === 2 ? 'active' : ''}" data-step="2">2. Chọn quà</button>
          <button class="step-nav-btn ${state.customizer.step === 3 ? 'active' : ''}" data-step="3">3. Lời chúc</button>
          <button class="step-nav-btn ${state.customizer.step === 4 ? 'active' : ''}" data-step="4">4. In hình ảnh</button>
          <button class="step-nav-btn ${state.customizer.step === 5 ? 'active' : ''}" data-step="5">5. Xem lại & Đặt</button>
        </nav>
        
        <!-- STEP 1 CONTENT: Box material and Size -->
        <div class="step-content ${state.customizer.step === 1 ? 'active' : ''}">
          <div>
            <h3 class="customizer-title">Chọn vỏ hộp quà</h3>
            <p class="customizer-desc">Vật liệu 100% thân thiện môi trường, dễ dàng tái chế hoặc phân hủy.</p>
            <div class="selection-grid mb-3">
  `;

  BOX_MATERIALS.forEach(box => {
    html += `
      <div class="selection-card box-choice-btn ${state.customizer.box === box.id ? 'selected' : ''}" data-box-id="${box.id}">
        <div class="selection-info">
          <h4>${box.name}</h4>
          <p>${box.description}</p>
        </div>
        <span class="selection-price">+${formatCurrency(box.price)}</span>
      </div>
    `;
  });

  html += `
            </div>
          </div>

          <div>
            <h3 class="customizer-title">Kích thước hộp</h3>
            <p class="customizer-desc">Chọn kích thước tương ứng với số lượng món quà bên trong.</p>
            <div class="selection-grid mb-3">
  `;

  BOX_SIZES.forEach(sz => {
    html += `
      <div class="selection-card size-choice-btn ${state.customizer.size === sz.id ? 'selected' : ''}" data-size-id="${sz.id}">
        <div class="selection-info">
          <h4>${sz.name}</h4>
          <p>Chứa tối đa ${sz.maxItems} sản phẩm</p>
        </div>
        <span class="selection-price">${sz.price > 0 ? '+' + formatCurrency(sz.price) : 'Miễn phí'}</span>
      </div>
    `;
  });

  html += `
            </div>
          </div>

          <div>
            <h3 class="customizer-title">Kiểu dây ruy băng buộc</h3>
            <p class="customizer-desc">Dây thắt nơ hoàn thiện hộp quà, làm từ sợi cotton hoặc gai tự nhiên.</p>
            <div class="selection-grid mb-3">
  `;

  RIBBON_TYPES.forEach(rib => {
    html += `
      <div class="selection-card ribbon-choice-btn ${state.customizer.ribbon === rib.id ? 'selected' : ''}" data-ribbon-id="${rib.id}">
        <div class="selection-info">
          <h4 style="display:flex; align-items:center; gap:0.5rem;">
            <span style="display:inline-block; width:14px; height:14px; background-color:${rib.color}; border-radius:50%; border:1px solid #ddd;"></span>
            ${rib.name}
          </h4>
        </div>
        <span class="selection-price">+${formatCurrency(rib.price)}</span>
      </div>
    `;
  });

  html += `
            </div>
          </div>

          <div class="button-row">
            <button class="btn btn-primary" id="step-next-1">Tiếp tục chọn quà <i class="fa-solid fa-chevron-right"></i></button>
          </div>
        </div>

        <!-- STEP 2 CONTENT: Add items -->
        <div class="step-content ${state.customizer.step === 2 ? 'active' : ''}">
          <div>
            <h3 class="customizer-title">Chọn quà đặt bên trong</h3>
            <p class="customizer-desc">Hộp của bạn chứa tối đa <strong>${activeSize.maxItems}</strong> món. Đang chọn <strong>${state.customizer.items.length}/${activeSize.maxItems}</strong> món.</p>
            <div class="items-list-grid">
  `;

  PRODUCTS.forEach(prod => {
    const isSelected = state.customizer.items.includes(prod.id);
    html += `
      <div class="item-choice-card ${isSelected ? 'selected' : ''}" data-prod-id="${prod.id}">
        <img src="${prod.image}" alt="${prod.name}" onerror="this.onerror=null; this.src='${IMAGE_FALLBACK}';">
        <div class="item-choice-body">
          <h4>${prod.name}</h4>
          <div class="item-choice-footer">
            <span class="item-choice-price">${formatCurrency(prod.price)}</span>
            <input type="checkbox" class="add-item-checkbox" ${isSelected ? 'checked' : ''} disabled>
          </div>
        </div>
      </div>
    `;
  });

  html += `
            </div>
          </div>

          <div class="button-row">
            <button class="btn btn-outline" id="step-prev-2"><i class="fa-solid fa-chevron-left"></i> Quay lại</button>
            <button class="btn btn-primary" id="step-next-2">Viết lời chúc thiệp <i class="fa-solid fa-chevron-right"></i></button>
          </div>
        </div>

        <!-- STEP 3 CONTENT: Greeting message -->
        <div class="step-content ${state.customizer.step === 3 ? 'active' : ''}">
          <div>
            <h3 class="customizer-title">Viết lời chúc chân thành</h3>
            <p class="customizer-desc">Lời chúc của bạn sẽ được in bằng mực đậu nành hữu cơ trên giấy kraft tinh xảo.</p>
            
            <div class="form-group mb-3">
              <label for="customizer-card-text">Nội dung lời nhắn</label>
              <textarea id="customizer-card-text" rows="5" placeholder="Gõ lời chúc của bạn tại đây...">${state.customizer.cardText}</textarea>
            </div>

            <div class="mb-3">
              <label class="form-group label mb-1">Kiểu Font chữ viết thiệp</label>
              <div class="font-selector">
                <button class="font-btn font-sans-btn ${state.customizer.cardFont === 'var(--font-body)' ? 'active' : ''}" data-font="var(--font-body)">Chữ hiện đại (Inter)</button>
                <button class="font-btn font-serif-btn ${state.customizer.cardFont === 'var(--font-card)' ? 'active' : ''}" data-font="var(--font-card)" style="font-family:var(--font-card);">Chữ mềm mại (Serif)</button>
                <button class="font-btn font-cursive-btn ${state.customizer.cardFont === 'var(--font-title)' ? 'active' : ''}" data-font="var(--font-title)">Chữ thanh mảnh (Montserrat)</button>
              </div>
            </div>

            <div>
              <label class="form-group label mb-1">Màu mực in thiệp</label>
              <div class="ink-selector">
                <div class="ink-dot ${state.customizer.cardColor === '#3E3E3E' ? 'active' : ''}" data-color="#3E3E3E" style="background-color:#3E3E3E;" title="Mực đen Charcoal"></div>
                <div class="ink-dot ${state.customizer.cardColor === '#8FAD88' ? 'active' : ''}" data-color="#8FAD88" style="background-color:#8FAD88;" title="Mực xanh Sage Green"></div>
                <div class="ink-dot ${state.customizer.cardColor === '#B0927A' ? 'active' : ''}" data-color="#B0927A" style="background-color:#B0927A;" title="Mực nâu Earthy Brown"></div>
              </div>
            </div>
          </div>

          <div class="button-row">
            <button class="btn btn-outline" id="step-prev-3"><i class="fa-solid fa-chevron-left"></i> Quay lại</button>
            <button class="btn btn-primary" id="step-next-3">In hình ảnh lên thiệp <i class="fa-solid fa-chevron-right"></i></button>
          </div>
        </div>

        <!-- STEP 4 CONTENT: Photo upload -->
        <div class="step-content ${state.customizer.step === 4 ? 'active' : ''}">
          <div>
            <h3 class="customizer-title">In hình ảnh kỷ niệm</h3>
            <p class="customizer-desc">Tải lên một bức ảnh kỷ niệm của bạn và người nhận. Chúng tôi sẽ in chất lượng cao đính kèm thiệp.</p>
            
            <div class="photo-uploader">
              <i class="fa-solid fa-cloud-arrow-up"></i>
              <p>Nhấp vào hoặc kéo thả hình ảnh vào đây</p>
              <span style="font-size:0.75rem; color:var(--color-text-light);">Hỗ trợ định dạng JPG, PNG dung lượng dưới 5MB.</span>
              <input type="file" id="customizer-photo-file" accept="image/*">
            </div>

            <div class="demo-photo-options mt-3">
              <p class="mb-1" style="font-size:0.85rem; font-weight:600;">Hoặc chọn ảnh mẫu để thử:</p>
              <div style="display:flex; gap:0.5rem;">
                <img src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=100&q=80" alt="Couple" class="demo-photo-select" style="width:50px; height:50px; object-fit:cover; cursor:pointer; border-radius:4px;">
                <img src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=100&q=80" alt="Friends" class="demo-photo-select" style="width:50px; height:50px; object-fit:cover; cursor:pointer; border-radius:4px;">
                <img src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=100&q=80" alt="Family" class="demo-photo-select" style="width:50px; height:50px; object-fit:cover; cursor:pointer; border-radius:4px;">
              </div>
            </div>

            <div class="photo-uploader-preview" id="customizer-photo-preview-container" style="display: ${state.customizer.photo ? 'flex' : 'none'};">
              <div style="position:relative;">
                <img id="customizer-photo-preview" src="${state.customizer.photo || ''}" alt="Preview">
                <button id="remove-customizer-photo-btn" style="position:absolute; top:-10px; right:-10px; border:none; background-color:var(--color-danger); color:white; border-radius:50%; width:20px; height:20px; font-size:0.75rem; cursor:pointer;">&times;</button>
              </div>
            </div>
          </div>

          <div class="button-row">
            <button class="btn btn-outline" id="step-prev-4"><i class="fa-solid fa-chevron-left"></i> Quay lại</button>
            <button class="btn btn-primary" id="step-next-4">Xem lại thiết kế & Đặt <i class="fa-solid fa-chevron-right"></i></button>
          </div>
        </div>

        <!-- STEP 5 CONTENT: Review design & Add to cart -->
        <div class="step-content ${state.customizer.step === 5 ? 'active' : ''}">
          <div>
            <h3 class="customizer-title">Xem lại thiết kế của bạn</h3>
            <p class="customizer-desc">Xem kỹ bản xem trước Live Preview (bên trái) để chắc chắn mọi thứ hoàn hảo.</p>
            
            <div class="preview-summary-box mb-3">
              <h3>Tóm tắt hộp quà</h3>
              <ul>
                <li><span>Vỏ hộp:</span> <strong>${activeBox.name}</strong></li>
                <li><span>Kích thước:</span> <strong>${activeSize.name}</strong></li>
                <li><span>Buộc ruy băng:</span> <strong>${activeRibbon.name}</strong></li>
                <li><span>Lời chúc:</span> <strong>${state.customizer.cardText ? 'Đã viết' : 'Chưa nhập'}</strong></li>
                <li><span>Hình ảnh đính kèm:</span> <strong>${state.customizer.photo ? 'Có ảnh in' : 'Không'}</strong></li>
                <li><span>Số lượng món:</span> <strong>${state.customizer.items.length} món</strong></li>
              </ul>
            </div>
            
            <div style="background-color: rgba(143,173,136,0.1); border: 1px solid var(--color-accent); padding: 1rem; border-radius: var(--border-radius); font-size: 0.85rem;" class="mb-3">
              <i class="fa-solid fa-leaf"></i> <strong>Tính toán carbon:</strong> Hộp quà này của bạn giúp tránh phát thải ước tính <strong>${(state.customizer.items.length * 0.8).toFixed(1)} kg CO₂e</strong> so với giỏ quà bằng nhựa truyền thống.
            </div>
            
            <!-- Live Preview visual verification check -->
            <div class="form-group mb-3">
              <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
                <input type="checkbox" id="verify-preview-checkbox" style="width:18px; height:18px; accent-color:var(--color-accent);" ${state.customizer.previewed ? 'checked' : ''}>
                <span>Tôi đã xem kỹ bản Preview trực quan và xác nhận thiết kế này chính xác *</span>
              </label>
            </div>
          </div>

          <div class="button-row">
            <button class="btn btn-outline" id="step-prev-5"><i class="fa-solid fa-chevron-left"></i> Quay lại</button>
            <button class="btn btn-primary" id="add-to-cart-custom-btn"><i class="fa-solid fa-cart-shopping"></i> Thêm vào giỏ hàng</button>
          </div>
        </div>
      </div>
    </div>
  `;

  view.innerHTML = html;
  
  // Bind Step clicks
  document.querySelectorAll('.step-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const stepNum = parseInt(btn.dataset.step);
      state.customizer.step = stepNum;
      renderCustomizer();
    });
  });

  // Bind Box selection
  document.querySelectorAll('.box-choice-btn').forEach(card => {
    card.addEventListener('click', () => {
      state.customizer.box = card.dataset.boxId;
      renderCustomizer();
    });
  });

  // Bind Size selection
  document.querySelectorAll('.size-choice-btn').forEach(card => {
    card.addEventListener('click', () => {
      const szId = card.dataset.sizeId;
      state.customizer.size = szId;
      
      // Trim selected items if smaller size selected
      const sz = BOX_SIZES.find(x => x.id === szId);
      if (state.customizer.items.length > sz.maxItems) {
        state.customizer.items = state.customizer.items.slice(0, sz.maxItems);
        showToast(`Hộp mới chỉ chứa tối đa ${sz.maxItems} món. Đã tự động cắt bớt món thừa.`);
      }
      renderCustomizer();
    });
  });

  // Bind Ribbon selection
  document.querySelectorAll('.ribbon-choice-btn').forEach(card => {
    card.addEventListener('click', () => {
      state.customizer.ribbon = card.dataset.ribbonId;
      renderCustomizer();
    });
  });

  // Step navigation buttons inside pages
  const next1 = document.getElementById('step-next-1');
  if (next1) next1.addEventListener('click', () => { state.customizer.step = 2; renderCustomizer(); });
  
  const prev2 = document.getElementById('step-prev-2');
  if (prev2) prev2.addEventListener('click', () => { state.customizer.step = 1; renderCustomizer(); });
  const next2 = document.getElementById('step-next-2');
  if (next2) next2.addEventListener('click', () => { state.customizer.step = 3; renderCustomizer(); });

  const prev3 = document.getElementById('step-prev-3');
  if (prev3) prev3.addEventListener('click', () => { state.customizer.step = 2; renderCustomizer(); });
  const next3 = document.getElementById('step-next-3');
  if (next3) next3.addEventListener('click', () => {
    // Save text from textarea first
    state.customizer.cardText = document.getElementById('customizer-card-text').value;
    state.customizer.step = 4;
    renderCustomizer();
  });

  const prev4 = document.getElementById('step-prev-4');
  if (prev4) prev4.addEventListener('click', () => { state.customizer.step = 3; renderCustomizer(); });
  const next4 = document.getElementById('step-next-4');
  if (next4) next4.addEventListener('click', () => { state.customizer.step = 5; renderCustomizer(); });

  const prev5 = document.getElementById('step-prev-5');
  if (prev5) prev5.addEventListener('click', () => { state.customizer.step = 4; renderCustomizer(); });

  // Bind Item Selection in Step 2
  document.querySelectorAll('.item-choice-card').forEach(card => {
    card.addEventListener('click', () => {
      const prodId = card.dataset.prodId;
      const index = state.customizer.items.indexOf(prodId);
      const szLimit = activeSize.maxItems;

      if (index > -1) {
        // Remove product
        state.customizer.items.splice(index, 1);
      } else {
        // Add product (check size limit)
        if (state.customizer.items.length >= szLimit) {
          showToast(`Kích thước hộp ${activeSize.name} chỉ chứa tối đa ${szLimit} món. Hãy nâng cấp kích cỡ hộp ở Bước 1!`);
          return;
        }
        state.customizer.items.push(prodId);
      }
      renderCustomizer();
    });
  });

  // Greeting card text sync
  const txtArea = document.getElementById('customizer-card-text');
  if (txtArea) {
    txtArea.addEventListener('input', (e) => {
      state.customizer.cardText = e.target.value;
      const previewText = document.querySelector('.preview-card-text');
      const container = document.getElementById('preview-card-container');
      
      if (previewText) previewText.innerText = e.target.value || "Lời chúc của bạn...";
      if (container) container.style.display = e.target.value || state.customizer.photo ? 'flex' : 'none';
    });
  }

  // Card Font select
  document.querySelectorAll('.font-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedFont = btn.dataset.font;
      state.customizer.cardFont = selectedFont;
      
      document.querySelectorAll('.font-btn').forEach(x => x.classList.remove('active'));
      btn.classList.add('active');
      
      const previewText = document.querySelector('.preview-card-text');
      if (previewText) previewText.style.fontFamily = selectedFont;
    });
  });

  // Card Ink select
  document.querySelectorAll('.ink-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const color = dot.dataset.color;
      state.customizer.cardColor = color;
      
      document.querySelectorAll('.ink-dot').forEach(x => x.classList.remove('active'));
      dot.classList.add('active');
      
      const previewText = document.querySelector('.preview-card-text');
      if (previewText) previewText.style.color = color;
    });
  });

  // File Upload handler
  const fileInput = document.getElementById('customizer-photo-file');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          state.customizer.photo = evt.target.result;
          renderCustomizer();
          showToast('Tải ảnh cá nhân thành công!');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Demo Photo select
  document.querySelectorAll('.demo-photo-select').forEach(img => {
    img.addEventListener('click', () => {
      state.customizer.photo = img.src;
      renderCustomizer();
      showToast('Đã chọn hình ảnh mẫu!');
    });
  });

  // Remove Photo handler
  const rmPhoto = document.getElementById('remove-customizer-photo-btn');
  if (rmPhoto) {
    rmPhoto.addEventListener('click', () => {
      state.customizer.photo = null;
      renderCustomizer();
    });
  }

  // Checkbox validation
  const verifyCheck = document.getElementById('verify-preview-checkbox');
  if (verifyCheck) {
    verifyCheck.addEventListener('change', (e) => {
      state.customizer.previewed = e.target.checked;
    });
  }

  // Add to Cart
  const addCartBtn = document.getElementById('add-to-cart-custom-btn');
  if (addCartBtn) {
    addCartBtn.addEventListener('click', () => {
      if (state.customizer.items.length === 0) {
        showToast('Vui lòng thêm ít nhất 1 món quà vào hộp!');
        state.customizer.step = 2;
        renderCustomizer();
        return;
      }
      if (!state.customizer.previewed) {
        showToast('Vui lòng xác nhận đã xem Live Preview thiết kế ở bên trái!');
        return;
      }

      // Add to state cart
      const customBoxId = 'custom-' + Date.now();
      
      // Calculate eco metrics dynamically
      let recycledSum = 0;
      let plasticSavedSum = 0;
      let co2SavedSum = 0;
      
      state.customizer.items.forEach(id => {
        const p = PRODUCTS.find(x => x.id === id);
        if (p) {
          recycledSum += p.dpp.recycledContent;
          plasticSavedSum += p.dpp.virginPlasticReduction;
          co2SavedSum += p.dpp.carbonFootprintAvoided;
        }
      });
      
      const count = state.customizer.items.length;
      const avgRecycled = count > 0 ? Math.round(recycledSum / count) : 90;

      const newCartItem = {
        id: customBoxId,
        type: 'custom',
        box: state.customizer.box,
        size: state.customizer.size,
        ribbon: state.customizer.ribbon,
        items: [...state.customizer.items],
        card: {
          text: state.customizer.cardText,
          font: state.customizer.cardFont,
          color: state.customizer.cardColor
        },
        photo: state.customizer.photo,
        qty: 1,
        price: totalPrice,
        metrics: {
          recycledContent: avgRecycled,
          recyclabilityRate: 100,
          reusablePackaging: activeBox.id === 'box-bamboo' ? 100 : 90,
          renewableMaterial: 95,
          virginPlasticReduction: plasticSavedSum + 100, // include box reduction
          carbonFootprintAvoided: parseFloat((co2SavedSum + activeBox.co2).toFixed(2))
        }
      };

      state.cart.push(newCartItem);
      saveStateToStorage();
      updateCartCount();
      showToast('Đã thêm hộp quà tùy biến vào giỏ hàng thành công!');
      
      // Reset customization options
      state.customizer = {
        step: 1,
        box: BOX_MATERIALS[0].id,
        size: BOX_SIZES[0].id,
        ribbon: RIBBON_TYPES[0].id,
        items: [],
        cardText: '',
        cardFont: 'var(--font-body)',
        cardColor: '#3E3E3E',
        photo: null,
        previewed: false
      };
      
      openCartDrawer();
    });
  }
}

// 3. Shop Page View
function renderShop() {
  const view = document.getElementById('app-view');
  
  let html = `
    <div class="section-title-container">
      <h2>Cửa hàng sản phẩm xanh</h2>
      <p class="section-subtitle">Chất liệu tự nhiên cao cấp, thân thiện với sức khỏe và Trái Đất</p>
    </div>
    
    <div class="shop-layout">
      <!-- Filter Sidebar (Left) -->
      <aside class="shop-sidebar">
        <div class="filter-section">
          <h3>Danh mục</h3>
          <div class="filter-list">
            <label class="filter-item">
              <input type="radio" name="shop-cat-filter" value="all" ${state.shopCategory === 'all' ? 'checked' : ''}>
              <span>Tất cả</span>
            </label>
            ${GIFT_BOX_CATEGORIES.map(cat => `
              <label class="filter-item">
                <input type="radio" name="shop-cat-filter" value="${cat.id}" ${state.shopCategory === cat.id ? 'checked' : ''}>
                <span><i class="fa-solid ${cat.icon}" style="color:${cat.color}; width:16px;"></i> ${cat.nameVi}</span>
              </label>
            `).join('')}
            <label class="filter-item">
              <input type="radio" name="shop-cat-filter" value="item" ${state.shopCategory === 'item' ? 'checked' : ''}>
              <span>Vật phẩm rời</span>
            </label>
          </div>
        </div>

        <div class="filter-section">
          <h3>Mục đích & Dịp tặng</h3>
          <div class="filter-list">
            <label class="filter-item">
              <input type="radio" name="shop-tag-filter" value="all" ${state.shopTag === 'all' ? 'checked' : ''}>
              <span>Tất cả các dịp</span>
            </label>
            <label class="filter-item">
              <input type="radio" name="shop-tag-filter" value="thanks" ${state.shopTag === 'thanks' ? 'checked' : ''}>
              <span>Cảm ơn</span>
            </label>
            <label class="filter-item">
              <input type="radio" name="shop-tag-filter" value="sorry" ${state.shopTag === 'sorry' ? 'checked' : ''}>
              <span>Xin lỗi</span>
            </label>
            <label class="filter-item">
              <input type="radio" name="shop-tag-filter" value="birthday" ${state.shopTag === 'birthday' ? 'checked' : ''}>
              <span>Sinh nhật</span>
            </label>
            <label class="filter-item">
              <input type="radio" name="shop-tag-filter" value="valentine" ${state.shopTag === 'valentine' ? 'checked' : ''}>
              <span>Valentine</span>
            </label>
            <label class="filter-item">
              <input type="radio" name="shop-tag-filter" value="tet" ${state.shopTag === 'tet' ? 'checked' : ''}>
              <span>Ngày Tết</span>
            </label>
            <label class="filter-item">
              <input type="radio" name="shop-tag-filter" value="eco" ${state.shopTag === 'eco' ? 'checked' : ''}>
              <span>Tiêu chuẩn Eco</span>
            </label>
          </div>
        </div>
      </aside>

      <!-- Shop Grid (Right) -->
      <div>
        <div class="featured-grid" id="shop-products-grid">
  `;

  // Filter products list
  let itemsToRender = [];
  
  const isCategoryView = GIFT_BOX_CATEGORIES.some(c => c.id === state.shopCategory);
  
  if (state.shopCategory === 'all' || state.shopCategory === 'item') {
    PRODUCTS.forEach(prod => {
      if (state.shopTag === 'all' || prod.tags.includes(state.shopTag)) {
        if (state.searchQuery === '' || prod.name.toLowerCase().includes(state.searchQuery.toLowerCase())) {
          itemsToRender.push({ data: prod, type: 'item' });
        }
      }
    });
  }

  if (state.shopCategory === 'all' || isCategoryView) {
    // Show category presets if viewing a specific category
    const presetsToShow = isCategoryView
      ? CATEGORY_PRESETS.filter(p => p.category === state.shopCategory)
      : CATEGORY_PRESETS;
    presetsToShow.forEach(box => {
      if (state.shopTag === 'all' || box.tags.includes(state.shopTag)) {
        if (state.searchQuery === '' || box.name.toLowerCase().includes(state.searchQuery.toLowerCase())) {
          itemsToRender.push({ data: box, type: 'category_preset' });
        }
      }
    });
  }

  if (state.shopCategory === 'all' || state.shopCategory === 'preset') {
    PRESET_BOXES.forEach(box => {
      if (state.shopTag === 'all' || box.tags.includes(state.shopTag)) {
        if (state.searchQuery === '' || box.name.toLowerCase().includes(state.searchQuery.toLowerCase())) {
          itemsToRender.push({ data: box, type: 'preset' });
        }
      }
    });
  }

  if (itemsToRender.length === 0) {
    html += `<div style="grid-column: span 3; text-align:center; padding:5rem 0; color:var(--color-text-light);">Không tìm thấy sản phẩm phù hợp.</div>`;
  } else {
    itemsToRender.forEach(item => {
      const isPreset = item.type === 'preset';
      const isCategoryPreset = item.type === 'category_preset';
      const prod = item.data;
      let catInfo = null;
      if (isCategoryPreset) {
        catInfo = GIFT_BOX_CATEGORIES.find(c => c.id === prod.category);
      }
      
      html += `
        <div class="product-card">
          <div class="product-badge-container">
            ${isPreset ? '<span class="tag-badge" style="background-color:var(--color-border);">Combo Đóng Sẵn</span>' : ''}
            ${isCategoryPreset && catInfo ? `<span class="tag-badge" style="background-color:${catInfo.color};">${catInfo.nameVi}</span>` : ''}
            ${!isPreset && !isCategoryPreset ? `<span class="green-badge" onclick="openDppModal('${prod.id}')"><i class="fa-solid fa-leaf"></i> Nhãn Xanh (Passport)</span>` : ''}
          </div>
          <div class="product-img-wrapper">
            <img src="${prod.image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80'}" alt="${prod.name}" onerror="this.onerror=null; this.src='${IMAGE_FALLBACK}';">
          </div>
          <div class="product-info">
            <div class="product-meta">
              <h3>${prod.name}</h3>
              <p class="product-desc">${prod.description}</p>
            </div>
            
            <div class="product-footer">
              <span class="product-price">${formatCurrency(prod.price)}</span>
              ${isPreset || isCategoryPreset ? `
                <button class="btn btn-primary add-preset-btn" data-preset-id="${prod.id}" data-preset-type="${item.type}"><i class="fa-solid fa-basket-shopping"></i> Mua ngay</button>
              ` : `
                <button class="btn btn-outline btn-custom-direct" data-prod-id="${prod.id}"><i class="fa-solid fa-square-plus"></i> Chọn quà</button>
              `}
            </div>
          </div>
        </div>
      `;
    });
  }

  html += `
        </div>
      </div>
    </div>
  `;

  view.innerHTML = html;

  // Bind category filters
  document.querySelectorAll('input[name="shop-cat-filter"]').forEach(input => {
    input.addEventListener('change', (e) => {
      state.shopCategory = e.target.value;
      renderShop();
    });
  });

  // Bind tag filters
  document.querySelectorAll('input[name="shop-tag-filter"]').forEach(input => {
    input.addEventListener('change', (e) => {
      state.shopTag = e.target.value;
      renderShop();
    });
  });

  // Bind Action Buttons
  document.querySelectorAll('.btn-custom-direct').forEach(btn => {
    btn.addEventListener('click', () => {
      const prodId = btn.dataset.prodId;
      state.customizer.items = [prodId];
      navigateTo('customizer');
    });
  });

  // Add preset box directly to cart
  document.querySelectorAll('.add-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const boxId = btn.dataset.presetId;
      const presetType = btn.dataset.presetType;
      let preset = PRESET_BOXES.find(x => x.id === boxId);
      if (!preset && presetType === 'category_preset') {
        preset = CATEGORY_PRESETS.find(x => x.id === boxId);
      }
      if (!preset) return;
      
      const newCartItem = {
        id: 'preset-' + Date.now(),
        type: 'preset',
        name: preset.name,
        image: preset.image,
        qty: 1,
        price: preset.price,
        items: [...preset.items],
        metrics: {
          recycledContent: 75,
          recyclabilityRate: 100,
          reusablePackaging: 90,
          renewableMaterial: 95,
          virginPlasticReduction: 180,
          carbonFootprintAvoided: 1.8
        }
      };

      state.cart.push(newCartItem);
      saveStateToStorage();
      updateCartCount();
      showToast(`Đã thêm ${preset.name} vào giỏ hàng!`);
      openCartDrawer();
    });
  });
}

// 4. B2B Corporate Page View
function renderB2B() {
  const view = document.getElementById('app-view');
  
  // Calculate pricing based on quantity & selected items
  const brandingCost = 500000; // Fixed brand setup
  const itemCost = state.b2b.items.reduce((total, id) => {
    const prod = PRODUCTS.find(x => x.id === id);
    return total + (prod ? prod.price : 0);
  }, 0);
  
  const boxCost = state.b2b.box === 'box-bamboo' ? 65000 : 30000;
  const singleBoxCost = boxCost + itemCost;
  const rawTotal = (singleBoxCost * state.b2b.quantity) + brandingCost;
  
  // Discount structure:
  let discountRate = 0;
  if (state.b2b.quantity >= 200) discountRate = 0.15;
  else if (state.b2b.quantity >= 100) discountRate = 0.10;
  else if (state.b2b.quantity >= 50) discountRate = 0.05;

  const discountAmount = rawTotal * discountRate;
  const finalTotal = rawTotal - discountAmount;

  let html = `
    <div class="section-title-container">
      <h2>Quà tặng Doanh nghiệp (B2B)</h2>
      <p class="section-subtitle">Tùy biến hộp quà đồng bộ nhận diện thương hiệu, chiết khấu hấp dẫn lên tới 15%</p>
    </div>
    
    <div class="b2b-layout">
      <!-- B2B Preview Column (Left) -->
      <div class="b2b-preview-workspace">
        <h3 class="mb-3">Mô phỏng hộp quà thương hiệu</h3>
        <div class="b2b-box-mockup ${state.b2b.box === 'box-bamboo' ? 'bamboo' : ''}" id="b2b-box-mockup">
          <!-- Logo overlay -->
          ${state.b2b.logo ? `<img class="b2b-logo-overlay" src="${state.b2b.logo}" alt="Corporate Logo">` : `<div class="b2b-logo-overlay" style="border: 2px dashed #ccc; padding: 1rem; color: #aaa;">Logo của bạn</div>`}
          <!-- Brand color stripe -->
          <div class="b2b-branding-color-strip" style="background-color: ${state.b2b.color};"></div>
        </div>
        
        <p class="live-preview-overlay-text mb-3">Live Mockup: Hộp khắc Logo & Ruy băng dải màu thương hiệu</p>
        
        <div class="b2b-quote-results">
          <h3>Báo giá dự kiến</h3>
          <div class="b2b-quote-row">
            <span>Số lượng đặt:</span>
            <strong>${state.b2b.quantity} hộp</strong>
          </div>
          <div class="b2b-quote-row">
            <span>Chi phí 1 hộp:</span>
            <strong>${formatCurrency(singleBoxCost)}</strong>
          </div>
          <div class="b2b-quote-row">
            <span>Phí khuôn in & thiết kế logo:</span>
            <strong>${formatCurrency(brandingCost)}</strong>
          </div>
          <div class="b2b-quote-row">
            <span>Chiết khấu số lượng lớn (${discountRate * 100}%):</span>
            <strong style="color:var(--color-accent);">- ${formatCurrency(discountAmount)}</strong>
          </div>
          <div class="b2b-quote-row total">
            <span>Tổng cộng:</span>
            <strong>${formatCurrency(finalTotal)}</strong>
          </div>
        </div>
      </div>

      <!-- B2B Configurator form (Right) -->
      <div class="customizer-panel">
        <div>
          <h3 class="customizer-title">1. Tải logo doanh nghiệp</h3>
          <p class="customizer-desc">Logo định dạng PNG nền trong suốt để in UV/Khắc laser lên nắp hộp quà.</p>
          <div class="photo-uploader">
            <i class="fa-solid fa-file-image"></i>
            <p>Chọn logo thương hiệu</p>
            <input type="file" id="b2b-logo-file" accept="image/*">
          </div>
        </div>

        <div>
          <h3 class="customizer-title">2. Chọn màu chủ đạo thương hiệu</h3>
          <p class="customizer-desc">Chọn màu ruy băng/vạch màu sắc nhận diện chính của doanh nghiệp bạn.</p>
          <div class="form-group">
            <input type="color" id="b2b-color-picker" value="${state.b2b.color}" style="height:50px; width:100%; cursor:pointer;">
          </div>
        </div>

        <div>
          <h3 class="customizer-title">3. Chọn loại hộp quà</h3>
          <div class="selection-grid mb-3">
            <div class="selection-card b2b-box-choice ${state.b2b.box === 'box-kraft' ? 'selected' : ''}" data-box="box-kraft">
              <div class="selection-info">
                <h4>Hộp Giấy Kraft tái chế FSC</h4>
                <p>Phong cách sinh thái, thô mộc, bảo vệ thiên nhiên.</p>
              </div>
              <span class="selection-price">30.000đ</span>
            </div>
            <div class="selection-card b2b-box-choice ${state.b2b.box === 'box-bamboo' ? 'selected' : ''}" data-box="box-bamboo">
              <div class="selection-info">
                <h4>Hộp Tre Đan Thủ Công Nghệ Nhân</h4>
                <p>Đẳng cấp sang trọng, lưu niệm lâu bền.</p>
              </div>
              <span class="selection-price">65.000đ</span>
            </div>
          </div>
        </div>

        <div>
          <h3 class="customizer-title">4. Nhập số lượng hộp</h3>
          <p class="customizer-desc">Chiết khấu: 5% cho &gt;=50 hộp, 10% cho &gt;=100 hộp, 15% cho &gt;=200 hộp.</p>
          <div class="form-group">
            <input type="number" id="b2b-qty-input" value="${state.b2b.quantity}" min="10" step="10">
          </div>
        </div>

        <div>
          <h3 class="customizer-title">5. Yêu cầu báo giá chính thức</h3>
          <p class="customizer-desc">Nhập thông tin liên hệ để nhận cuộc gọi tư vấn và mẫu hộp thực tế.</p>
          <form id="b2b-quote-form" onsubmit="event.preventDefault(); alert('Cảm ơn quý doanh nghiệp! Yêu cầu báo giá của bạn đã được gửi. Đội ngũ B2B của EcoKnot sẽ liên hệ lại trong vòng 2 giờ.'); this.reset();">
            <div class="form-group mb-2">
              <label for="b2b-company">Tên công ty / Doanh nghiệp *</label>
              <input type="text" id="b2b-company" required placeholder="Ví dụ: Công ty Cổ phần Công nghệ Xanh">
            </div>
            <div class="form-group mb-2">
              <label for="b2b-phone">Số điện thoại liên hệ *</label>
              <input type="tel" id="b2b-phone" required placeholder="09xxxxxxxx">
            </div>
            <div class="form-group mb-3">
              <label for="b2b-notes">Yêu cầu đặc biệt</label>
              <textarea id="b2b-notes" rows="3" placeholder="Ví dụ: In thiệp riêng, đóng gói túi vải đay ngoài..."></textarea>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Gửi yêu cầu & Nhận báo giá file PDF</button>
          </form>
        </div>

        <!-- B2B Addresses Management -->
        <div class="b2b-dashboard-preview">
          <h4>Bảng điều khiển B2B - Quản lý nhiều địa chỉ nhận quà</h4>
          <p class="customizer-desc">Đối với đơn hàng lớn, bạn có thể tải lên file danh sách địa chỉ nhận quà của các đối tác khác nhau để EcoKnot giao hàng tận nơi riêng biệt.</p>
          <div class="csv-upload-box" id="csv-upload-area">
            <i class="fa-solid fa-file-csv" style="font-size:2rem; color:var(--color-accent); margin-bottom:0.5rem;"></i>
            <p><strong>Tải lên danh sách địa chỉ nhận quà (.xlsx / .csv)</strong></p>
            <p style="font-size:0.75rem; color:var(--color-text-light); margin-top:0.25rem;">Nhấp vào để tải file excel mẫu</p>
          </div>
        </div>
      </div>
    </div>
  `;

  view.innerHTML = html;

  // Bind B2B actions
  const b2bLogoFile = document.getElementById('b2b-logo-file');
  if (b2bLogoFile) {
    b2bLogoFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          state.b2b.logo = evt.target.result;
          renderB2B();
          showToast('Đã tải lên logo thương hiệu!');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Color picker
  const picker = document.getElementById('b2b-color-picker');
  if (picker) {
    picker.addEventListener('input', (e) => {
      state.b2b.color = e.target.value;
      const stripe = document.querySelector('.b2b-branding-color-strip');
      if (stripe) stripe.style.backgroundColor = e.target.value;
    });
    picker.addEventListener('change', (e) => {
      state.b2b.color = e.target.value;
      renderB2B();
    });
  }

  // Box Choice
  document.querySelectorAll('.b2b-box-choice').forEach(card => {
    card.addEventListener('click', () => {
      state.b2b.box = card.dataset.box;
      renderB2B();
    });
  });

  // Quantity input
  const qtyInput = document.getElementById('b2b-qty-input');
  if (qtyInput) {
    qtyInput.addEventListener('change', (e) => {
      const val = parseInt(e.target.value);
      state.b2b.quantity = isNaN(val) || val < 10 ? 10 : val;
      renderB2B();
    });
  }

  // CSV download simulation
  const csvArea = document.getElementById('csv-upload-area');
  if (csvArea) {
    csvArea.addEventListener('click', () => {
      alert("Đang tải xuống file mẫu: Mau_Dia_Chi_Nhan_Qua_EcoKnot.csv");
      showToast("Tải file mẫu thành công!");
    });
  }
}

// 5. Brand Story Page View (Section 1 to 5)
function renderStory() {
  const view = document.getElementById('app-view');

  let html = `
    <div class="story-container">
      <!-- Section 1: Hero Banner -->
      <section class="story-section full-hero">
        <video class="story-video-bg" autoplay loop muted playsinline>
          <source src="/images/1. Video Hero Banner (Section 1).mp4" type="video/mp4">
        </video>
        <div class="story-overlay"></div>
        <div class="story-hero-content">
          <h1>Hơn cả một vật phẩm, đó là nghệ thuật của sự kết nối.</h1>
          <p>Chúng tôi tin rằng, mỗi món quà được trao đi không chỉ để kỷ niệm một dịp đặc biệt, mà là phương tiện để bạn gửi gắm câu chuyện, cái tôi độc bản và trách nhiệm với hành tinh xanh.</p>
          <button class="btn btn-primary" id="discover-journey-btn">Khám phá hành trình EcoKnot <i class="fa-solid fa-arrow-down"></i></button>
        </div>
      </section>

      <!-- Section 2: Khởi nguồn -->
      <section class="story-split" id="story-section-2">
        <div class="story-split-img">
          <img src="/images/2. Ảnh Khởi nguồn (Section 2 – chia đôi màn hình).png" alt="Khởi nguồn EcoKnot Gifting">
        </div>
        <div class="story-split-content">
          <h2>Khởi nguồn từ một khao khát chân thật</h2>
          <p>Câu chuyện của EcoKnot Gifting bắt đầu từ một sự trăn trở về thị trường quà tặng hiện đại. Đã bao giờ bạn bước vào một cửa hàng, đứng trước hàng chục giỏ quà được đóng gói sẵn sàng, lộng lẫy nhưng lại cảm thấy chúng thật “đại trà” và thiếu vắng đi “hồn cốt” của người tặng?</p>
          <p>Không chỉ vậy, sự lộng lẫy ấy đôi khi phải đánh đổi bằng lớp màng co nhựa cán bóng, những hạt xốp PE khó phân hủy – những thứ sẽ tồn tại hàng trăm năm trên trái đất chỉ sau vài phút mở quà.</p>
          <p>Chúng tôi nhận ra một sự thật ngầm hiểu từ thế hệ trẻ: <em>“Tôi không chỉ muốn tặng một món quà đẹp, tôi muốn món quà đó thể hiện được sự quan tâm của mình và phản ánh những giá trị sống mà tôi theo đuổi”</em>.</p>
          <p>Đó là lúc EcoKnot Gifting ra đời. Chúng tôi không tạo ra một cửa hàng bán quà tặng. Chúng tôi xây dựng một nền tảng để bạn tự tay “đo ni đóng giày” cho từng cảm xúc.</p>
        </div>
      </section>

      <!-- Section 3: Giải mã cái tên -->
      <section class="story-3col">
        <h2>EcoKnot Gifting – Ba mảnh ghép, một triết lý</h2>
        <p class="customizer-desc">Tên gọi của chúng tôi không chỉ là một danh xưng, mà là lời cam kết xuyên suốt chuỗi giá trị:</p>
        
        <div class="story-3col-grid">
          <div class="story-col-item">
            <div class="story-col-icon">
              <!-- Eco: Leaf icon SVG -->
              <svg viewBox="0 0 24 24"><path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.58,20H19V18.5C19,14.43 16.5,12 17,8M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z"/></svg>
            </div>
            <h3>ECO (Bền vững)</h3>
            <p>Là sự trân trọng dành cho Mẹ Thiên Nhiên. Chúng tôi cam kết loại bỏ hoàn toàn nhựa dùng một lần, thay thế bằng giấy kraft tái chế chuẩn FSC, đệm lót bằng giấy tổ ong. Một món quà trao đi, không để lại gánh nặng cho tương lai.</p>
          </div>

          <div class="story-col-item">
            <div class="story-col-icon">
              <!-- Knot: Rope knot icon SVG -->
              <svg viewBox="0 0 24 24"><path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16,11.5A1.5,1.5 0 0,1 17.5,13A1.5,1.5 0 0,1 16,14.5C14.5,14.5 13,13.5 12,12.5C11,13.5 9.5,14.5 8,14.5A1.5,1.5 0 0,1 6.5,13A1.5,1.5 0 0,1 8,11.5C9.5,11.5 11,12.5 12,12.5C13,12.5 14.5,11.5 16,11.5Z"/></svg>
            </div>
            <h3>KNOT (Sự gắn kết)</h3>
            <p>Trong tiếng Anh, “Knot” là nút thắt. Nó vừa là chiếc nơ được thắt tỉ mỉ trên hộp quà, biểu tượng của sự chăm chút tinh tế; vừa ẩn dụ cho sợi dây vô hình gắn kết các mối quan hệ. Mỗi nút thắt là một lần tình cảm được thắt chặt.</p>
          </div>

          <div class="story-col-item">
            <div class="story-col-icon">
              <!-- Gifting: Gift open SVG -->
              <svg viewBox="0 0 24 24"><path d="M19,6H15.17C15.86,5.32 16.34,4.2 16.34,3A3,3 0 0,0 13.34,0C11.9,0 10.63,0.8 10,2C9.37,0.8 8.1,0 6.66,0A3,3 0 0,0 3.66,3C3.66,4.2 4.14,5.32 4.83,6H1C0.45,6 0,6.45 0,7V10C0,10.55 0.45,11 1,11H2V22C2,23.1 2.9,24 4,24H20C21.1,24 22,23.1 22,22V11H23C23.55,11 24,10.55 24,10V7C24,6.45 23.55,6 23,6M6.66,2A1,1 0 0,1 7.66,3A1,1 0 0,1 6.66,4A1,1 0 0,1 5.66,3A1,1 0 0,1 6.66,2M13.34,2A1,1 0 0,1 14.34,3A1,1 0 0,1 13.34,4A1,1 0 0,1 12.34,3A1,1 0 0,1 13.34,2M4,22V11H11V22H4M20,22H13V11H20V22Z"/></svg>
            </div>
            <h3>GIFTING (Trao tặng)</h3>
            <p>Tại đây, bạn không “mua” quà, bạn “tạo” ra nó. Chúng tôi biến hành trình chuẩn bị quà tặng thành một trải nghiệm nghệ thuật, nơi bạn là người thiết kế chính để gửi đi thông điệp ý nghĩa nhất.</p>
          </div>
        </div>
      </section>

      <!-- Section 4: Dấu ấn độc bản -->
      <section class="story-gif-section">
        <div class="story-split-content">
          <h2>Sự chăm chút tỉ mỉ (Thoughtful Craftsmanship) trong kỷ nguyên số</h2>
          <p>Tại EcoKnot Gifting, sự tiện lợi của công nghệ thương mại điện tử không làm mất đi tính thủ công và sự chân thành. Với công cụ Tùy biến (Customization Tool) độc quyền, mọi giới hạn đều bị phá vỡ. Bạn có thể tự do “nhặt” từng món đồ nhỏ, chọn màu sắc hộp, viết lời nhắn riêng và thậm chí in ảnh kỷ niệm lên thiệp ngay trên website.</p>
          <p>Bất kể là một hộp quà cầu kỳ cho dịp Valentine, lễ Kỷ niệm, hay chỉ đơn giản là một món quà “Daily Gift” để nói lời xin lỗi, cảm ơn, hay động viên giữa những ngày mệt mỏi – mọi yêu cầu của bạn đều được đội ngũ của chúng tôi lắp ráp, viết thiệp và thắt nơ hoàn toàn bằng thủ công trước khi trao đến tay người nhận.</p>
          <p>Đặc biệt, sự minh bạch là cam kết hàng đầu. Thông qua “Hồ sơ sản phẩm điện tử” (Digital Product Passport), bạn hoàn toàn nắm rõ câu chuyện đằng sau mỗi hộp trà, mỗi hũ nến thơm: chúng đến từ đâu, làm từ chất liệu gì và giúp giảm thiểu bao nhiêu lượng carbon. Chúng tôi gọi đó là sự tiêu dùng có ý thức!</p>
        </div>
        <div class="story-gif-wrapper">
          <video autoplay loop muted playsinline style="width:100%; height:100%; object-fit:cover;">
            <source src="/images/4. VideoGIF Tùy biến (Section 4).mp4" type="video/mp4">
          </video>
        </div>
      </section>

      <!-- Section 5: Lời kết & CTA -->
      <section class="story-cta-section">
        <img class="story-bg-img" src="/images/5. Ảnh nền CTA kết (Section 5).png" alt="Lời kết EcoKnot">
        <div class="story-overlay"></div>
        <div class="story-cta-content">
          <h3>Hãy để chúng tôi kể câu chuyện của bạn!</h3>
          <p>Một món quà đúng nghĩa sẽ không nằm im trên kệ. Nó mang theo nhịp đập của sự chân thành và hơi thở của thiên nhiên. Bạn đã sẵn sàng để tạo nên món quà độc bản của riêng mình chưa?</p>
          
          <div class="story-cta-buttons">
            <button class="btn btn-primary" id="story-cta-custom">Bắt đầu thiết kế hộp quà</button>
            <button class="btn btn-outline" id="story-cta-shop" style="color:white; border-color:white;">Khám phá sản phẩm xanh</button>
          </div>
        </div>
      </section>
    </div>
  `;

  view.innerHTML = html;

  // Bind events
  document.getElementById('discover-journey-btn').addEventListener('click', () => {
    document.getElementById('story-section-2').scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('story-cta-custom').addEventListener('click', () => navigateTo('customizer'));
  document.getElementById('story-cta-shop').addEventListener('click', () => navigateTo('shop'));
}

// 6. Order Tracking Page View
function renderTracking() {
  const view = document.getElementById('app-view');

  let html = `
    <div class="section-title-container">
      <h2>Theo dõi đơn hàng</h2>
      <p class="section-subtitle">Minh bạch hành trình giao quà của bạn với timeline chi tiết</p>
    </div>
    
    <div class="tracking-search-box">
      <h3>Tra cứu bằng Mã vận đơn / Mã đơn hàng</h3>
      <p style="font-size:0.85rem; color:var(--color-text-light); margin-top:0.25rem;">(Thử nhập mã: <strong>EK-1001</strong> hoặc <strong>EK-1002</strong> để xem mẫu)</p>
      <div class="tracking-input-row">
        <input type="text" id="tracking-id-input" placeholder="Nhập mã đơn hàng (Ví dụ: EK-1001)...">
        <button class="btn btn-primary" id="tracking-search-btn"><i class="fa-solid fa-magnifying-glass"></i> Tra cứu</button>
      </div>
    </div>
    
    <div class="tracking-timeline-container" id="tracking-results-container" style="display:none;">
      <!-- Filled dynamically -->
    </div>
  `;

  view.innerHTML = html;

  const btn = document.getElementById('tracking-search-btn');
  const input = document.getElementById('tracking-id-input');
  if (btn && input) {
    const handleSearch = () => {
      const orderId = input.value.trim().toUpperCase();
      if (!orderId) {
        showToast('Vui lòng nhập mã đơn hàng!');
        return;
      }
      
      const order = state.orders.find(x => x.id === orderId);
      const resultsContainer = document.getElementById('tracking-results-container');
      
      if (!order) {
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = `
          <div class="text-center" style="color:var(--color-danger); padding:2rem 0;">
            <i class="fa-solid fa-triangle-exclamation" style="font-size:2rem; margin-bottom:1rem;"></i>
            <p>Không tìm thấy mã đơn hàng <strong>${orderId}</strong>. Vui lòng kiểm tra lại!</p>
          </div>
        `;
        return;
      }

      // Render vertical timeline
      resultsContainer.style.display = 'block';
      
      let trackingHtml = `
        <div class="tracking-timeline-header">
          <div>
            <h3>Đơn hàng: ${order.id}</h3>
            <span class="timeline-time">Ngày đặt: ${order.date}</span>
          </div>
          <span class="status-badge ${order.status}">${order.statusText}</span>
        </div>
        
        <div class="vertical-timeline">
      `;

      // Stages: Thiết kế hoàn tất -> Đang đóng gói -> Đã giao cho vận chuyển -> Đang vận chuyển -> Đã giao
      const stages = [
        { key: 'confirmed', label: 'Thiết kế hoàn tất & Xác nhận đơn', icon: '<i class="fa-solid fa-check"></i>' },
        { key: 'processing', label: 'Đang đóng gói thủ công (Giấy tổ ong, nơ đay)', icon: '<i class="fa-solid fa-box-open"></i>' },
        { key: 'shipping_handover', label: 'Đã giao cho vận chuyển carbon thấp', icon: '<i class="fa-solid fa-truck-ramp-box"></i>' },
        { key: 'shipping', label: 'Đang trên đường vận chuyển', icon: '<i class="fa-solid fa-truck-fast"></i>' },
        { key: 'delivered', label: 'Đã giao hàng thành công', icon: '<i class="fa-solid fa-house-chimney-user"></i>' }
      ];

      // Determine how many stages are completed
      let activeIndex = 0;
      if (order.status === 'confirmed') activeIndex = 0;
      else if (order.status === 'processing') activeIndex = 1;
      else if (order.status === 'shipping') activeIndex = 3;
      else if (order.status === 'delivered') activeIndex = 4;

      stages.forEach((stage, idx) => {
        const isCompleted = idx < activeIndex || order.status === 'delivered';
        const isActive = idx === activeIndex && order.status !== 'delivered';
        
        let timeText = '';
        if (isCompleted || isActive) {
          // Bind mock timestamps from tracking logs if available
          const log = order.tracking[idx] || order.tracking[order.tracking.length - 1];
          timeText = log ? log.time : '';
        }

        trackingHtml += `
          <div class="timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}">
            <div class="timeline-node">${stage.icon}</div>
            <div class="timeline-details">
              ${timeText ? `<span class="timeline-time">${timeText}</span>` : ''}
              <span class="timeline-desc">${stage.label}</span>
              ${isActive ? `<span style="font-size:0.8rem; color:var(--color-accent); font-weight:600;"><i class="fa-solid fa-spinner fa-spin"></i> Trạng thái hiện tại</span>` : ''}
            </div>
          </div>
        `;
      });

      trackingHtml += `
        </div>
      `;
      resultsContainer.innerHTML = trackingHtml;
    };

    btn.addEventListener('click', handleSearch);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSearch();
    });
  }
}

// 7. My Account Page View
function renderAccount() {
  const view = document.getElementById('app-view');
  
  if (!state.user) {
    // If not logged in, force onboarding modal to collect email/password
    openOnboardingSurvey();
    view.innerHTML = `
      <div class="text-center" style="padding:4rem 0;">
        <i class="fa-solid fa-lock" style="font-size:2rem; color:var(--color-border); margin-bottom:1rem;"></i>
        <p>Vui lòng hoàn tất khảo sát Preference Profile hoặc đăng nhập để quản lý tài khoản.</p>
        <button class="btn btn-primary mt-2" onclick="openOnboardingSurvey()">Tạo tài khoản & Đăng ký</button>
      </div>
    `;
    return;
  }

  // Calculate aggregated Personal Sustainability Dashboard stats
  let totalOrdersCount = state.orders.length;
  let totalCO2Saved = state.orders.reduce((total, o) => total + o.metrics.carbonFootprintAvoided, 0);
  let totalPlasticSaved = state.orders.reduce((total, o) => total + o.metrics.virginPlasticReduction, 0);
  let avgRecycledRate = state.orders.reduce((total, o) => total + o.metrics.recycledContent, 0);
  avgRecycledRate = totalOrdersCount > 0 ? Math.round(avgRecycledRate / totalOrdersCount) : 0;

  let html = `
    <div class="section-title-container">
      <h2>Tài khoản của tôi</h2>
      <p class="section-subtitle">Quản lý hồ sơ, theo dõi chỉ số xanh cá nhân và thiết lập AI</p>
    </div>
    
    <div class="account-layout">
      <!-- Sidebar Navigation -->
      <aside class="account-sidebar">
        <button class="account-tab-btn active" data-tab="orders"><i class="fa-solid fa-box"></i> Đơn hàng của tôi</button>
        <button class="account-tab-btn" data-tab="sustainability"><i class="fa-solid fa-leaf"></i> Dashboard Bền vững</button>
        <button class="account-tab-btn" data-tab="preferences"><i class="fa-solid fa-sliders"></i> Hồ sơ sở thích</button>
        <button class="account-tab-btn" data-tab="settings"><i class="fa-solid fa-brain"></i> Cài đặt AI & Bảo mật</button>
      </aside>

      <!-- Content Panels -->
      <div class="account-content">
        
        <!-- Tab 1: Orders -->
        <div class="account-panel active" id="panel-orders">
          <div class="panel-header">
            <h2>Lịch sử mua hàng</h2>
          </div>
          <div class="orders-table-wrapper">
            <table class="orders-table">
              <thead>
                <tr>
                  <th>Mã đơn hàng</th>
                  <th>Ngày đặt</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
  `;

  state.orders.forEach(o => {
    html += `
      <tr>
        <td><strong>${o.id}</strong></td>
        <td>${o.date}</td>
        <td>${formatCurrency(o.total)}</td>
        <td><span class="status-badge ${o.status}">${o.statusText}</span></td>
        <td>
          <button class="btn btn-outline" style="padding:0.25rem 0.5rem; font-size:0.8rem;" onclick="document.getElementById('tracking-id-input').value='${o.id}'; navigateTo('tracking'); document.getElementById('tracking-search-btn').click();">
            <i class="fa-solid fa-location-dot"></i> Định vị
          </button>
        </td>
      </tr>
    `;
  });

  html += `
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab 2: Personal Sustainability Dashboard -->
        <div class="account-panel" id="panel-sustainability">
          <div class="panel-header">
            <h2>Personal Sustainability Dashboard</h2>
          </div>
          <p class="customizer-desc mb-3">Tóm tắt các đóng góp sinh thái cộng dồn của bạn từ những hộp quà EcoKnot đã mua:</p>
          
          <div class="sustainability-dashboard-grid">
            <div class="sd-card">
              <i class="fa-solid fa-cloud-sun"></i>
              <span>CO₂ Tránh phát thải</span>
              <strong>${totalCO2Saved.toFixed(1)} kg CO₂e</strong>
            </div>
            <div class="sd-card">
              <i class="fa-solid fa-trash-arrow-up"></i>
              <span>Giảm thiểu nhựa nguyên sinh</span>
              <strong>${totalPlasticSaved}g</strong>
            </div>
            <div class="sd-card">
              <i class="fa-solid fa-leaf"></i>
              <span>Vật liệu tái chế trung bình</span>
              <strong>${avgRecycledRate}%</strong>
            </div>
          </div>

          <div style="background-color: var(--bg-primary); border: 1px solid var(--color-border-light); padding: 1.5rem; border-radius: var(--border-radius);">
            <h3 class="mb-2">Ghi nhận chứng nhận xanh cá nhân</h3>
            <p style="font-size:0.9rem;" class="mb-2">Bạn đang nằm trong <strong>TOP 12%</strong> những đại sứ tiêu dùng xanh tích cực nhất cộng đồng EcoKnot Gifting quý II/2026.</p>
            <div class="progress-bar" style="height:12px;"><div class="progress-bar-fill" style="width: 88%"></div></div>
            <span class="footnote" style="margin-top:0.5rem;">* Dựa trên các thuật toán đánh giá vòng đời sản phẩm nội bộ (LCA).</span>
          </div>
        </div>

        <!-- Tab 3: Preference Profile -->
        <div class="account-panel" id="panel-preferences">
          <div class="panel-header">
            <h2>Hồ sơ sở thích quà tặng</h2>
          </div>
          <p class="customizer-desc mb-3">Cập nhật hồ sơ để AI gợi ý đúng gu và phù hợp nhất với mong muốn của bạn.</p>
          
          <form id="preference-edit-form" class="preferences-form-grid" onsubmit="event.preventDefault();">
            <div class="form-group">
              <label>Đối tượng thường tặng quà</label>
              <select id="pref-recipient">
                <option value="friends" ${state.user.preferenceProfile.recipient.includes('friends') ? 'selected' : ''}>Bạn bè</option>
                <option value="lovers" ${state.user.preferenceProfile.recipient.includes('lovers') ? 'selected' : ''}>Người yêu</option>
                <option value="family" ${state.user.preferenceProfile.recipient.includes('family') ? 'selected' : ''}>Gia đình</option>
                <option value="colleagues" ${state.user.preferenceProfile.recipient.includes('colleagues') ? 'selected' : ''}>Đồng nghiệp</option>
                <option value="partners" ${state.user.preferenceProfile.recipient.includes('partners') ? 'selected' : ''}>Đối tác doanh nghiệp</option>
              </select>
            </div>

            <div class="form-group">
              <label>Phong cách ưa thích</label>
              <select id="pref-style">
                <option value="minimal" ${state.user.preferenceProfile.style === 'minimal' ? 'selected' : ''}>Tối giản (Minimal)</option>
                <option value="vintage" ${state.user.preferenceProfile.style === 'vintage' ? 'selected' : ''}>Cổ điển (Vintage)</option>
                <option value="luxury" ${state.user.preferenceProfile.style === 'luxury' ? 'selected' : ''}>Sang trọng (Luxury)</option>
                <option value="eco" ${state.user.preferenceProfile.style === 'eco' ? 'selected' : ''}>Mộc mạc (Eco)</option>
                <option value="cute" ${state.user.preferenceProfile.style === 'cute' ? 'selected' : ''}>Đáng yêu (Cute)</option>
              </select>
            </div>

            <div class="form-group">
              <label>Mức ngân sách tối ưu</label>
              <select id="pref-budget">
                <option value="under_300" ${state.user.preferenceProfile.budget === 'under_300' ? 'selected' : ''}>Dưới 300.000đ</option>
                <option value="300_500" ${state.user.preferenceProfile.budget === '300_500' ? 'selected' : ''}>300.000đ – 500.000đ</option>
                <option value="500_1000" ${state.user.preferenceProfile.budget === '500_1000' ? 'selected' : ''}>500.000đ – 1.000.000đ</option>
                <option value="over_1000" ${state.user.preferenceProfile.budget === 'over_1000' ? 'selected' : ''}>Trên 1.000.000đ</option>
              </select>
            </div>

            <div class="form-group slider-container">
              <label>Độ quan tâm đến bảo vệ môi trường</label>
              <div class="slider-labels">
                <span>Cơ bản</span>
                <span>Tuyệt đối (Eco-first)</span>
              </div>
              <input type="range" class="eco-slider" id="pref-sustainability" min="1" max="5" value="${state.user.preferenceProfile.sustainabilityScore}">
            </div>

            <div class="form-group full-width">
              <button class="btn btn-primary" id="save-preference-btn">Lưu hồ sơ sở thích</button>
            </div>
          </form>
        </div>

        <!-- Tab 4: AI Settings & Security -->
        <div class="account-panel" id="panel-settings">
          <div class="panel-header">
            <h2>AI Transparency & Data Control Panel</h2>
          </div>
          <div class="settings-list">
            
            <div class="settings-row">
              <div class="settings-info">
                <h4>Đề xuất cá nhân hóa (AI Recommendation)</h4>
                <p>Cho phép AI phân tích sở thích để tự động tùy chỉnh giao diện và đề xuất sản phẩm.</p>
              </div>
              <label class="switch">
                <input type="checkbox" id="ai-toggle" ${state.aiEnabled ? 'checked' : ''}>
                <span class="slider-toggle"></span>
              </label>
            </div>

            <div class="settings-row" style="align-items: flex-start;">
              <div class="settings-info">
                <h4>Hồ sơ từ khóa AI đã ghi nhận (AI Learned Profile)</h4>
                <p>Bản tóm tắt các thẻ chủ đề AI suy luận từ thói quen duyệt web của bạn:</p>
                <div class="learned-tags-container">
                  <span class="learned-tag">Sản phẩm tự nhiên</span>
                  <span class="learned-tag">Hộp giấy Kraft</span>
                  <span class="learned-tag">Nến thơm thư giãn</span>
                  <span class="learned-tag">Quà sinh nhật</span>
                  <span class="learned-tag">Giảm thiểu CO2</span>
                </div>
              </div>
            </div>

            <div class="settings-row">
              <div class="settings-info">
                <h4>Đặt lại hồ sơ AI (Reset Machine Learning Profile)</h4>
                <p>Xoá tất cả lịch sử và đưa thuật toán học máy về trạng thái mặc định ban đầu.</p>
              </div>
              <button class="btn btn-outline btn-danger" style="padding:0.5rem 1rem; font-size:0.85rem;" id="reset-ai-btn">Đặt lại</button>
            </div>

            <div class="settings-row">
              <div class="settings-info">
                <h4>Xóa lịch sử cá nhân hóa</h4>
                <p>Xóa toàn bộ log click, thời gian duyệt trang của phiên trước đó.</p>
              </div>
              <button class="btn btn-outline" style="padding:0.5rem 1rem; font-size:0.85rem;" id="delete-history-btn">Xóa lịch sử</button>
            </div>

            <div class="settings-row" style="border-top: 2px solid rgba(217,83,79,0.15); padding-top:1rem;">
              <div class="settings-info">
                <h4 style="color:var(--color-danger);">Đăng xuất</h4>
                <p>Đăng xuất khỏi tài khoản EcoKnot của bạn.</p>
              </div>
              <button class="btn btn-danger" style="padding:0.5rem 1rem; font-size:0.85rem;" id="account-logout-btn"><i class="fa-solid fa-right-from-bracket"></i> Đăng xuất</button>
            </div>

            <div class="settings-row">
              <div class="settings-info">
                <h4>Tải xuống toàn bộ dữ liệu cá nhân (Right to Portability)</h4>
                <p>Xuất file định dạng JSON chứa thông tin tài khoản, sở thích và hóa đơn.</p>
              </div>
              <button class="btn btn-outline" style="padding:0.5rem 1rem; font-size:0.85rem;" id="download-data-btn"><i class="fa-solid fa-download"></i> Tải xuống JSON</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;

  view.innerHTML = html;

  // Bind Sidebar tabs
  document.querySelectorAll('.account-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      
      document.querySelectorAll('.account-tab-btn').forEach(x => x.classList.remove('active'));
      document.querySelectorAll('.account-panel').forEach(x => x.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(`panel-${tab}`).classList.add('active');
    });
  });

  // Save preference handler
  const savePrefBtn = document.getElementById('save-preference-btn');
  if (savePrefBtn) {
    savePrefBtn.addEventListener('click', () => {
      const recipient = document.getElementById('pref-recipient').value;
      const style = document.getElementById('pref-style').value;
      const budget = document.getElementById('pref-budget').value;
      const sustain = parseInt(document.getElementById('pref-sustainability').value);

      state.user.preferenceProfile.recipient = [recipient];
      state.user.preferenceProfile.style = style;
      state.user.preferenceProfile.budget = budget;
      state.user.preferenceProfile.sustainabilityScore = sustain;

      saveStateToStorage();
      showToast('Đã lưu cập nhật Hồ sơ sở thích thành công!');
    });
  }

  // AI Enabled Toggle
  const aiToggle = document.getElementById('ai-toggle');
  if (aiToggle) {
    aiToggle.addEventListener('change', (e) => {
      state.aiEnabled = e.target.checked;
      saveStateToStorage();
      showToast(state.aiEnabled ? 'Đã kích hoạt AI gợi ý cá nhân hóa!' : 'Đã tắt AI. Bạn sẽ thấy đề xuất mặc định.');
    });
  }

  // Reset AI Profile
  const resetAiBtn = document.getElementById('reset-ai-btn');
  if (resetAiBtn) {
    resetAiBtn.addEventListener('click', () => {
      if (confirm('Bạn có chắc chắn muốn đặt lại hồ sơ AI? Bạn sẽ phải làm lại survey khảo sát.')) {
        state.onboardingCurrentStep = 0;
        state.onboardingAnswers = {};
        openOnboardingSurvey();
      }
    });
  }

  // Delete history log
  const delHistBtn = document.getElementById('delete-history-btn');
  if (delHistBtn) {
    delHistBtn.addEventListener('click', () => {
      state.aiHistoryDeleted = true;
      showToast('Đã xóa toàn bộ lịch sử tương tác cá nhân hóa!');
    });
  }

  // Logout from Account page
  const accountLogoutBtn = document.getElementById('account-logout-btn');
  if (accountLogoutBtn) {
    accountLogoutBtn.addEventListener('click', () => {
      state.user = null;
      localStorage.removeItem('ek_user');
      updateAuthUI();
      showToast('Đã đăng xuất!');
      navigateTo('home');
    });
  }

  // Download Data JSON
  const downloadBtn = document.getElementById('download-data-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.user));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `ecoknot_data_portability_${state.user.email}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Xuất dữ liệu cá nhân thành công!');
    });
  }
}

// ==========================================================================
// SMART CART DRAWER MANAGEMENT
// ==========================================================================
function openCartDrawer() {
  renderCartItems();
  document.getElementById('cart-drawer').classList.add('active');
}

function closeCartDrawer() {
  document.getElementById('cart-drawer').classList.remove('active');
}

function renderCartItems() {
  const container = document.getElementById('cart-items');
  const totalPriceEl = document.getElementById('cart-total-price');
  const totalCo2SavedEl = document.getElementById('cart-co2-saved');
  
  if (state.cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <i class="fa-solid fa-basket-shopping"></i>
        <p>Giỏ hàng của bạn đang trống.</p>
        <a href="#customizer" class="btn btn-primary" onclick="closeCartDrawer();">Bắt đầu tạo hộp quà</a>
      </div>
    `;
    totalPriceEl.innerText = '0đ';
    totalCo2SavedEl.innerText = '0';
    return;
  }

  let html = '';
  let totalPrice = 0;
  let totalCo2Saved = 0;

  state.cart.forEach((item, index) => {
    totalPrice += item.price * item.qty;
    totalCo2Saved += item.metrics.carbonFootprintAvoided * item.qty;

    if (item.type === 'custom') {
      const box = BOX_MATERIALS.find(x => x.id === item.box);
      const size = BOX_SIZES.find(x => x.id === item.size);
      const ribbon = RIBBON_TYPES.find(x => x.id === item.ribbon);
      
      const itemNames = item.items.map(id => PRODUCTS.find(x => x.id === id)?.name).join(', ');

      html += `
        <div class="cart-item">
          <div class="cart-item-header">
            <div class="cart-item-preview-img" style="background-color:${box.id === 'box-bamboo' ? '#e3dac9' : '#f3ede2'}; border: 2px solid ${ribbon.color}; position:relative; overflow:hidden;">
              ${item.photo ? `<img src="${item.photo}" style="width:100%; height:100%; object-fit:cover;">` : `<i class="fa-solid fa-gift" style="font-size:1.5rem; color:${ribbon.color}; position:absolute; top:50%; left:50%; transform:translate(-50%, -50%);"></i>`}
            </div>
            <div class="cart-item-title-info">
              <h4>Hộp quà Custom (${size.name})</h4>
              <span class="cart-item-price">${formatCurrency(item.price)}</span>
            </div>
          </div>
          <div class="cart-item-selections">
            <ul>
              <li><strong>Hộp:</strong> ${box.name}</li>
              <li><strong>Quà:</strong> ${itemNames || 'Chưa chọn quà'}</li>
              <li><strong>Ruy băng:</strong> ${ribbon.name}</li>
              ${item.card.text ? `<li><strong>Thiệp:</strong> "${item.card.text.substring(0, 15)}..."</li>` : ''}
            </ul>
          </div>
          <div class="cart-item-actions">
            <div class="qty-control">
              <button onclick="updateCartItemQty(${index}, -1)">-</button>
              <span>${item.qty}</span>
              <button onclick="updateCartItemQty(${index}, 1)">+</button>
            </div>
            <div class="cart-action-links">
              <button class="cart-action-btn cart-action-edit" onclick="editCartItem('${item.id}')"><i class="fa-solid fa-pen"></i> Sửa</button>
              <button class="cart-action-btn cart-action-remove" onclick="removeCartItem(${index})"><i class="fa-solid fa-trash-can"></i> Xóa</button>
            </div>
          </div>
        </div>
      `;
    } else {
      // Preset gift box
      html += `
        <div class="cart-item">
          <div class="cart-item-header">
            <img class="cart-item-preview-img" src="${item.image}" alt="${item.name}" onerror="this.onerror=null; this.src='${IMAGE_FALLBACK}';">
            <div class="cart-item-title-info">
              <h4>${item.name}</h4>
              <span class="cart-item-price">${formatCurrency(item.price)}</span>
            </div>
          </div>
          <div class="cart-item-actions">
            <div class="qty-control">
              <button onclick="updateCartItemQty(${index}, -1)">-</button>
              <span>${item.qty}</span>
              <button onclick="updateCartItemQty(${index}, 1)">+</button>
            </div>
            <div class="cart-action-links">
              <button class="cart-action-btn cart-action-remove" onclick="removeCartItem(${index})"><i class="fa-solid fa-trash-can"></i> Xóa</button>
            </div>
          </div>
        </div>
      `;
    }
  });

  container.innerHTML = html;
  totalPriceEl.innerText = formatCurrency(totalPrice);
  totalCo2SavedEl.innerText = totalCo2Saved.toFixed(1);
}

// Global expose cart functions for onclick
window.updateCartItemQty = function(index, delta) {
  const item = state.cart[index];
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) {
      state.cart.splice(index, 1);
    }
    saveStateToStorage();
    updateCartCount();
    renderCartItems();
  }
};

window.removeCartItem = function(index) {
  state.cart.splice(index, 1);
  saveStateToStorage();
  updateCartCount();
  renderCartItems();
  showToast('Đã xóa sản phẩm khỏi giỏ hàng.');
};

window.editCartItem = function(id) {
  const item = state.cart.find(x => x.id === id);
  if (item) {
    // Load to active customizer
    state.customizer = {
      step: 1,
      box: item.box,
      size: item.size,
      ribbon: item.ribbon,
      items: [...item.items],
      cardText: item.card.text,
      cardFont: item.card.font,
      cardColor: item.card.color,
      photo: item.photo,
      previewed: true // Pre-verified since it is from cart
    };
    
    // Remove from cart so we can edit it and re-add
    state.cart = state.cart.filter(x => x.id !== id);
    saveStateToStorage();
    updateCartCount();
    
    closeCartDrawer();
    navigateTo('customizer');
    showToast('Đã tải thiết kế hộp quà để chỉnh sửa.');
  }
};

// Checkout simulation
function simulateCheckout() {
  if (state.cart.length === 0) return;
  
  if (!state.user) {
    showToast("Vui lòng hoàn tất khảo sát/đăng ký tài khoản để thanh toán!");
    openOnboardingSurvey();
    closeCartDrawer();
    return;
  }

  const orderId = 'EK-' + (1000 + state.orders.length + 1);
  const total = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  
  // Calculate aggregated metrics
  let recycledTotal = 0;
  let plasticSaved = 0;
  let co2Saved = 0;
  
  state.cart.forEach(item => {
    recycledTotal += item.metrics.recycledContent * item.qty;
    plasticSaved += item.metrics.virginPlasticReduction * item.qty;
    co2Saved += item.metrics.carbonFootprintAvoided * item.qty;
  });
  
  const count = state.cart.reduce((sum, item) => sum + item.qty, 0);

  const newOrder = {
    id: orderId,
    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    total: total,
    status: 'confirmed',
    statusText: 'Đã xác nhận thanh toán',
    items: state.cart.map(x => ({ name: x.type === 'custom' ? 'Hộp quà tùy biến' : x.name, qty: x.qty, price: x.price })),
    tracking: [
      { time: new Date().toISOString().replace('T', ' ').substring(0, 16), desc: "Đặt hàng thành công và thanh toán hoàn tất" }
    ],
    metrics: {
      recycledContent: Math.round(recycledTotal / count),
      recyclabilityRate: 100,
      reusablePackaging: 90,
      renewableMaterial: 95,
      virginPlasticReduction: plasticSaved,
      carbonFootprintAvoided: co2Saved
    }
  };

  state.orders.unshift(newOrder); // Add to beginning of orders
  state.cart = []; // clear cart
  
  saveStateToStorage();
  updateCartCount();
  closeCartDrawer();
  
  alert(`Chúc mừng! Bạn đã đặt hàng thành công. Mã đơn hàng của bạn là: ${orderId}. Bạn có thể theo dõi hành trình giao quà của mình.`);
  navigateTo('account');
}

// ==========================================================================
// INITIALIZATION & BINDINGS
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Load state
  loadStateFromStorage();
  
  // Router hash listener
  window.addEventListener('hashchange', () => {
    const route = window.location.hash.substring(1) || 'home';
    navigateTo(route);
  });

  // Init initial page
  const initialRoute = window.location.hash.substring(1) || 'home';
  navigateTo(initialRoute);

  // Bind static header events
  document.getElementById('nav-logo').addEventListener('click', () => navigateTo('home'));
  
  document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const route = link.dataset.route;
      navigateTo(route);
    });
  });

  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const closeMobileNav = document.getElementById('close-mobile-nav');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => mobileNav.classList.add('active'));
  }
  if (closeMobileNav && mobileNav) {
    closeMobileNav.addEventListener('click', () => mobileNav.classList.remove('active'));
  }

  // Auth: Login button
  const loginHeaderBtn = document.getElementById('login-header-btn');
  const loginModal = document.getElementById('login-modal');
  const closeLoginBtn = document.getElementById('close-login-btn');
  const loginSubmitBtn = document.getElementById('login-submit-btn');
  const loginToOnboarding = document.getElementById('login-to-onboarding');

  if (loginHeaderBtn) {
    loginHeaderBtn.addEventListener('click', () => loginModal.classList.add('active'));
  }
  if (closeLoginBtn) {
    closeLoginBtn.addEventListener('click', () => loginModal.classList.remove('active'));
  }
  if (loginModal) {
    loginModal.addEventListener('click', (e) => {
      if (e.target === loginModal) loginModal.classList.remove('active');
    });
  }
  if (loginSubmitBtn) {
    loginSubmitBtn.addEventListener('click', () => {
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value.trim();
      if (!email || !password) {
        showToast('Vui lòng nhập email và mật khẩu!');
        return;
      }
      state.user = {
        email,
        password,
        preferenceProfile: {
          recipient: ['friends'],
          interests: ['eco'],
          budget: '300_500',
          occasions: ['birthday'],
          style: 'eco',
          sustainabilityScore: 4
        }
      };
      saveStateToStorage();
      updateAuthUI();
      loginModal.classList.remove('active');
      document.getElementById('login-email').value = '';
      document.getElementById('login-password').value = '';
      showToast('Đăng nhập thành công!');
      renderHome();
    });
  }
  if (loginToOnboarding) {
    loginToOnboarding.addEventListener('click', (e) => {
      e.preventDefault();
      loginModal.classList.remove('active');
      openOnboardingSurvey();
    });
  }

  // Auth: User dropdown toggle
  const accountBtn = document.getElementById('account-btn');
  const userDropdown = document.getElementById('user-dropdown');
  
  if (accountBtn) {
    accountBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (state.user) {
        userDropdown.classList.toggle('show');
      } else {
        loginModal.classList.add('active');
      }
    });
  }

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (userDropdown && !e.target.closest('.user-menu')) {
      userDropdown.classList.remove('show');
    }
  });

  // Dropdown: Account link
  const dropdownAccountLink = document.getElementById('dropdown-account-link');
  if (dropdownAccountLink) {
    dropdownAccountLink.addEventListener('click', () => {
      userDropdown.classList.remove('show');
      navigateTo('account');
    });
  }

  // Dropdown: Logout
  const dropdownLogoutBtn = document.getElementById('dropdown-logout-btn');
  if (dropdownLogoutBtn) {
    dropdownLogoutBtn.addEventListener('click', () => {
      state.user = null;
      localStorage.removeItem('ek_user');
      updateAuthUI();
      userDropdown.classList.remove('show');
      showToast('Đã đăng xuất!');
      renderHome();
    });
  }

  // Onboarding Modal skip
  const skipBtn = document.getElementById('skip-onboarding-btn');
  if (skipBtn) {
    skipBtn.addEventListener('click', closeOnboarding);
  }

  const closeObBtn = document.getElementById('close-onboarding-btn');
  if (closeObBtn) {
    closeObBtn.addEventListener('click', closeOnboarding);
  }

  // Onboarding Start
  const startObBtn = document.getElementById('start-onboarding-btn');
  if (startObBtn) {
    startObBtn.addEventListener('click', () => {
      state.onboardingCurrentStep = 1;
      renderOnboardingStep();
    });
  }

  // Finish Onboarding
  const finishObBtn = document.getElementById('finish-onboarding-btn');
  if (finishObBtn) {
    finishObBtn.addEventListener('click', closeOnboarding);
  }

  // Cart Drawer toggles
  const cartToggle = document.getElementById('cart-toggle-btn');
  const closeCart = document.getElementById('close-cart-btn');
  const cartOverlay = document.getElementById('cart-drawer');

  if (cartToggle) cartToggle.addEventListener('click', openCartDrawer);
  if (closeCart) closeCart.addEventListener('click', closeCartDrawer);
  
  // Close cart on overlay click
  if (cartOverlay) {
    cartOverlay.addEventListener('click', (e) => {
      if (e.target === cartOverlay) closeCartDrawer();
    });
  }

  // Checkout button
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', simulateCheckout);
  }

  // DPP modal close
  const closeDpp = document.getElementById('close-dpp-btn');
  const dppOverlay = document.getElementById('dpp-modal');
  if (closeDpp) closeDpp.addEventListener('click', () => dppOverlay.classList.remove('active'));

  // Global search input
  const searchInput = document.getElementById('global-search');
  const searchBtn = document.getElementById('search-btn');
  
  const triggerSearch = () => {
    const val = searchInput.value.trim();
    state.searchQuery = val;
    state.shopCategory = 'all';
    state.shopTag = 'all';
    navigateTo('shop');
  };

  if (searchBtn) searchBtn.addEventListener('click', triggerSearch);
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') triggerSearch();
    });
  }
});
