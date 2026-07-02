import { 
  ONBOARDING_QUESTIONS, 
  PRODUCTS as INITIAL_PRODUCTS, 
  BOX_MATERIALS, 
  BOX_SIZES, 
  RIBBON_TYPES, 
  PRESET_BOXES, 
  MOCK_ORDERS,
  GIFT_BOX_CATEGORIES,
  CATEGORY_PRESETS
} from './data.js';

let PRODUCTS = [...INITIAL_PRODUCTS];

// Image fallback placeholder (Green Eco Gift Box)
const IMAGE_FALLBACK = "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80";

const BOX_PATTERNS = {
  leaf: {
    image: "radial-gradient(circle, #e0f2f1 20%, transparent 20%), radial-gradient(circle, #e0f2f1 20%, transparent 20%)",
    size: "10px 10px",
    color: "#80cbc4",
    position: "0 0, 5px 5px"
  },
  stripe: {
    image: "repeating-linear-gradient(45deg, #d7ccc8, #d7ccc8 5px, #bcaaa4 5px, #bcaaa4 10px)",
    size: "auto",
    color: "transparent",
    position: "auto"
  },
  dots: {
    image: "radial-gradient(#d7ccc8 20%, transparent 20%), radial-gradient(#d7ccc8 20%, transparent 20%)",
    size: "10px 10px",
    color: "#efebe9",
    position: "0 0, 5px 5px"
  }
};

const RIBBON_PATTERNS = {
  polka: {
    image: "radial-gradient(circle, #ffffff 30%, transparent 30%)",
    size: "6px 6px",
    color: "#e74c3c",
    position: "auto"
  },
  stripe: {
    image: "repeating-linear-gradient(90deg, #3498db, #3498db 3px, #ffffff 3px, #ffffff 6px)",
    size: "auto",
    color: "transparent",
    position: "auto"
  },
  grid: {
    image: "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)",
    size: "4px 4px",
    color: "#27ae60",
    position: "auto"
  }
};

// ==========================================================================
// APPLICATION STATE
// ==========================================================================
const state = {
  currentRoute: 'home',
  user: null, // email, password, role, preferenceProfile { recipient, interests, budget, occasions, style, sustainabilityScore }
  cart: [], // { id, type: 'custom'/'preset', box, size, ribbon, items: [], card: { text, font, color }, photo: null, qty, price, metrics }
  customizer: {
    step: 1,
    box: BOX_MATERIALS[0].id,
    size: BOX_SIZES[0].id,
    ribbon: RIBBON_TYPES[0].id,
    boxOptionType: 'color', // 'color' | 'pattern' | 'custom'
    boxColor: '#f3ede2', // Default Kraft paper color
    boxPattern: 'stripe', // Default pattern selection
    boxCustomImage: null, // Custom base64 image
    ribbonOptionType: 'color', // 'color' | 'pattern' | 'custom'
    ribbonColor: '#bda58d', // Default jute color
    ribbonPattern: 'polka', // Default pattern selection
    ribbonCustomImage: null, // Custom base64 ribbon image
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
  checkout: {
    step: 1, // 1=shipping info, 2=delivery method, 3=payment, 4=review
    shippingInfo: { name: '', phone: '', email: '', province: '', district: '', ward: '', address: '', note: '' },
    deliveryMethod: 'standard', // standard | express | same_day
    paymentMethod: 'cod', // cod | bank_transfer | momo | zalopay
    couponCode: '',
    couponDiscount: 0,
    shipFee: 35000
  },
  adminOrderFilter: 'all',
  orders: [...MOCK_ORDERS],
  searchQuery: '',
  shopCategory: 'all',
  shopTag: 'all',
  onboardingCurrentStep: 0,
  onboardingAnswers: {},
  aiEnabled: true,
  aiHistoryDeleted: false,
  aiAssist: {
    isOpen: false,
    step: 1,
    answers: {
      recipient: '',
      occasion: '',
      budget: '',
      hobbies: [],
      style: ''
    },
    loading: false,
    results: null,
    originalRecommendation: null
  },
  notifications: [],
  relationshipGraph: [],
  careLendarEvents: []
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
  const storedProducts = localStorage.getItem('ek_products');

  if (storedUser) {
    state.user = JSON.parse(storedUser);
    loadCareLendarData();
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
  if (storedProducts) {
    PRODUCTS = JSON.parse(storedProducts);
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

function saveProductsToStorage() {
  localStorage.setItem('ek_products', JSON.stringify(PRODUCTS));
}

function updateCartCount() {
  const count = state.cart.reduce((total, item) => total + item.qty, 0);
  document.getElementById('cart-count').innerText = count;
}

function updateNavigationLinks() {
  const navLinksContainer = document.querySelector('.nav-links');
  const mobileNavLinksContainer = document.querySelector('.mobile-nav-links');
  
  if (!navLinksContainer || !mobileNavLinksContainer) return;
  
  const isCurrentlyAdminPage = state.currentRoute === 'admin';
  const isAdmin = state.user && state.user.role === 'admin';
  
  let desktopHtml = '';
  let mobileHtml = '';
  
  if (isCurrentlyAdminPage && isAdmin) {
    // Admin Dashboard navigation header links
    const activeTab = state.adminCurrentTab || 'overview';
    const tabs = [
      { id: 'overview', icon: 'fa-gauge-high', label: 'Tổng quan' },
      { id: 'orders', icon: 'fa-box', label: 'Quản lý đơn hàng' },
      { id: 'products', icon: 'fa-tag', label: 'Quản lý sản phẩm' },
      { id: 'sustainability', icon: 'fa-leaf', label: 'Sustainability' }
    ];
    
    tabs.forEach(t => {
      const isActive = activeTab === t.id ? 'active' : '';
      desktopHtml += `<li><a href="#admin" class="nav-link ${isActive}" data-admin-tab="${t.id}"><i class="fa-solid ${t.icon}"></i> ${t.label}</a></li>`;
      mobileHtml += `<li><a href="#admin" class="mobile-route ${isActive}" data-admin-tab="${t.id}"><i class="fa-solid ${t.icon}"></i> ${t.label}</a></li>`;
    });
    
  } else if (isAdmin) {
    // Admin logged in, but browsing normal pages (Home or Brand Story)
    desktopHtml = `
      <li><a href="#home" class="nav-link ${state.currentRoute === 'home' ? 'active' : ''}" data-route="home">Trang chủ</a></li>
      <li><a href="#story" class="nav-link ${state.currentRoute === 'story' ? 'active' : ''}" data-route="story">Câu chuyện thương hiệu</a></li>
      <li><a href="#admin" class="nav-link highlight-link" data-route="admin"><i class="fa-solid fa-gauge-high"></i> Admin Dashboard</a></li>
    `;
    mobileHtml = `
      <li><a href="#home" class="mobile-route ${state.currentRoute === 'home' ? 'active' : ''}" data-route="home">Trang chủ</a></li>
      <li><a href="#story" class="mobile-route ${state.currentRoute === 'story' ? 'active' : ''}" data-route="story">Câu chuyện thương hiệu</a></li>
      <li><a href="#admin" class="mobile-route highlight-link" data-route="admin"><i class="fa-solid fa-gauge-high"></i> Admin Dashboard</a></li>
    `;
  } else {
    // Regular user or guest
    desktopHtml = `
      <li><a href="#home" class="nav-link ${state.currentRoute === 'home' ? 'active' : ''}" data-route="home">Trang chủ</a></li>
      <li><a href="#customizer" class="nav-link highlight-link ${state.currentRoute === 'customizer' ? 'active' : ''}" data-route="customizer"><i class="fa-solid fa-gift"></i> Tạo hộp quà</a></li>
      <li><a href="#" class="nav-link ai-assist-trigger-btn" style="color:var(--color-accent); font-weight:600;"><i class="fa-solid fa-brain"></i> Trợ lý AI</a></li>
      <li><a href="#care-lendar" class="nav-link ${state.currentRoute === 'care-lendar' ? 'active' : ''}" data-route="care-lendar"><i class="fa-solid fa-calendar-days"></i> Lịch sự kiện</a></li>
      <li><a href="#shop" class="nav-link ${state.currentRoute === 'shop' ? 'active' : ''}" data-route="shop">Cửa hàng</a></li>
      <li><a href="#b2b" class="nav-link ${state.currentRoute === 'b2b' ? 'active' : ''}" data-route="b2b">Quà doanh nghiệp</a></li>
      <li><a href="#story" class="nav-link ${state.currentRoute === 'story' ? 'active' : ''}" data-route="story">Câu chuyện thương hiệu</a></li>
      <li><a href="#tracking" class="nav-link ${state.currentRoute === 'tracking' ? 'active' : ''}" data-route="tracking">Theo dõi đơn hàng</a></li>
    `;
    mobileHtml = `
      <li><a href="#home" class="mobile-route ${state.currentRoute === 'home' ? 'active' : ''}" data-route="home">Trang chủ</a></li>
      <li><a href="#customizer" class="mobile-route highlight-link ${state.currentRoute === 'customizer' ? 'active' : ''}" data-route="customizer"><i class="fa-solid fa-gift"></i> Tạo hộp quà</a></li>
      <li><a href="#" class="mobile-route ai-assist-trigger-btn" style="color:var(--color-accent); font-weight:600;"><i class="fa-solid fa-brain"></i> Trợ lý AI</a></li>
      <li><a href="#care-lendar" class="mobile-route ${state.currentRoute === 'care-lendar' ? 'active' : ''}" data-route="care-lendar"><i class="fa-solid fa-calendar-days"></i> Lịch sự kiện</a></li>
      <li><a href="#shop" class="mobile-route ${state.currentRoute === 'shop' ? 'active' : ''}" data-route="shop">Cửa hàng</a></li>
      <li><a href="#b2b" class="mobile-route ${state.currentRoute === 'b2b' ? 'active' : ''}" data-route="b2b">Quà doanh nghiệp</a></li>
      <li><a href="#story" class="mobile-route ${state.currentRoute === 'story' ? 'active' : ''}" data-route="story">Câu chuyện thương hiệu</a></li>
      <li><a href="#tracking" class="mobile-route ${state.currentRoute === 'tracking' ? 'active' : ''}" data-route="tracking">Theo dõi đơn hàng</a></li>
      <li><a href="#account" class="mobile-route ${state.currentRoute === 'account' ? 'active' : ''}" data-route="account"><i class="fa-solid fa-circle-user"></i> Tài khoản của tôi</a></li>
    `;
  }
  
  navLinksContainer.innerHTML = desktopHtml;
  mobileNavLinksContainer.innerHTML = mobileHtml;
  
  // Re-bind event listeners for dynamically rendered links
  navLinksContainer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      const tabId = link.dataset.adminTab;
      if (tabId) {
        e.preventDefault();
        state.adminCurrentTab = tabId;
        renderAdmin();
        updateNavigationLinks();
      } else {
        const route = link.dataset.route;
        if (route) {
          e.preventDefault();
          navigateTo(route);
        }
      }
    });
  });
  
  mobileNavLinksContainer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      // Close mobile nav
      document.getElementById('mobile-nav').classList.remove('active');
      const tabId = link.dataset.adminTab;
      if (tabId) {
        e.preventDefault();
        state.adminCurrentTab = tabId;
        renderAdmin();
        updateNavigationLinks();
      } else {
        const route = link.dataset.route;
        if (route) {
          e.preventDefault();
          navigateTo(route);
        }
      }
    });
  });
}

function updateAuthUI() {
  const loginBtn = document.getElementById('login-header-btn');
  const userMenu = document.getElementById('user-menu');
  const dropdownEmail = document.getElementById('dropdown-user-email');
  const adminLink = document.getElementById('dropdown-admin-link');
  const accountLink = document.getElementById('dropdown-account-link');
  const divider = document.querySelector('#user-dropdown hr');
  const cartBtn = document.getElementById('cart-toggle-btn');
  const searchBox = document.querySelector('.search-box');
  
  if (state.user) {
    loginBtn.style.display = 'none';
    userMenu.style.display = 'flex';
    dropdownEmail.innerText = state.user.email || 'user@ecoknot.vn';
    
    // Hide all items except Logout button for Admin role
    if (state.user.role === 'admin') {
      if (adminLink) adminLink.style.display = 'none';
      if (accountLink) accountLink.style.display = 'none';
      if (divider) divider.style.display = 'none';
      if (cartBtn) cartBtn.style.display = 'none';
      if (searchBox) searchBox.style.display = 'none';
    } else {
      if (adminLink) adminLink.style.display = 'none';
      if (accountLink) accountLink.style.display = 'flex';
      if (divider) divider.style.display = 'block';
      if (cartBtn) cartBtn.style.display = '';
      if (searchBox) searchBox.style.display = 'flex';
    }
  } else {
    loginBtn.style.display = '';
    userMenu.style.display = 'none';
    if (adminLink) adminLink.style.display = 'none';
    if (accountLink) accountLink.style.display = 'none';
    if (divider) divider.style.display = 'none';
    if (cartBtn) cartBtn.style.display = '';
    if (searchBox) searchBox.style.display = 'flex';
  }
  
  // Update header links dynamically
  updateNavigationLinks();
}

// ==========================================================================
// SPA ROUTER
// ==========================================================================
const routes = {
  home: renderHome,
  customizer: renderCustomizer,
  'care-lendar': renderCareLendar,
  shop: renderShop,
  b2b: renderB2B,
  story: renderStory,
  tracking: renderTracking,
  account: renderAccount,
  checkout: renderCheckout,
  admin: renderAdmin
};

function navigateTo(route) {
  // If user is Admin, they shouldn't access shopping or checkout routes
  if (state.user && state.user.role === 'admin') {
    if (['customizer', 'shop', 'b2b', 'checkout'].includes(route)) {
      showToast('Tài khoản quản trị viên không thể sử dụng chức năng mua hàng!', 'warning');
      route = 'admin';
    }
  }
  
  state.currentRoute = route;
  window.location.hash = route;
  
  // Close mobile navigation overlay
  document.getElementById('mobile-nav').classList.remove('active');

  // Wide layout cho admin & checkout, normal cho các trang còn lại
  const appView = document.getElementById('app-view');
  if (route === 'admin' || route === 'checkout' || route === 'care-lendar') {
    appView.classList.add('wide-page');
  } else {
    appView.classList.remove('wide-page');
  }
  
  // Init checkout state if navigating fresh
  if (route === 'checkout' && (!state.checkout || !state.checkout.step)) {
    state.checkout = state.checkout || {};
    state.checkout.step = 1;
  }

  // Render route content — use lazy lookup so commerce.js functions resolve correctly
  let renderFn = routes[route];
  // Fallback: check window globals (commerce module registers functions here)
  if (!renderFn && window['render' + route.charAt(0).toUpperCase() + route.slice(1)]) {
    renderFn = window['render' + route.charAt(0).toUpperCase() + route.slice(1)];
  }
  if (!renderFn) renderFn = renderHome;
  renderFn();
  
  // Rebuild navigation links to show tab highlights correctly
  updateNavigationLinks();

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

// ==========================================================================
// AI ASSISTANT MODULE (SLIDING DRAWER & WIZARD FLOW)
// ==========================================================================

function openAiAssistDrawer() {
  state.aiAssist.isOpen = true;
  state.aiAssist.step = 1;
  state.aiAssist.results = null;
  state.aiAssist.loading = false;
  state.aiAssist.answers = {
    recipient: '',
    occasion: '',
    budget: '',
    hobbies: [],
    style: ''
  };
  
  const drawer = document.getElementById('ai-assist-drawer');
  if (drawer) drawer.classList.add('active');
  
  renderAiAssist();
}

function closeAiAssistDrawer() {
  state.aiAssist.isOpen = false;
  const drawer = document.getElementById('ai-assist-drawer');
  if (drawer) drawer.classList.remove('active');
}

function renderAiAssist() {
  const container = document.getElementById('ai-assist-body');
  if (!container) return;
  
  if (state.aiAssist.loading) {
    container.innerHTML = `
      <div class="ai-loading-container">
        <i class="fa-solid fa-brain fa-spin ai-spinner"></i>
        <h3 class="ai-loading-title">Trợ lý AI đang thiết kế...</h3>
        <p class="ai-loading-desc">Chúng tôi đang quét toàn bộ kho sản phẩm xanh, phân tích tâm lý người nhận và tối ưu ngân sách phù hợp nhất cho bạn.</p>
      </div>
    `;
    return;
  }
  
  if (state.aiAssist.results) {
    renderAiAssistResults(container);
    return;
  }
  
  renderAiAssistWizard(container);
}

function renderAiAssistWizard(container) {
  const step = state.aiAssist.step;
  const ans = state.aiAssist.answers;
  
  const questions = [
    {
      id: 1,
      title: "Ai là người nhận quà?",
      field: "recipient",
      type: "radio",
      options: [
        { value: "friends", label: "Bạn bè thân thiết", emoji: "👥" },
        { value: "lovers", label: "Người thương", emoji: "💕" },
        { value: "family", label: "Gia đình", emoji: "👨‍👩‍👧‍👦" },
        { value: "colleagues", label: "Đồng nghiệp", emoji: "🤝" },
        { value: "clients", label: "Khách hàng", emoji: "💼" },
        { value: "partners", label: "Đối tác B2B", emoji: "🏢" }
      ]
    },
    {
      id: 2,
      title: "Món quà nhân dịp gì?",
      field: "occasion",
      type: "radio",
      options: [
        { value: "birthday", label: "Sinh nhật", emoji: "🎂" },
        { value: "christmas", label: "Giáng sinh", emoji: "🎄" },
        { value: "valentine", label: "Lễ Tình nhân", emoji: "💘" },
        { value: "tet", label: "Dịp Tết cổ truyền", emoji: "🧧" },
        { value: "anniversary", label: "Kỷ niệm", emoji: "💍" },
        { value: "thanks", label: "Lời cảm ơn", emoji: "🙏" },
        { value: "sorry", label: "Lời xin lỗi", emoji: "😊" },
        { value: "corporate", label: "Quà doanh nghiệp", emoji: "🏛️" }
      ]
    },
    {
      id: 3,
      title: "Ngân sách tối đa của bạn?",
      field: "budget",
      type: "radio",
      options: [
        { value: "under_300", label: "Dưới 300.000đ", emoji: "💵" },
        { value: "300_500", label: "300.000đ - 500.000đ", emoji: "💵💵" },
        { value: "500_1000", label: "500.000đ - 1.000.000đ", emoji: "💵💵💵" },
        { value: "over_1000", label: "Trên 1.000.000đ", emoji: "💎" }
      ]
    },
    {
      id: 4,
      title: "Sở thích hoặc mối quan tâm của người nhận?",
      field: "hobbies",
      type: "checkbox",
      options: [
        { value: "design", label: "Thiết kế đẹp", emoji: "🎨" },
        { value: "meaning", label: "Ý nghĩa truyền tải", emoji: "💝" },
        { value: "customization", label: "Cá nhân hóa", emoji: "✏️" },
        { value: "eco", label: "Lối sống xanh", emoji: "🌿" },
        { value: "price", label: "Tính kinh tế", emoji: "💰" },
        { value: "fast_shipping", label: "Giao hỏa tốc", emoji: "🚚" }
      ]
    },
    {
      id: 5,
      title: "Phong cách bạn mong muốn?",
      field: "style",
      type: "radio",
      options: [
        { value: "minimal", label: "Minimal (Tối giản)", emoji: "◻️" },
        { value: "vintage", label: "Vintage (Mộc mạc xưa)", emoji: "📜" },
        { value: "luxury", label: "Luxury (Sang trọng)", emoji: "👑" },
        { value: "eco", label: "Eco (Tự nhiên)", emoji: "🌱" },
        { value: "cute", label: "Cute (Đáng yêu)", emoji: "🐰" },
        { value: "modern", label: "Modern (Hiện đại)", emoji: "💻" }
      ]
    }
  ];
  
  const qData = questions[step - 1];
  const percent = Math.round(((step - 1) / questions.length) * 100);
  
  let optionsHtml = '<div class="ai-wizard-options-grid">';
  qData.options.forEach(opt => {
    let isSelected = false;
    if (qData.type === 'checkbox') {
      isSelected = ans[qData.field].includes(opt.value);
    } else {
      isSelected = ans[qData.field] === opt.value;
    }
    
    optionsHtml += `
      <div class="ai-wizard-card ${isSelected ? 'selected' : ''}" data-field="${qData.field}" data-value="${opt.value}" data-type="${qData.type}">
        <input type="${qData.type}" name="wizard-${qData.field}" value="${opt.value}" ${isSelected ? 'checked' : ''} style="pointer-events:none;">
        <span class="ai-wizard-emoji">${opt.emoji}</span>
        <span class="ai-wizard-label">${opt.label}</span>
      </div>
    `;
  });
  optionsHtml += '</div>';
  
  container.innerHTML = `
    <div class="ai-wizard-header-container">
      <span class="ai-wizard-step-counter">Bước ${step} / ${questions.length}</span>
      <span style="font-size:0.8rem; color:var(--color-text-light); font-weight:500;">Chọn thông tin</span>
    </div>
    
    <div class="ai-wizard-progress-bar">
      <div class="ai-wizard-progress-fill" style="width: ${percent}%;"></div>
    </div>
    
    <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem; font-family: var(--font-title);">${qData.title}</h3>
    ${optionsHtml}
    
    <div class="button-row" style="margin-top: 2rem;">
      ${step > 1 ? `<button class="btn btn-outline" id="ai-wizard-back-btn" style="flex:1;"><i class="fa-solid fa-arrow-left"></i> Quay lại</button>` : ''}
      <button class="btn btn-primary" id="ai-wizard-next-btn" style="flex:1;">
        ${step === questions.length ? 'Phân tích & gợi ý <i class="fa-solid fa-brain"></i>' : 'Tiếp tục <i class="fa-solid fa-arrow-right"></i>'}
      </button>
    </div>
  `;
  
  // Bind Option click events
  container.querySelectorAll('.ai-wizard-card').forEach(card => {
    card.addEventListener('click', () => {
      const field = card.dataset.field;
      const val = card.dataset.value;
      const type = card.dataset.type;
      
      if (type === 'checkbox') {
        const index = ans[field].indexOf(val);
        if (index > -1) {
          ans[field].splice(index, 1);
        } else {
          ans[field].push(val);
        }
      } else {
        ans[field] = val;
      }
      renderAiAssistWizard(container);
    });
  });
  
  // Bind Nav clicks
  const backBtn = document.getElementById('ai-wizard-back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      state.aiAssist.step--;
      renderAiAssist();
    });
  }
  
  const nextBtn = document.getElementById('ai-wizard-next-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      // Validate option chosen
      const currentAnswer = ans[qData.field];
      if (!currentAnswer || (Array.isArray(currentAnswer) && currentAnswer.length === 0)) {
        showToast('Vui lòng chọn câu trả lời để tiếp tục!');
        return;
      }
      
      if (step < questions.length) {
        state.aiAssist.step++;
        renderAiAssist();
      } else {
        submitAiAssistSurvey();
      }
    });
  }
}

async function submitAiAssistSurvey() {
  state.aiAssist.loading = true;
  renderAiAssist();
  
  const payload = {
    userId: state.user?.email || 'guest@ecoknot.vn',
    survey: state.aiAssist.answers
  };
  
  try {
    const res = await fetch('/api/ai-suggest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    state.aiAssist.results = data;
  } catch (error) {
    console.error("AI suggest API failed:", error);
    showToast("Không thể kết nối máy chủ AI. Đang sử dụng dữ liệu cục bộ.");
  } finally {
    state.aiAssist.loading = false;
    renderAiAssist();
  }
}

function renderAiAssistResults(container) {
  const results = state.aiAssist.results;
  
  // Get active configurations from database mapping
  const boxId = results.giftBox.boxMaterial;
  const box = BOX_MATERIALS.find(x => x.id === boxId) || BOX_MATERIALS[0];
  const size = BOX_SIZES.find(x => x.id === results.giftBox.boxSize) || BOX_SIZES[0];
  const ribbon = RIBBON_TYPES.find(x => x.id === results.giftBox.ribbon) || RIBBON_TYPES[0];
  
  // Map selected items to get names/images
  let totalItemsPrice = 0;
  const selectedProducts = results.productIds.map(id => {
    const p = PRODUCTS.find(x => x.id === id);
    if (p) totalItemsPrice += p.price;
    return p;
  }).filter(Boolean);
  
  const boxPrice = box.price + size.price;
  const ribbonPrice = ribbon.price;
  const totalPrice = totalItemsPrice + boxPrice + ribbonPrice;
  
  // Render Flatlay slots
  let slotsHtml = '';
  const maxSlots = size.maxItems;
  for (let i = 0; i < maxSlots; i++) {
    const prod = selectedProducts[i];
    if (prod) {
      slotsHtml += `
        <div class="ai-flatlay-item-slot" title="${prod.name}">
          <img src="${prod.image}" alt="${prod.name}" onerror="this.onerror=null; this.src='${IMAGE_FALLBACK}';">
        </div>
      `;
    } else {
      slotsHtml += `<div class="ai-flatlay-item-slot" style="border-style:dashed; opacity:0.3;"><i class="fa-solid fa-plus" style="font-size:0.8rem; color:#666;"></i></div>`;
    }
  }

  // Render Reasoning items list
  let reasoningHtml = '';
  selectedProducts.forEach(prod => {
    const reasonText = results.reasoning[prod.id] || "Sản phẩm đạt chỉ số xanh cao, phù hợp với sở thích của người nhận.";
    reasoningHtml += `
      <div class="ai-reasoning-item">
        <img src="${prod.image}" class="ai-reasoning-img" alt="${prod.name}" onerror="this.onerror=null; this.src='${IMAGE_FALLBACK}';">
        <div class="ai-reasoning-details">
          <div class="ai-reasoning-item-name">
            <span>${prod.name}</span>
            <span class="ai-reasoning-item-price">${formatCurrency(prod.price)}</span>
          </div>
          <p class="ai-reasoning-text">${reasonText}</p>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = `
    <div class="ai-results-container">
      ${results.simulation ? `
        <div class="ai-simulation-indicator">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <span>Đang chạy ở chế độ giả lập (OPENAI_API_KEY chưa cài đặt).</span>
        </div>
      ` : ''}
      
      <div class="ai-insight-box">
        <strong>💡 Insight người nhận:</strong>
        ${results.insight}
      </div>
      
      <!-- Flatlay Visual Preview -->
      <div class="ai-flatlay-preview" style="text-align: center;">
        <div class="ai-flatlay-title" style="text-align: left;">
          <i class="fa-solid fa-box-open"></i> Xem trước Hộp Quà (${size.name})
        </div>
        <div class="ai-flatlay-box-mock ${boxId === 'box-bamboo' ? 'bamboo' : ''}" style="background-color: ${results.giftBox.boxColor}; margin: 0 auto 1.25rem auto;">
          <!-- Ribbon ribbons -->
          <div class="ai-flatlay-ribbon-band-h" style="background-color: ${results.giftBox.ribbonColor};"></div>
          <div class="ai-flatlay-ribbon-band-v" style="background-color: ${results.giftBox.ribbonColor};"></div>
          <div class="ai-flatlay-ribbon-knot" style="background-color: ${results.giftBox.ribbonColor};">🎀</div>
        </div>
        
        <div class="ai-flatlay-products-title" style="font-size:0.8rem; font-weight:700; color:var(--color-border); text-transform:uppercase; letter-spacing:1px; margin-bottom:0.75rem; text-align: left; display:flex; align-items:center; gap:0.4rem;">
          <i class="fa-solid fa-gift"></i> Vật phẩm bên trong hộp (${selectedProducts.length}/${size.maxItems} món)
        </div>
        <div class="ai-flatlay-products-grid" style="display:flex; gap:0.6rem; justify-content:center; flex-wrap:wrap;">
          ${slotsHtml}
        </div>
      </div>
      
      <!-- Reasoning Dashboard -->
      <div class="ai-reasoning-dashboard">
        <div class="ai-reasoning-title">
          <i class="fa-solid fa-brain"></i> Reasoning Dashboard
        </div>
        ${reasoningHtml}
      </div>
      
      <!-- Total Price Tracker -->
      <div style="display:flex; justify-content:space-between; align-items:center; background:#fff; border:1px solid var(--color-border-light); padding:1rem; border-radius:8px;">
        <span style="font-weight:600; font-size:0.9rem;">Tổng giá trị hộp quà:</span>
        <strong style="color:var(--color-accent); font-size:1.15rem; font-family:var(--font-title);">${formatCurrency(totalPrice)}</strong>
      </div>
      
      <!-- Action Buttons -->
      <div style="display:flex; gap:0.8rem; margin-top:0.5rem; flex-direction:column;">
        ${results.isPredictive ? `
          <button class="btn btn-primary btn-block" id="ai-add-to-cart-direct-btn" style="background:var(--color-accent);"><i class="fa-solid fa-credit-card"></i> Duyệt đơn và Thanh toán ngay</button>
          <button class="btn btn-outline btn-block" id="ai-continue-customize-btn"><i class="fa-solid fa-sliders"></i> Tự tay tùy chỉnh thêm (Customizer)</button>
          <button class="btn btn-secondary btn-block" id="ai-restart-wizard-btn"><i class="fa-solid fa-comments"></i> Tiếp tục trò chuyện với AI Assist</button>
        ` : `
          <button class="btn btn-primary btn-block" id="ai-add-to-cart-direct-btn" style="background:var(--color-accent);"><i class="fa-solid fa-cart-plus"></i> Thêm toàn bộ set vào giỏ hàng</button>
          <button class="btn btn-outline btn-block" id="ai-continue-customize-btn"><i class="fa-solid fa-sliders"></i> Tự tay tùy chỉnh thêm (Customizer)</button>
          <button class="btn btn-secondary btn-block" id="ai-restart-wizard-btn"><i class="fa-solid fa-rotate-left"></i> Tạo đề xuất khác</button>
        `}
      </div>
    </div>
  `;
  
  // Bind direct add to cart
  document.getElementById('ai-add-to-cart-direct-btn').addEventListener('click', () => {
    addAiBoxToCart(results, totalPrice, results.isPredictive);
  });
  
  // Bind customization link
  document.getElementById('ai-continue-customize-btn').addEventListener('click', () => {
    continueCustomizingFromAi(results);
  });
  
  // Bind restart survey
  document.getElementById('ai-restart-wizard-btn').addEventListener('click', () => {
    state.aiAssist.step = 1;
    state.aiAssist.results = null;
    renderAiAssist();
  });
}

function continueCustomizingFromAi(results) {
  // Load AI results into customizer state
  state.customizer.box = results.giftBox.boxMaterial;
  state.customizer.size = results.giftBox.boxSize;
  state.customizer.ribbon = results.giftBox.ribbon;
  state.customizer.boxOptionType = 'color';
  state.customizer.boxColor = results.giftBox.boxColor;
  state.customizer.ribbonOptionType = 'color';
  state.customizer.ribbonColor = results.giftBox.ribbonColor;
  state.customizer.items = [...results.productIds];
  state.customizer.step = 2; // Jump straight to items selection step
  state.customizer.previewed = true;
  state.customizer.cardText = '';
  state.customizer.photo = null;
  
  // Retain original recommendation for feedback difference checking
  state.aiAssist.originalRecommendation = {
    promptId: results.promptId,
    boxMaterial: results.giftBox.boxMaterial,
    boxSize: results.giftBox.boxSize,
    ribbon: results.giftBox.ribbon,
    items: [...results.productIds]
  };
  
  closeAiAssistDrawer();
  navigateTo('customizer');
  showToast('Đã tải cấu hình từ AI vào bộ công cụ tự thiết kế!');
}

function addAiBoxToCart(results, price, gotoCheckout = false) {
  if (state.user && state.user.role === 'admin') {
    showToast('Tài khoản quản trị viên không thể mua hàng!', 'warning');
    return;
  }
  
  const boxId = results.giftBox.boxMaterial;
  const box = BOX_MATERIALS.find(x => x.id === boxId) || BOX_MATERIALS[0];
  const size = BOX_SIZES.find(x => x.id === results.giftBox.boxSize) || BOX_SIZES[0];
  const ribbon = RIBBON_TYPES.find(x => x.id === results.giftBox.ribbon) || RIBBON_TYPES[0];
  
  // Calculate metrics
  let recycledSum = 0;
  let plasticSavedSum = 0;
  let co2SavedSum = 0;
  
  results.productIds.forEach(id => {
    const p = PRODUCTS.find(x => x.id === id);
    if (p) {
      recycledSum += p.dpp.recycledContent;
      plasticSavedSum += p.dpp.virginPlasticReduction;
      co2SavedSum += p.dpp.carbonFootprintAvoided;
    }
  });
  
  const count = results.productIds.length;
  const avgRecycled = count > 0 ? Math.round(recycledSum / count) : 90;
  
  const newCartItem = {
    id: 'ai-box-' + Date.now(),
    type: 'custom',
    box: boxId,
    size: results.giftBox.boxSize,
    ribbon: results.giftBox.ribbon,
    boxOptionType: 'color',
    boxColor: results.giftBox.boxColor,
    ribbonOptionType: 'color',
    ribbonColor: results.giftBox.ribbonColor,
    items: [...results.productIds],
    card: { text: '', font: 'var(--font-body)', color: '#3E3E3E' },
    photo: null,
    qty: 1,
    price: price,
    metrics: {
      recycledContent: avgRecycled,
      recyclabilityRate: 100,
      reusablePackaging: boxId === 'box-bamboo' ? 100 : 90,
      renewableMaterial: 95,
      virginPlasticReduction: plasticSavedSum + 100,
      carbonFootprintAvoided: parseFloat((co2SavedSum + box.co2).toFixed(2))
    }
  };
  
  state.cart.push(newCartItem);
  saveStateToStorage();
  updateCartCount();
  
  // Immediately log feedback (User bought exactly what AI suggested, no changes)
  logAiFeedback({
    userId: state.user?.email || 'guest@ecoknot.vn',
    promptId: results.promptId,
    aiBoxMaterial: boxId,
    aiBoxSize: results.giftBox.boxSize,
    aiRibbon: results.giftBox.ribbon,
    aiItems: results.productIds,
    finalItems: results.productIds
  });
  
  closeAiAssistDrawer();
  if (gotoCheckout) {
    navigateTo('checkout');
    showToast('Đã duyệt thiết kế gợi ý và chuyển đến trang thanh toán!');
  } else {
    openCartDrawer();
    showToast('Đã thêm set quà của trợ lý AI vào giỏ hàng!');
  }
}

async function logAiFeedback(payload) {
  try {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log('[AI Assist Feedback Loop Logged]', data);
  } catch (error) {
    console.error('Failed to log AI feedback:', error);
  }
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

  // Wire up cert view button
  const certViewBtn = document.getElementById('dpp-cert-view-btn');
  if (certViewBtn) {
    certViewBtn.onclick = () => openCertViewer(prod.id);
  }

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

function openCertViewer(prodId) {
  const prod = PRODUCTS.find(x => x.id === prodId);
  if (!prod) return;
  document.getElementById('cert-prod-name').innerText = prod.name;
  document.getElementById('cert-image').src = './images/cert.jpg';
  document.getElementById('cert-modal').classList.add('active');
}
window.openCertViewer = openCertViewer;
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
        <div style="display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; margin-top:1.5rem;">
          <button class="btn btn-primary" id="hero-cta-btn">Tự thiết kế hộp quà <i class="fa-solid fa-gift"></i></button>
          <button class="btn btn-secondary ai-assist-trigger-btn" style="background:var(--color-accent); color:white; border-color:var(--color-accent);"><i class="fa-solid fa-brain"></i> Trợ lý AI chọn quà</button>
        </div>
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

  // Danh mục vật phẩm rời
  const PRODUCT_CATEGORIES_HOME = [
    { id: 'fashion', nameVi: 'Đồ thời trang', icon: 'fa-shirt', color: '#e91e63', count: PRODUCTS.filter(p => p.category === 'fashion').length },
    { id: 'handicraft', nameVi: 'Đồ thủ công mỹ nghệ', icon: 'fa-hand-sparkles', color: '#ff6f00', count: PRODUCTS.filter(p => p.category === 'handicraft').length },
    { id: 'stationery', nameVi: 'Văn phòng phẩm', icon: 'fa-pen-fancy', color: '#1565c0', count: PRODUCTS.filter(p => p.category === 'stationery').length }
  ];
  html += `
    <section class="mb-4">
      <div class="section-title-container">
        <h2>Vật phẩm rời</h2>
        <p class="section-subtitle">Chọn từng món quà riêng lẻ theo sở thích</p>
      </div>
      <div class="category-grid">
        ${PRODUCT_CATEGORIES_HOME.map(cat => `
          <div class="category-card product-cat-card" data-category="${cat.id}" style="--cat-color: ${cat.color};">
            <div class="category-info">
              <h3><i class="fa-solid ${cat.icon}"></i> ${cat.nameVi}</h3>
              <p>Khám phá bộ sưu tập ${cat.nameVi.toLowerCase()} thủ công, bền vững.</p>
              <div class="category-meta">
                <span class="category-count">${cat.count} sản phẩm</span>
              </div>
            </div>
            <button class="btn btn-outline product-cat-explore-btn" data-category="${cat.id}">Khám phá <i class="fa-solid fa-arrow-right"></i></button>
          </div>
        `).join('')}
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
          <h3>Cảm ơn</h3>
          <p>Tri ân & chân thành</p>
        </div>
        <div class="emotion-card" data-category="sorry">
          <h3>Xin lỗi</h3>
          <p>Hàn gắn & sẻ chia</p>
        </div>
        <div class="emotion-card" data-category="birthday">
          <h3>Sinh nhật</h3>
          <p>Niềm vui & kỷ niệm</p>
        </div>
        <div class="emotion-card" data-category="valentine">
          <h3>Người yêu</h3>
          <p>Nồng nàn & lãng mạn</p>
        </div>
        <div class="emotion-card" data-category="tet">
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
      const cat = GIFT_BOX_CATEGORIES.find(c => c.id === catId);
      if (cat?.redirect) {
        navigateTo(cat.redirect);
        return;
      }
      state.shopCategory = catId;
      state.shopTag = 'all';
      navigateTo('shop');
    });
  });

  // Category explore buttons
  document.querySelectorAll('.category-explore-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const catId = btn.dataset.category;
      const cat = GIFT_BOX_CATEGORIES.find(c => c.id === catId);
      if (cat?.redirect) {
        navigateTo(cat.redirect);
        return;
      }
      state.shopCategory = catId;
      state.shopTag = 'all';
      navigateTo('shop');
    });
  });

  // Product category card clicks
  document.querySelectorAll('.product-cat-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.product-cat-explore-btn')) return;
      const catId = card.dataset.category;
      state.shopCategory = catId;
      state.shopTag = 'all';
      navigateTo('shop');
    });
  });

  // Product category explore buttons
  document.querySelectorAll('.product-cat-explore-btn').forEach(btn => {
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

function getBoxMockupStyle() {
  const isBamboo = state.customizer.box === 'box-bamboo';
  if (state.customizer.boxOptionType === 'color') {
    return `background-color: ${state.customizer.boxColor}; background-image: none; border-color: var(--color-border);`;
  } else if (state.customizer.boxOptionType === 'pattern') {
    const pat = BOX_PATTERNS[state.customizer.boxPattern];
    if (pat) {
      return `background-image: ${pat.image}; background-size: ${pat.size}; background-position: ${pat.position}; background-color: ${pat.color}; border-color: var(--color-border);`;
    }
  } else if (state.customizer.boxOptionType === 'custom' && state.customizer.boxCustomImage) {
    return `background-image: url(${state.customizer.boxCustomImage}); background-size: cover; background-position: center; border-color: var(--color-border);`;
  }
  // Default fallback
  if (isBamboo) {
    return `background-image: repeating-linear-gradient(45deg, #e3dac9 0px, #e3dac9 10px, #d7cbaf 10px, #d7cbaf 20px); border-color: #b59f77;`;
  } else {
    return `background-color: #f3ede2; background-image: none; border-color: var(--color-border);`;
  }
}

function getRibbonStyle() {
  if (state.customizer.ribbonOptionType === 'color') {
    return `background-color: ${state.customizer.ribbonColor}; background-image: none;`;
  } else if (state.customizer.ribbonOptionType === 'pattern') {
    const pat = RIBBON_PATTERNS[state.customizer.ribbonPattern];
    if (pat) {
      return `background-image: ${pat.image}; background-size: ${pat.size}; background-position: ${pat.position}; background-color: ${pat.color};`;
    }
  } else if (state.customizer.ribbonOptionType === 'custom' && state.customizer.ribbonCustomImage) {
    return `background-image: url(${state.customizer.ribbonCustomImage}); background-size: cover; background-position: center; background-color: transparent;`;
  }
  // Default ribbon type color
  const activeRibbon = RIBBON_TYPES.find(x => x.id === state.customizer.ribbon);
  const color = activeRibbon ? activeRibbon.color : '#bda58d';
  return `background-color: ${color}; background-image: none;`;
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
          <div class="box-mockup ${state.customizer.box === 'box-bamboo' && state.customizer.boxOptionType !== 'color' && state.customizer.boxOptionType !== 'pattern' && state.customizer.boxOptionType !== 'custom' ? 'bamboo' : ''}" id="customizer-box-mockup" style="${getBoxMockupStyle()}">
            <!-- Ribbon bands -->
            <div class="ribbon-overlay active-ribbon" style="${getRibbonStyle()}"></div>
            <div class="ribbon-horizontal active-ribbon" style="${getRibbonStyle()}"></div>
            <div class="ribbon-knot active-ribbon" style="${getRibbonStyle()}"></div>

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

        <!-- Selected products listed horizontally below closed box cover -->
        <div class="customizer-selected-items-preview" style="margin-top: 1.25rem; background: var(--bg-secondary); padding: 1.2rem; border-radius: var(--border-radius); border: 1.5px dashed var(--color-border-light); text-align: left;">
          <h4 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 0.75rem; color: var(--color-text); display: flex; align-items: center; gap: 0.4rem; font-family: var(--font-title);">
            <i class="fa-solid fa-gift" style="color: var(--color-accent);"></i> Vật phẩm bên trong hộp (${state.customizer.items.length}/${activeSize.maxItems} món)
          </h4>
          <div style="display: flex; gap: 0.6rem; justify-content: flex-start; flex-wrap: wrap;">
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
        </div>
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

  // Custom box styling panel
  html += `
    <div class="customizer-options-panel" style="margin-top: -0.5rem; margin-bottom: 1.5rem; padding: 1rem; border: 1px dashed var(--color-border); border-radius: 8px; background-color: #faf8f5;">
      <h4 style="font-size: 0.95rem; margin-bottom: 0.8rem; display: flex; align-items: center; gap: 0.5rem; color: var(--color-text);">
        <i class="fa-solid fa-palette" style="color: var(--color-accent);"></i> Tùy biến họa tiết/màu sắc vỏ hộp
      </h4>
      <div class="customizer-tabs" style="display: flex; gap: 0.5rem; margin-bottom: 0.8rem;">
        <button class="tab-btn ${state.customizer.boxOptionType === 'color' ? 'active' : ''}" data-box-opt="color" style="flex: 1; padding: 0.4rem; font-size: 0.8rem; border-radius: 6px; border: 1px solid var(--color-border); background: white; cursor: pointer; color: var(--color-text);">Màu sắc</button>
        <button class="tab-btn ${state.customizer.boxOptionType === 'pattern' ? 'active' : ''}" data-box-opt="pattern" style="flex: 1; padding: 0.4rem; font-size: 0.8rem; border-radius: 6px; border: 1px solid var(--color-border); background: white; cursor: pointer; color: var(--color-text);">Họa tiết</button>
        <button class="tab-btn ${state.customizer.boxOptionType === 'custom' ? 'active' : ''}" data-box-opt="custom" style="flex: 1; padding: 0.4rem; font-size: 0.8rem; border-radius: 6px; border: 1px solid var(--color-border); background: white; cursor: pointer; color: var(--color-text);">Tự tải lên</button>
      </div>
      
      <!-- Tab color -->
      <div class="opt-content box-opt-color" style="display: ${state.customizer.boxOptionType === 'color' ? 'block' : 'none'};">
        <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
          ${[
            { color: '#f3ede2', name: 'Kraft Tự Nhiên' },
            { color: '#d7ccc8', name: 'Mộc Mạc' },
            { color: '#e0f2f1', name: 'Xanh Bạc Hà' },
            { color: '#fce4ec', name: 'Hồng Phấn' },
            { color: '#a5d6a7', name: 'Xanh Rêu' },
            { color: '#fff9c4', name: 'Vàng Nắng' }
          ].map(c => `
            <span class="color-swatch-box ${state.customizer.boxColor === c.color ? 'active' : ''}" 
                  data-color="${c.color}" 
                  title="${c.name}"
                  style="width: 26px; height: 26px; background-color: ${c.color}; border-radius: 50%; border: 2px solid ${state.customizer.boxColor === c.color ? 'var(--color-accent)' : '#ddd'}; box-shadow: ${state.customizer.boxColor === c.color ? '0 0 0 2px var(--color-accent)' : 'none'}; cursor: pointer; display: inline-block;">
            </span>
          `).join('')}
          <div style="display:flex; align-items:center; gap:0.3rem; margin-left:0.5rem;">
            <span style="font-size:0.75rem; color:var(--color-text-light);">Tự chọn:</span>
            <input type="color" id="box-custom-color-picker" value="${state.customizer.boxColor}" style="border: none; padding: 0; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; background:none;">
          </div>
        </div>
      </div>

      <!-- Tab pattern -->
      <div class="opt-content box-opt-pattern" style="display: ${state.customizer.boxOptionType === 'pattern' ? 'block' : 'none'};">
        <div style="display: flex; gap: 0.8rem; flex-wrap: wrap;">
          <div class="pattern-swatch-box" data-pattern="leaf" style="width: 50px; height: 50px; background-image: radial-gradient(circle, #e0f2f1 20%, transparent 20%), radial-gradient(circle, #e0f2f1 20%, transparent 20%); background-size: 10px 10px; background-position: 0 0, 5px 5px; background-color: #80cbc4; border: 2px solid ${state.customizer.boxPattern === 'leaf' ? 'var(--color-accent)' : '#ddd'}; box-shadow: ${state.customizer.boxPattern === 'leaf' ? '0 0 0 2px var(--color-accent)' : 'none'}; border-radius: 4px; cursor: pointer; flex-shrink: 0;" title="Họa tiết Lá Xanh"></div>
          <div class="pattern-swatch-box" data-pattern="stripe" style="width: 50px; height: 50px; background-image: repeating-linear-gradient(45deg, #d7ccc8, #d7ccc8 5px, #bcaaa4 5px, #bcaaa4 10px); border: 2px solid ${state.customizer.boxPattern === 'stripe' ? 'var(--color-accent)' : '#ddd'}; box-shadow: ${state.customizer.boxPattern === 'stripe' ? '0 0 0 2px var(--color-accent)' : 'none'}; border-radius: 4px; cursor: pointer; flex-shrink: 0;" title="Sọc Kraft Eco"></div>
          <div class="pattern-swatch-box" data-pattern="dots" style="width: 50px; height: 50px; background-image: radial-gradient(#d7ccc8 20%, transparent 20%), radial-gradient(#d7ccc8 20%, transparent 20%); background-size: 10px 10px; background-position: 0 0, 5px 5px; background-color: #efebe9; border: 2px solid ${state.customizer.boxPattern === 'dots' ? 'var(--color-accent)' : '#ddd'}; box-shadow: ${state.customizer.boxPattern === 'dots' ? '0 0 0 2px var(--color-accent)' : 'none'}; border-radius: 4px; cursor: pointer; flex-shrink: 0;" title="Chấm Tròn Organic"></div>
        </div>
      </div>

      <!-- Tab custom upload -->
      <div class="opt-content box-opt-custom" style="display: ${state.customizer.boxOptionType === 'custom' ? 'block' : 'none'};">
        <div style="display:flex; flex-direction:column; gap:0.5rem;">
          <label style="display: flex; flex-direction: column; align-items: center; justify-content: center; border: 2px dashed #ccc; border-radius: 6px; padding: 0.8rem; cursor: pointer; background: white; margin:0;">
            <i class="fa-solid fa-cloud-arrow-up" style="font-size: 1.2rem; color: var(--color-accent); margin-bottom: 0.3rem;"></i>
            <span style="font-size: 0.75rem; color: var(--color-text-light); text-align:center;">Tải ảnh họa tiết vỏ hộp lên (.png, .jpg)</span>
            <input type="file" id="box-custom-image-file" accept="image/*" style="display: none;">
          </label>
          ${state.customizer.boxCustomImage ? `
            <div style="display: flex; align-items: center; justify-content: space-between; background: #e8f5e9; padding: 0.4rem 0.8rem; border-radius: 6px;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <img src="${state.customizer.boxCustomImage}" style="width: 32px; height: 32px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;">
                <span style="font-size: 0.75rem; color: #2e7d32; font-weight:500;"><i class="fa-solid fa-circle-check"></i> Đã tải lên</span>
              </div>
              <button id="remove-box-custom-img" style="background: none; border: none; color: #c62828; cursor: pointer; font-size: 0.8rem;"><i class="fa-solid fa-trash"></i> Xóa</button>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;

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

  // Custom ribbon styling panel
  html += `
    <div class="customizer-options-panel" style="margin-top: -0.5rem; margin-bottom: 1.5rem; padding: 1rem; border: 1px dashed var(--color-border); border-radius: 8px; background-color: #faf8f5;">
      <h4 style="font-size: 0.95rem; margin-bottom: 0.8rem; display: flex; align-items: center; gap: 0.5rem; color: var(--color-text);">
        <i class="fa-solid fa-palette" style="color: var(--color-accent);"></i> Tùy biến họa tiết/màu sắc dây buộc
      </h4>
      <div class="customizer-tabs" style="display: flex; gap: 0.5rem; margin-bottom: 0.8rem;">
        <button class="tab-btn ${state.customizer.ribbonOptionType === 'color' ? 'active' : ''}" data-ribbon-opt="color" style="flex: 1; padding: 0.4rem; font-size: 0.8rem; border-radius: 6px; border: 1px solid var(--color-border); background: white; cursor: pointer; color: var(--color-text);">Màu sắc</button>
        <button class="tab-btn ${state.customizer.ribbonOptionType === 'pattern' ? 'active' : ''}" data-ribbon-opt="pattern" style="flex: 1; padding: 0.4rem; font-size: 0.8rem; border-radius: 6px; border: 1px solid var(--color-border); background: white; cursor: pointer; color: var(--color-text);">Họa tiết</button>
        <button class="tab-btn ${state.customizer.ribbonOptionType === 'custom' ? 'active' : ''}" data-ribbon-opt="custom" style="flex: 1; padding: 0.4rem; font-size: 0.8rem; border-radius: 6px; border: 1px solid var(--color-border); background: white; cursor: pointer; color: var(--color-text);">Tự tải lên</button>
      </div>
      
      <!-- Tab color -->
      <div class="opt-content ribbon-opt-color" style="display: ${state.customizer.ribbonOptionType === 'color' ? 'block' : 'none'};">
        <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
          ${[
            { color: '#bda58d', name: 'Đay Mộc Mạc' },
            { color: '#8fad88', name: 'Lá Xanh' },
            { color: '#e74c3c', name: 'Đỏ Nhung' },
            { color: '#3498db', name: 'Xanh Lam' },
            { color: '#f1c40f', name: 'Vàng Lụa' },
            { color: '#ffffff', name: 'Trắng Sữa' }
          ].map(c => `
            <span class="color-swatch-ribbon ${state.customizer.ribbonColor === c.color ? 'active' : ''}" 
                  data-color="${c.color}" 
                  title="${c.name}"
                  style="width: 26px; height: 26px; background-color: ${c.color}; border-radius: 50%; border: 2px solid ${state.customizer.ribbonColor === c.color ? 'var(--color-accent)' : '#ddd'}; box-shadow: ${state.customizer.ribbonColor === c.color ? '0 0 0 2px var(--color-accent)' : 'none'}; cursor: pointer; display: inline-block;">
            </span>
          `).join('')}
          <div style="display:flex; align-items:center; gap:0.3rem; margin-left:0.5rem;">
            <span style="font-size:0.75rem; color:var(--color-text-light);">Tự chọn:</span>
            <input type="color" id="ribbon-custom-color-picker" value="${state.customizer.ribbonColor}" style="border: none; padding: 0; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; background:none;">
          </div>
        </div>
      </div>

      <!-- Tab pattern -->
      <div class="opt-content ribbon-opt-pattern" style="display: ${state.customizer.ribbonOptionType === 'pattern' ? 'block' : 'none'};">
        <div style="display: flex; gap: 0.8rem; flex-wrap: wrap;">
          <div class="pattern-swatch-ribbon" data-pattern="polka" style="width: 50px; height: 50px; background-image: radial-gradient(circle, #ffffff 30%, transparent 30%); background-size: 6px 6px; background-color: #e74c3c; border: 2px solid ${state.customizer.ribbonPattern === 'polka' ? 'var(--color-accent)' : '#ddd'}; box-shadow: ${state.customizer.ribbonPattern === 'polka' ? '0 0 0 2px var(--color-accent)' : 'none'}; border-radius: 4px; cursor: pointer; flex-shrink: 0;" title="Chấm Bi Polka"></div>
          <div class="pattern-swatch-ribbon" data-pattern="stripe" style="width: 50px; height: 50px; background-image: repeating-linear-gradient(90deg, #3498db, #3498db 3px, #ffffff 3px, #ffffff 6px); border: 2px solid ${state.customizer.ribbonPattern === 'stripe' ? 'var(--color-accent)' : '#ddd'}; box-shadow: ${state.customizer.ribbonPattern === 'stripe' ? '0 0 0 2px var(--color-accent)' : 'none'}; border-radius: 4px; cursor: pointer; flex-shrink: 0;" title="Sọc Xanh-Trắng"></div>
          <div class="pattern-swatch-ribbon" data-pattern="grid" style="width: 50px; height: 50px; background-image: linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px); background-size: 4px 4px; background-color: #27ae60; border: 2px solid ${state.customizer.ribbonPattern === 'grid' ? 'var(--color-accent)' : '#ddd'}; box-shadow: ${state.customizer.ribbonPattern === 'grid' ? '0 0 0 2px var(--color-accent)' : 'none'}; border-radius: 4px; cursor: pointer; flex-shrink: 0;" title="Caru Lục"></div>
        </div>
      </div>

      <!-- Tab custom upload -->
      <div class="opt-content ribbon-opt-custom" style="display: ${state.customizer.ribbonOptionType === 'custom' ? 'block' : 'none'};">
        <div style="display:flex; flex-direction:column; gap:0.5rem;">
          <label style="display: flex; flex-direction: column; align-items: center; justify-content: center; border: 2px dashed #ccc; border-radius: 6px; padding: 0.8rem; cursor: pointer; background: white; margin:0;">
            <i class="fa-solid fa-cloud-arrow-up" style="font-size: 1.2rem; color: var(--color-accent); margin-bottom: 0.3rem;"></i>
            <span style="font-size: 0.75rem; color: var(--color-text-light); text-align:center;">Tải ảnh họa tiết dây ruy băng lên (.png, .jpg)</span>
            <input type="file" id="ribbon-custom-image-file" accept="image/*" style="display: none;">
          </label>
          ${state.customizer.ribbonCustomImage ? `
            <div style="display: flex; align-items: center; justify-content: space-between; background: #e8f5e9; padding: 0.4rem 0.8rem; border-radius: 6px;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <img src="${state.customizer.ribbonCustomImage}" style="width: 32px; height: 32px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;">
                <span style="font-size: 0.75rem; color: #2e7d32; font-weight:500;"><i class="fa-solid fa-circle-check"></i> Đã tải lên</span>
              </div>
              <button id="remove-ribbon-custom-img" style="background: none; border: none; color: #c62828; cursor: pointer; font-size: 0.8rem;"><i class="fa-solid fa-trash"></i> Xóa</button>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;

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
            
            <div style="background-color: rgba(143,173,136,0.1); border: 1px dashed var(--color-accent); padding: 1rem; border-radius: 8px; margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
              <div style="display: flex; align-items: center; gap: 0.6rem;">
                <i class="fa-solid fa-brain" style="color: var(--color-accent); font-size: 1.3rem;"></i>
                <div style="text-align: left;">
                  <span style="font-weight: 700; font-size: 0.85rem; display: block; color: var(--color-text);">Bạn chưa rõ nên chọn gì?</span>
                  <span style="font-size: 0.78rem; color: var(--color-text-light);">Để Trợ lý AI thiết kế hộp quà phù hợp nhất chỉ trong 1 phút.</span>
                </div>
              </div>
              <button class="btn btn-primary ai-assist-trigger-btn" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; border-radius: 6px;"><i class="fa-solid fa-brain"></i> Dùng Trợ lý AI</button>
            </div>

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

  // Bind Box styling option type tabs
  document.querySelectorAll('[data-box-opt]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.customizer.boxOptionType = btn.dataset.boxOpt;
      renderCustomizer();
    });
  });

  // Bind Box color swatch
  document.querySelectorAll('.color-swatch-box').forEach(swatch => {
    swatch.addEventListener('click', () => {
      state.customizer.boxColor = swatch.dataset.color;
      state.customizer.boxOptionType = 'color';
      renderCustomizer();
    });
  });

  // Bind Box custom color picker
  const boxColorPicker = document.getElementById('box-custom-color-picker');
  if (boxColorPicker) {
    boxColorPicker.addEventListener('change', (e) => {
      state.customizer.boxColor = e.target.value;
      state.customizer.boxOptionType = 'color';
      renderCustomizer();
    });
  }

  // Bind Box pattern swatch
  document.querySelectorAll('.pattern-swatch-box').forEach(swatch => {
    swatch.addEventListener('click', () => {
      state.customizer.boxPattern = swatch.dataset.pattern;
      state.customizer.boxOptionType = 'pattern';
      renderCustomizer();
    });
  });

  // Bind Box custom image upload
  const boxCustomFile = document.getElementById('box-custom-image-file');
  if (boxCustomFile) {
    boxCustomFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          state.customizer.boxCustomImage = event.target.result;
          state.customizer.boxOptionType = 'custom';
          renderCustomizer();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Bind Remove Box custom image
  const removeBoxCustomImg = document.getElementById('remove-box-custom-img');
  if (removeBoxCustomImg) {
    removeBoxCustomImg.addEventListener('click', () => {
      state.customizer.boxCustomImage = null;
      renderCustomizer();
    });
  }

  // Bind Ribbon styling option type tabs
  document.querySelectorAll('[data-ribbon-opt]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.customizer.ribbonOptionType = btn.dataset.ribbonOpt;
      renderCustomizer();
    });
  });

  // Bind Ribbon color swatch
  document.querySelectorAll('.color-swatch-ribbon').forEach(swatch => {
    swatch.addEventListener('click', () => {
      state.customizer.ribbonColor = swatch.dataset.color;
      state.customizer.ribbonOptionType = 'color';
      renderCustomizer();
    });
  });

  // Bind Ribbon custom color picker
  const ribbonColorPicker = document.getElementById('ribbon-custom-color-picker');
  if (ribbonColorPicker) {
    ribbonColorPicker.addEventListener('change', (e) => {
      state.customizer.ribbonColor = e.target.value;
      state.customizer.ribbonOptionType = 'color';
      renderCustomizer();
    });
  }

  // Bind Ribbon pattern swatch
  document.querySelectorAll('.pattern-swatch-ribbon').forEach(swatch => {
    swatch.addEventListener('click', () => {
      state.customizer.ribbonPattern = swatch.dataset.pattern;
      state.customizer.ribbonOptionType = 'pattern';
      renderCustomizer();
    });
  });

  // Bind Ribbon custom image upload
  const ribbonCustomFile = document.getElementById('ribbon-custom-image-file');
  if (ribbonCustomFile) {
    ribbonCustomFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          state.customizer.ribbonCustomImage = event.target.result;
          state.customizer.ribbonOptionType = 'custom';
          renderCustomizer();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Bind Remove Ribbon custom image
  const removeRibbonCustomImg = document.getElementById('remove-ribbon-custom-img');
  if (removeRibbonCustomImg) {
    removeRibbonCustomImg.addEventListener('click', () => {
      state.customizer.ribbonCustomImage = null;
      renderCustomizer();
    });
  }

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
      if (state.user && state.user.role === 'admin') {
        showToast('Tài khoản quản trị viên không thể mua sắm!', 'warning');
        return;
      }
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
        boxOptionType: state.customizer.boxOptionType,
        boxColor: state.customizer.boxColor,
        boxPattern: state.customizer.boxPattern,
        boxCustomImage: state.customizer.boxCustomImage,
        ribbonOptionType: state.customizer.ribbonOptionType,
        ribbonColor: state.customizer.ribbonColor,
        ribbonPattern: state.customizer.ribbonPattern,
        ribbonCustomImage: state.customizer.ribbonCustomImage,
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
      
      // Log feedback deviation if customized from AI suggest results
      if (state.aiAssist.originalRecommendation) {
        logAiFeedback({
          userId: state.user?.email || 'guest@ecoknot.vn',
          promptId: state.aiAssist.originalRecommendation.promptId,
          aiBoxMaterial: state.aiAssist.originalRecommendation.boxMaterial,
          aiBoxSize: state.aiAssist.originalRecommendation.boxSize,
          aiRibbon: state.aiAssist.originalRecommendation.ribbon,
          aiItems: state.aiAssist.originalRecommendation.items,
          finalItems: newCartItem.items
        });
        state.aiAssist.originalRecommendation = null; // Clear active session tracking
      }

      showToast('Đã thêm hộp quà tùy biến vào giỏ hàng thành công!');
      
      // Reset customization options
      state.customizer = {
        step: 1,
        box: BOX_MATERIALS[0].id,
        size: BOX_SIZES[0].id,
        ribbon: RIBBON_TYPES[0].id,
        boxOptionType: 'color',
        boxColor: '#f3ede2',
        boxPattern: 'stripe',
        boxCustomImage: null,
        ribbonOptionType: 'color',
        ribbonColor: '#bda58d',
        ribbonPattern: 'polka',
        ribbonCustomImage: null,
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
                <span>${cat.nameVi}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <div class="filter-section">
          <h3>Vật phẩm rời</h3>
          <div class="filter-list">
            <label class="filter-item">
              <input type="radio" name="shop-cat-filter" value="all-items" ${state.shopCategory === 'all-items' ? 'checked' : ''}>
              <span>Tất cả</span>
            </label>
            <label class="filter-item">
              <input type="radio" name="shop-cat-filter" value="fashion" ${state.shopCategory === 'fashion' ? 'checked' : ''}>
              <span>Đồ thời trang</span>
            </label>
            <label class="filter-item">
              <input type="radio" name="shop-cat-filter" value="handicraft" ${state.shopCategory === 'handicraft' ? 'checked' : ''}>
              <span>Đồ thủ công mỹ nghệ</span>
            </label>
            <label class="filter-item">
              <input type="radio" name="shop-cat-filter" value="stationery" ${state.shopCategory === 'stationery' ? 'checked' : ''}>
              <span>Văn phòng phẩm</span>
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
  const PRODUCT_CATEGORIES = ['fashion', 'handicraft', 'stationery'];
  const isProductCategoryView = PRODUCT_CATEGORIES.includes(state.shopCategory);
  
  if (state.shopCategory === 'all' || state.shopCategory === 'all-items' || isProductCategoryView) {
    PRODUCTS.forEach(prod => {
      if (state.shopTag === 'all' || prod.tags.includes(state.shopTag)) {
        if (state.searchQuery === '' || prod.name.toLowerCase().includes(state.searchQuery.toLowerCase())) {
          if (state.shopCategory === 'all' || state.shopCategory === 'all-items' || prod.category === state.shopCategory) {
            itemsToRender.push({ data: prod, type: 'item' });
          }
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
      const catId = e.target.value;
      const cat = GIFT_BOX_CATEGORIES.find(c => c.id === catId);
      if (cat?.redirect) {
        navigateTo(cat.redirect);
        return;
      }
      state.shopCategory = catId;
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
      if (state.user && state.user.role === 'admin') {
        showToast('Tài khoản quản trị viên không thể mua sắm!', 'warning');
        return;
      }
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

  if (state.trackingActiveTab === undefined) {
    state.trackingActiveTab = 'all';
  }
  if (state.expandedOrderId === undefined) {
    state.expandedOrderId = null;
  }

  const statusLabels = {
    confirmed: 'Chờ xác nhận',
    processing: 'Đang đóng gói',
    shipping: 'Đang vận chuyển',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy'
  };

  // Shopee status tabs HTML
  let tabsHtml = `
    <div class="shopee-tabs" style="display: flex; border-bottom: 2px solid #f0f0f0; margin-bottom: 1.5rem; overflow-x: auto; white-space: nowrap; -webkit-overflow-scrolling: touch; gap: 0.5rem; scrollbar-width: none;">
      ${[
        { key: 'all', label: 'Tất cả' },
        { key: 'confirmed', label: 'Chờ xác nhận' },
        { key: 'processing', label: 'Đang đóng gói' },
        { key: 'shipping', label: 'Đang vận chuyển' },
        { key: 'delivered', label: 'Đã giao' },
        { key: 'cancelled', label: 'Đã hủy' }
      ].map(tab => {
        const isActive = state.trackingActiveTab === tab.key;
        return `
          <button class="shopee-tab-btn" data-status="${tab.key}" style="flex: 1; min-width: 90px; text-align: center; padding: 0.8rem 0.5rem; border: none; background: none; font-size: 0.9rem; font-weight: ${isActive ? '700' : '500'}; color: ${isActive ? 'var(--color-accent)' : 'var(--color-text-light)'}; border-bottom: 3px solid ${isActive ? 'var(--color-accent)' : 'transparent'}; cursor: pointer; transition: all 0.2s;">
            ${tab.label}
          </button>
        `;
      }).join('')}
    </div>
  `;

  // Get orders list to display
  let filteredOrders = state.orders;
  if (state.trackingActiveTab !== 'all') {
    filteredOrders = state.orders.filter(o => o.status === state.trackingActiveTab);
  }

  let ordersListHtml = '';
  if (filteredOrders.length === 0) {
    ordersListHtml = `
      <div class="text-center" style="padding: 3rem 1rem; color: var(--color-text-light);">
        <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; margin-bottom: 1rem; color: #ccc;"></i>
        <p>Không có đơn hàng nào trong trạng thái này.</p>
      </div>
    `;
  } else {
    filteredOrders.forEach(order => {
      // Determine vertical timeline steps
      let timelineStepsHtml = '';
      if (order.status === 'cancelled') {
        timelineStepsHtml = `
          <div class="vertical-timeline" style="margin-top: 1rem; border-left: 2px solid var(--color-danger); padding-left: 1.5rem; position: relative;">
            <div class="timeline-step completed" style="position: relative; margin-bottom: 1.5rem; display: flex; gap: 1rem; align-items: flex-start;">
              <div class="timeline-node" style="width: 32px; height: 32px; border-radius: 50%; background: var(--color-danger); border: 2px solid var(--color-danger); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; flex-shrink: 0; z-index: 1;">
                <i class="fa-solid fa-xmark"></i>
              </div>
              <div class="timeline-details" style="flex: 1;">
                <span class="timeline-time" style="font-size: 0.75rem; color: var(--color-text-light); display: block; margin-bottom: 0.15rem;">${order.tracking[order.tracking.length - 1]?.time || order.date}</span>
                <span class="timeline-desc" style="font-weight: 600; color: var(--color-danger); display: block; font-size: 0.9rem;">Đơn hàng đã bị hủy</span>
                <span style="font-size: 0.75rem; color: var(--color-text-light); display: block; margin-top: 0.2rem;">Yêu cầu hủy được ghi nhận thành công.</span>
              </div>
            </div>
          </div>
        `;
      } else {
        const stages = [
          { key: 'confirmed', label: 'Thiết kế hoàn tất & Xác nhận đơn', icon: '<i class="fa-solid fa-check"></i>' },
          { key: 'processing', label: 'Đang đóng gói thủ công (Giấy tổ ong, nơ đay)', icon: '<i class="fa-solid fa-box-open"></i>' },
          { key: 'shipping_handover', label: 'Đã giao cho vận chuyển carbon thấp', icon: '<i class="fa-solid fa-truck-ramp-box"></i>' },
          { key: 'shipping', label: 'Đang trên đường vận chuyển', icon: '<i class="fa-solid fa-truck-fast"></i>' },
          { key: 'delivered', label: 'Đã giao hàng thành công', icon: '<i class="fa-solid fa-house-chimney-user"></i>' }
        ];

        let activeIndex = 0;
        if (order.status === 'confirmed') activeIndex = 0;
        else if (order.status === 'processing') activeIndex = 1;
        else if (order.status === 'shipping') activeIndex = 3;
        else if (order.status === 'delivered') activeIndex = 4;

        timelineStepsHtml = `<div class="vertical-timeline" style="margin-top: 1rem; border-left: 2px solid var(--color-border-light); padding-left: 1.5rem; position: relative;">`;

        stages.forEach((stage, idx) => {
          const isCompleted = idx < activeIndex || order.status === 'delivered';
          const isActive = idx === activeIndex && order.status !== 'delivered';
          
          let timeText = '';
          if (isCompleted || isActive) {
            const log = order.tracking[idx] || order.tracking[order.tracking.length - 1];
            timeText = log ? log.time : '';
          }

          timelineStepsHtml += `
            <div class="timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}" style="position: relative; margin-bottom: 1.5rem; display: flex; gap: 1rem; align-items: flex-start;">
              <div class="timeline-node" style="width: 32px; height: 32px; border-radius: 50%; background: ${isCompleted ? 'var(--color-accent)' : isActive ? '#fff' : '#f0f0f0'}; border: 2px solid ${isActive ? 'var(--color-accent)' : isCompleted ? 'var(--color-accent)' : '#ccc'}; color: ${isCompleted ? '#fff' : isActive ? 'var(--color-accent)' : '#999'}; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; flex-shrink: 0; z-index: 1;">
                ${stage.icon}
              </div>
              <div class="timeline-details" style="flex: 1;">
                ${timeText ? `<span class="timeline-time" style="font-size: 0.75rem; color: var(--color-text-light); display: block; margin-bottom: 0.15rem;">${timeText}</span>` : ''}
                <span class="timeline-desc" style="font-weight: ${isActive ? '600' : 'normal'}; color: ${isActive ? 'var(--color-accent)' : 'var(--color-text)'}; display: block; font-size: 0.9rem;">${stage.label}</span>
                ${isActive ? `<span style="font-size: 0.75rem; color: var(--color-accent); font-weight: 600; display: block; margin-top: 0.2rem;"><i class="fa-solid fa-spinner fa-spin"></i> Trạng thái hiện tại</span>` : ''}
              </div>
            </div>
          `;
        });

        timelineStepsHtml += `</div>`;
      }

      ordersListHtml += `
        <div class="shopee-order-card" style="background: white; border-radius: 12px; border: 1px solid var(--color-border-light); margin-bottom: 1.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.02); overflow: hidden; transition: all 0.3s ease;">
          <div class="shopee-order-header" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-bottom: 1px solid #f6f6f6; background-color: #faf9f6;">
            <div style="display: flex; align-items: center; gap: 0.8rem;">
              <span style="font-weight: 700; color: var(--color-text); font-size: 1.05rem;">${order.id}</span>
              <span style="font-size: 0.8rem; color: var(--color-text-light);">${order.date}</span>
            </div>
            <span class="status-badge ${order.status}">${statusLabels[order.status]}</span>
          </div>
          
          <div class="shopee-order-body" style="padding: 1.2rem 1.5rem;">
            ${order.items.map(item => `
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.8rem; padding-bottom: 0.8rem; border-bottom: 1px dashed #f0f0f0;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <div style="width: 48px; height: 48px; background-color: #f7f5f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 1px solid #eee; flex-shrink:0;">
                    <i class="fa-solid fa-gift" style="color: var(--color-accent); font-size: 1.2rem;"></i>
                  </div>
                  <div>
                    <h4 style="font-size: 0.9rem; margin: 0; color: var(--color-text); font-weight:600;">${item.name}</h4>
                    <span style="font-size: 0.8rem; color: var(--color-text-light);">Số lượng: x${item.qty}</span>
                  </div>
                </div>
                <span style="font-weight: 600; color: var(--color-text); font-size:0.9rem;">${formatCurrency(item.price)}</span>
              </div>
            `).join('')}
          </div>

          <div class="shopee-order-footer" style="padding: 1rem 1.5rem; background-color: #faf9f6; border-top: 1px solid #f6f6f6; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <span style="font-size: 0.85rem; color: var(--color-text-light);">Tổng tiền: </span>
              <span style="font-size: 1.15rem; font-weight: 700; color: var(--color-accent);">${formatCurrency(order.total)}</span>
            </div>
            
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-secondary btn-sm toggle-timeline-btn" data-order-id="${order.id}" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 0.3rem;">
                <i class="fa-solid fa-route"></i> ${state.expandedOrderId === order.id ? 'Thu gọn' : 'Xem hành trình'}
              </button>
              ${order.status === 'shipping' ? `
                <button class="btn btn-primary btn-sm confirm-received-btn" data-order-id="${order.id}" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; border-radius: 6px; cursor: pointer; background-color: var(--color-accent); border: none; color: white; font-weight:600;">
                  Đã nhận hàng
                </button>
              ` : ''}
              ${order.status === 'confirmed' || order.status === 'processing' ? `
                <button class="btn btn-danger btn-sm cancel-order-btn" data-order-id="${order.id}" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; border-radius: 6px; cursor: pointer; background: #e74c3c; border: none; color: white;">
                  Hủy đơn
                </button>
              ` : ''}
              ${order.status === 'delivered' ? `
                <button class="btn btn-secondary btn-sm buy-again-btn" data-order-id="${order.id}" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 0.3rem;">
                  <i class="fa-solid fa-rotate-left"></i> Mua lại
                </button>
              ` : ''}
            </div>
          </div>
          
          <!-- Collapsible timeline -->
          <div class="order-timeline-collapse" id="timeline-${order.id}" style="display: ${state.expandedOrderId === order.id ? 'block' : 'none'}; padding: 1.5rem; background: #fff; border-top: 1px solid #f0f0f0;">
            <h4 style="font-size:0.95rem; margin-bottom:1rem; color:var(--color-text); border-bottom:1px solid #f0f0f0; padding-bottom:0.5rem;"><i class="fa-solid fa-location-dot" style="color:var(--color-accent);"></i> Lịch sử hành trình đơn hàng</h4>
            ${timelineStepsHtml}
          </div>
        </div>
      `;
    });
  }

  let html = `
    <div class="section-title-container">
      <h2>Theo dõi đơn hàng</h2>
      <p class="section-subtitle">Giao diện theo dõi đơn hàng tiện lợi chuẩn Shopee</p>
    </div>
    
    <div style="max-width: 800px; margin: 0 auto;">
      <!-- Tab navigation -->
      ${tabsHtml}
      
      <!-- List of orders -->
      <div id="shopee-orders-container">
        ${ordersListHtml}
      </div>
    </div>
  `;

  view.innerHTML = html;

  // Bind Tab clicks
  document.querySelectorAll('.shopee-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.trackingActiveTab = btn.dataset.status;
      renderTracking();
    });
  });

  // Bind "Xem hành trình" toggle
  document.querySelectorAll('.toggle-timeline-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = btn.dataset.orderId;
      if (state.expandedOrderId === orderId) {
        state.expandedOrderId = null;
      } else {
        state.expandedOrderId = orderId;
      }
      renderTracking();
    });
  });

  // Bind "Đã nhận hàng"
  document.querySelectorAll('.confirm-received-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = btn.dataset.orderId;
      const order = state.orders.find(o => o.id === orderId);
      if (order) {
        order.status = 'delivered';
        order.statusText = 'Đã giao hàng thành công';
        order.tracking.push({
          time: new Date().toISOString().replace('T', ' ').substring(0, 16),
          desc: 'Khách hàng xác nhận đã nhận được hàng'
        });
        saveStateToStorage();
        showToast(`Đã xác nhận nhận hàng cho đơn ${orderId}!`);
        renderTracking();
      }
    });
  });

  // Bind "Hủy đơn"
  document.querySelectorAll('.cancel-order-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = btn.dataset.orderId;
      if (confirm(`Bạn có chắc chắn muốn hủy đơn hàng ${orderId}?`)) {
        const order = state.orders.find(o => o.id === orderId);
        if (order) {
          order.status = 'cancelled';
          order.statusText = 'Đã hủy đơn hàng';
          order.tracking.push({
            time: new Date().toISOString().replace('T', ' ').substring(0, 16),
            desc: 'Khách hàng yêu cầu hủy đơn hàng'
          });
          saveStateToStorage();
          showToast(`Đã hủy đơn hàng ${orderId} thành công.`);
          renderTracking();
        }
      }
    });
  });

  // Bind "Mua lại"
  document.querySelectorAll('.buy-again-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = btn.dataset.orderId;
      const order = state.orders.find(o => o.id === orderId);
      if (order) {
        order.items.forEach(item => {
          const preset = PRESET_BOXES.find(pb => pb.name === item.name);
          let newCartItem;
          if (preset) {
            newCartItem = {
              id: 'preset-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
              type: 'preset',
              name: preset.name,
              image: preset.image,
              qty: item.qty,
              price: preset.price,
              items: [...preset.items],
              metrics: { ...preset.metrics }
            };
          } else {
            newCartItem = {
              id: 'custom-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
              type: 'custom',
              name: item.name,
              qty: item.qty,
              price: item.price,
              box: 'box-kraft',
              size: 'size-medium',
              ribbon: 'ribbon-jute',
              boxOptionType: 'color',
              boxColor: '#f3ede2',
              ribbonOptionType: 'color',
              ribbonColor: '#bda58d',
              items: [],
              card: { text: '', font: 'var(--font-body)', color: '#3E3E3E' },
              photo: null,
              metrics: {
                recycledContent: 85,
                recyclabilityRate: 100,
                reusablePackaging: 90,
                renewableMaterial: 95,
                virginPlasticReduction: 150,
                carbonFootprintAvoided: 1.5
              }
            };
          }
          state.cart.push(newCartItem);
        });
        saveStateToStorage();
        updateCartCount();
        showToast(`Đã thêm lại các sản phẩm vào giỏ hàng!`);
        openCartDrawer();
      }
    });
  });
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
  if (state.user && state.user.role === 'admin') {
    showToast('Tài khoản quản trị viên không thể mua sắm!', 'warning');
    return;
  }
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

      // Compute custom box thumbnail style in cart drawer
      let itemBoxBgStyle = '';
      if (item.boxOptionType === 'color') {
        itemBoxBgStyle = `background-color: ${item.boxColor}; background-image: none;`;
      } else if (item.boxOptionType === 'pattern') {
        const pat = BOX_PATTERNS[item.boxPattern];
        if (pat) {
          itemBoxBgStyle = `background-image: ${pat.image}; background-size: ${pat.size}; background-position: ${pat.position}; background-color: ${pat.color};`;
        } else {
          itemBoxBgStyle = `background-color: #f3ede2;`;
        }
      } else if (item.boxOptionType === 'custom' && item.boxCustomImage) {
        itemBoxBgStyle = `background-image: url(${item.boxCustomImage}); background-size: cover; background-position: center;`;
      } else {
        itemBoxBgStyle = `background-color: ${box.id === 'box-bamboo' ? '#e3dac9' : '#f3ede2'};`;
      }

      let itemRibColor = '';
      if (item.ribbonOptionType === 'color') {
        itemRibColor = item.ribbonColor;
      } else if (item.ribbonOptionType === 'pattern') {
        const pat = RIBBON_PATTERNS[item.ribbonPattern];
        itemRibColor = pat ? pat.color : '#bda58d';
      } else if (item.ribbonOptionType === 'custom' && item.ribbonCustomImage) {
        itemRibColor = '#bda58d'; // fallback
      } else {
        itemRibColor = ribbon.color;
      }

      let boxCustomDesc = 'Tự thiết kế';
      if (item.boxOptionType === 'color') {
        boxCustomDesc = `Màu (${item.boxColor})`;
      } else if (item.boxOptionType === 'pattern') {
        boxCustomDesc = `Họa tiết (${item.boxPattern})`;
      } else if (item.boxOptionType === 'custom') {
        boxCustomDesc = 'Ảnh tự tải';
      }

      let ribCustomDesc = 'Tự thiết kế';
      if (item.ribbonOptionType === 'color') {
        ribCustomDesc = `Màu (${item.ribbonColor})`;
      } else if (item.ribbonOptionType === 'pattern') {
        ribCustomDesc = `Họa tiết (${item.ribbonPattern})`;
      } else if (item.ribbonOptionType === 'custom') {
        ribCustomDesc = 'Ảnh tự tải';
      }

      html += `
        <div class="cart-item">
          <div class="cart-item-header">
            <div class="cart-item-preview-img" style="${itemBoxBgStyle} border: 2px solid ${itemRibColor}; position:relative; overflow:hidden; border-radius: 4px; width: 60px; height: 60px; flex-shrink: 0;">
              ${item.photo ? `<img src="${item.photo}" style="width:100%; height:100%; object-fit:cover;">` : `<i class="fa-solid fa-gift" style="font-size:1.5rem; color:${itemRibColor}; position:absolute; top:50%; left:50%; transform:translate(-50%, -50%);"></i>`}
            </div>
            <div class="cart-item-title-info">
              <h4>Hộp quà Custom (${size.name})</h4>
              <span class="cart-item-price">${formatCurrency(item.price)}</span>
            </div>
          </div>
          <div class="cart-item-selections">
            <ul>
              <li><strong>Hộp:</strong> ${box.name} (${boxCustomDesc})</li>
              <li><strong>Quà:</strong> ${itemNames || 'Chưa chọn quà'}</li>
              <li><strong>Ruy băng:</strong> ${ribbon.name} (${ribCustomDesc})</li>
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
      boxOptionType: item.boxOptionType || 'color',
      boxColor: item.boxColor || '#f3ede2',
      boxPattern: item.boxPattern || 'stripe',
      boxCustomImage: item.boxCustomImage || null,
      ribbonOptionType: item.ribbonOptionType || 'color',
      ribbonColor: item.ribbonColor || '#bda58d',
      ribbonPattern: item.ribbonPattern || 'polka',
      ribbonCustomImage: item.ribbonCustomImage || null,
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

// Go to Checkout page (replaces old simulateCheckout alert)
function goToCheckout() {
  if (state.cart.length === 0) return;
  
  if (!state.user) {
    showToast("Vui lòng đăng nhập để thanh toán!");
    openOnboardingSurvey();
    closeCartDrawer();
    return;
  }

  // Reset checkout state
  state.checkout.step = 1;
  state.checkout.couponCode = '';
  state.checkout.couponDiscount = 0;
  state.checkout.deliveryMethod = 'standard';
  state.checkout.shipFee = 35000;
  state.checkout.paymentMethod = 'cod';

  closeCartDrawer();
  navigateTo('checkout');
}

// Place order (called from checkout review step)
function placeOrder() {
  const total = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const orderId = 'EK-' + (1000 + state.orders.length + 1);
  
  let recycledTotal = 0, plasticSaved = 0, co2Saved = 0;
  state.cart.forEach(item => {
    recycledTotal += item.metrics.recycledContent * item.qty;
    plasticSaved += item.metrics.virginPlasticReduction * item.qty;
    co2Saved += item.metrics.carbonFootprintAvoided * item.qty;
  });
  const count = state.cart.reduce((sum, item) => sum + item.qty, 0);
  const grandTotal = total + state.checkout.shipFee - state.checkout.couponDiscount;

  const newOrder = {
    id: orderId,
    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    total: grandTotal,
    status: 'confirmed',
    statusText: 'Đã xác nhận thanh toán',
    items: state.cart.map(x => ({ name: x.type === 'custom' ? 'Hộp quà tùy biến' : x.name, qty: x.qty, price: x.price })),
    tracking: [
      { time: new Date().toISOString().replace('T', ' ').substring(0, 16), desc: "Đặt hàng thành công và thanh toán hoàn tất" }
    ],
    shippingInfo: { ...state.checkout.shippingInfo },
    paymentMethod: state.checkout.paymentMethod,
    metrics: {
      recycledContent: Math.round(recycledTotal / count),
      recyclabilityRate: 100,
      reusablePackaging: 90,
      renewableMaterial: 95,
      virginPlasticReduction: plasticSaved,
      carbonFootprintAvoided: co2Saved
    }
  };

  // Notify backend database profile about completed purchase for preference mapping
  if (state.user) {
    const purchasedIds = [];
    state.cart.forEach(item => {
      if (item.type === 'custom') {
        purchasedIds.push(...item.items);
      } else if (item.id) {
        purchasedIds.push(item.id);
      }
    });
    
    if (purchasedIds.length > 0) {
      fetch('/api/purchase-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: state.user.email,
          items: purchasedIds
        })
      }).then(res => res.json())
        .then(data => console.log('[Purchase logged for AI Profile]', data))
        .catch(err => console.error('Failed to log purchase:', err));
    }
  }

  state.orders.unshift(newOrder);
  state.cart = [];
  saveStateToStorage();
  updateCartCount();

  // Show success screen
  renderCheckoutSuccess(orderId, co2Saved);
}

// ==========================================================================
// INITIALIZATION & BINDINGS
// ==========================================================================
function initApp() {
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
      // Admin account detection
      const isAdmin = email === 'admin@ecoknot.vn' && password === 'admin123';
      state.user = {
        email,
        password,
        role: isAdmin ? 'admin' : 'user',
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
      loadCareLendarData();
      if (isAdmin) {
        showToast('Đăng nhập Admin thành công! Chào mừng quản trị viên.');
        navigateTo('admin');
      } else {
        showToast('Đăng nhập thành công!');
        renderHome();
      }
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

  // Dropdown: Admin Dashboard link
  const dropdownAdminLink = document.getElementById('dropdown-admin-link');
  if (dropdownAdminLink) {
    dropdownAdminLink.addEventListener('click', () => {
      userDropdown.classList.remove('show');
      navigateTo('admin');
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
      navigateTo('home');
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

  // AI Assist Drawer toggles
  const closeAiBtn = document.getElementById('close-ai-assist-btn');
  const aiOverlay = document.getElementById('ai-assist-drawer');
  if (closeAiBtn) closeAiBtn.addEventListener('click', closeAiAssistDrawer);
  if (aiOverlay) {
    aiOverlay.addEventListener('click', (e) => {
      if (e.target === aiOverlay) closeAiAssistDrawer();
    });
  }

  // Global event delegator for AI triggers
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.ai-assist-trigger-btn');
    if (trigger) {
      e.preventDefault();
      openAiAssistDrawer();
    }
  });

  // Checkout button
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', goToCheckout);
  }

  // DPP modal close
  const closeDpp = document.getElementById('close-dpp-btn');
  const dppOverlay = document.getElementById('dpp-modal');
  if (closeDpp) closeDpp.addEventListener('click', () => dppOverlay.classList.remove('active'));

  // Cert modal close
  const closeCert = document.getElementById('close-cert-btn');
  const certOverlay = document.getElementById('cert-modal');
  if (closeCert) closeCert.addEventListener('click', () => certOverlay.classList.remove('active'));
  if (certOverlay) certOverlay.addEventListener('click', (e) => {
    if (e.target === certOverlay) certOverlay.classList.remove('active');
  });

  // Add Product Modal Events
  const addProdModal = document.getElementById('add-product-modal');
  const closeAddProdBtn = document.getElementById('close-add-product-btn');
  const cancelAddProdBtn = document.getElementById('cancel-add-product-btn');
  const addProdForm = document.getElementById('add-product-form');

  const closeAddProductModal = () => {
    if (addProdModal) addProdModal.classList.remove('active');
    if (addProdForm) addProdForm.reset();
  };

  if (closeAddProdBtn) closeAddProdBtn.addEventListener('click', closeAddProductModal);
  if (cancelAddProdBtn) cancelAddProdBtn.addEventListener('click', closeAddProductModal);

  if (addProdForm) {
    addProdForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('prod-name').value.trim();
      const price = parseFloat(document.getElementById('prod-price').value) || 0;
      const image = document.getElementById('prod-image').value.trim() || IMAGE_FALLBACK;
      const description = document.getElementById('prod-desc').value.trim();
      
      // Get selected tags
      const checkedTagInputs = document.querySelectorAll('input[name="prod-tags"]:checked');
      const tags = Array.from(checkedTagInputs).map(input => input.value);
      if (tags.length === 0) {
        showToast('Vui lòng chọn ít nhất 1 tag phân loại!');
        return;
      }

      // DPP metrics
      const recycledContent = parseInt(document.getElementById('prod-recycled').value) || 85;
      const recyclabilityRate = parseInt(document.getElementById('prod-recyclability').value) || 100;
      const reusablePackaging = parseInt(document.getElementById('prod-reusable-pkg').value) || 90;
      const renewableMaterial = parseInt(document.getElementById('prod-renewable').value) || 95;
      const virginPlasticReduction = parseInt(document.getElementById('prod-plastic').value) || 80;
      const carbonFootprintAvoided = parseFloat(document.getElementById('prod-co2').value) || 1.0;
      const origin = document.getElementById('prod-origin').value.trim() || "Việt Nam";
      const material = document.getElementById('prod-material').value.trim() || "Nguyên liệu hữu cơ tự nhiên";
      const packaging = document.getElementById('prod-packaging').value.trim() || "Hộp giấy tái chế phân hủy sinh học";
      
      const certsInput = document.getElementById('prod-certs').value.trim();
      const certifications = certsInput ? certsInput.split(',').map(s => s.trim()).filter(Boolean) : ["FSC Certified", "Cruelty-Free"];

      const newProduct = {
        id: `prod-${Date.now()}`,
        name,
        category: "item",
        price,
        image,
        tags,
        description,
        dpp: {
          recycledContent,
          recyclabilityRate,
          reusablePackaging,
          renewableMaterial,
          virginPlasticReduction,
          carbonFootprintAvoided,
          origin,
          material,
          packaging,
          certifications
        }
      };

      PRODUCTS.push(newProduct);
      saveProductsToStorage();
      
      showToast('Đã thêm sản phẩm thành công!');
      closeAddProductModal();
      renderAdmin();
    });
  }

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

  // Notification Bell toggles
  const bellBtn = document.getElementById('notification-bell-btn');
  const bellDropdown = document.getElementById('notification-dropdown');
  const markAllReadBtn = document.getElementById('mark-all-read-btn');

  if (bellBtn && bellDropdown) {
    bellBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!state.user) {
        showToast("Vui lòng đăng nhập để xem thông báo!");
        document.getElementById('login-modal').classList.add('active');
        return;
      }
      bellDropdown.classList.toggle('show');
    });
  }

  // Close bell dropdown on outside click
  document.addEventListener('click', (e) => {
    if (bellDropdown && !e.target.closest('.notification-bell-container')) {
      bellDropdown.classList.remove('show');
    }
  });

  if (markAllReadBtn) {
    markAllReadBtn.addEventListener('click', async () => {
      const unread = state.notifications.filter(n => !n.is_read);
      if (unread.length === 0) return;
      
      const email = state.user?.email || 'admin@ecoknot.vn';
      for (let n of unread) {
        try {
          await fetch(`/api/notifications/${n.id}/read`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: email })
          });
          n.is_read = true;
        } catch (e) {
          console.error(e);
        }
      }
      updateNotificationsUI();
      showToast("Đã đánh dấu đọc tất cả thông báo!");
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// ==========================================================================
// 8. CHECKOUT PAGE
// ==========================================================================
function renderCheckout() {
  const view = document.getElementById('app-view');

  if (!state.user) {
    view.innerHTML = `<div class="text-center" style="padding:4rem 0;"><i class="fa-solid fa-lock" style="font-size:2rem;color:var(--color-border);margin-bottom:1rem;"></i><p>Vui lòng đăng nhập để thanh toán.</p><button class="btn btn-primary mt-2" onclick="document.getElementById('login-modal').classList.add('active')">Đăng nhập</button></div>`;
    return;
  }

  const step = state.checkout.step;
  const subtotal = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipFee = state.checkout.shipFee;
  const discount = state.checkout.couponDiscount;
  const grandTotal = subtotal + shipFee - discount;
  const totalCo2 = state.cart.reduce((s, i) => s + i.metrics.carbonFootprintAvoided * i.qty, 0);

  const steps = ['Thông tin giao', 'Vận chuyển', 'Thanh toán', 'Xác nhận'];
  let stepperHtml = `<div class="checkout-stepper">`;
  steps.forEach((label, i) => {
    const idx = i + 1;
    const cls = idx < step ? 'completed' : (idx === step ? 'active' : '');
    const icon = idx < step ? '<i class="fa-solid fa-check"></i>' : idx;
    stepperHtml += `<div class="checkout-step-item ${cls}"><div class="checkout-step-num">${icon}</div><div class="checkout-step-label">${label}</div></div>`;
  });
  stepperHtml += `</div>`;

  // Summary sidebar
  let summaryHtml = `<div class="checkout-summary-card"><div class="checkout-summary-header"><i class="fa-solid fa-basket-shopping"></i> Đơn hàng của bạn</div><div class="checkout-summary-body">`;
  state.cart.forEach(item => {
    const name = item.type === 'custom' ? `Hộp quà Custom (${item.qty}x)` : item.name;
    const img = item.type === 'preset' && item.image ? `<img src="${item.image}" onerror="this.style.display='none'">` : `<i class="fa-solid fa-gift"></i>`;
    summaryHtml += `<div class="checkout-summary-item"><div class="checkout-item-icon">${img}</div><div class="checkout-item-info"><div class="checkout-item-name">${name}</div><div class="checkout-item-qty">x${item.qty}</div></div><div class="checkout-item-price">${formatCurrency(item.price * item.qty)}</div></div>`;
  });
  summaryHtml += `</div><div class="checkout-totals"><div class="checkout-total-row"><span>Tạm tính</span><span>${formatCurrency(subtotal)}</span></div><div class="checkout-total-row"><span>Phí vận chuyển</span><span>${formatCurrency(shipFee)}</span></div>${discount > 0 ? `<div class="checkout-total-row discount"><span>Mã giảm giá</span><span>-${formatCurrency(discount)}</span></div>` : ''}<div class="checkout-total-row grand-total"><span>Tổng thanh toán</span><span>${formatCurrency(grandTotal)}</span></div></div><div class="checkout-eco-card"><i class="fa-solid fa-leaf"></i><span>Đơn hàng này tránh phát thải <strong>${totalCo2.toFixed(1)} kg CO₂e</strong></span></div></div>`;

  // Step content
  let formHtml = '';

  if (step === 1) {
    const s = state.checkout.shippingInfo;
    formHtml = `
      <div class="checkout-form-panel">
        <div class="checkout-section-title"><i class="fa-solid fa-location-dot"></i> Thông tin giao hàng</div>
        <div class="form-row-2">
          <div class="form-group"><label>Họ và tên *</label><input type="text" id="co-name" value="${s.name}" placeholder="Nguyễn Văn A"></div>
          <div class="form-group"><label>Số điện thoại *</label><input type="tel" id="co-phone" value="${s.phone}" placeholder="09xxxxxxxx"></div>
        </div>
        <div class="form-group"><label>Email nhận xác nhận *</label><input type="email" id="co-email" value="${s.email || state.user.email}" placeholder="email@example.com"></div>
        <div class="form-row-2">
          <div class="form-group"><label>Tỉnh / Thành phố *</label>
            <select id="co-province"><option value="">Chọn Tỉnh/TP...</option><option ${s.province==='HCM'?'selected':''} value="HCM">TP. Hồ Chí Minh</option><option ${s.province==='HN'?'selected':''} value="HN">Hà Nội</option><option ${s.province==='DN'?'selected':''} value="DN">Đà Nẵng</option><option ${s.province==='other'?'selected':''} value="other">Tỉnh khác</option></select>
          </div>
          <div class="form-group"><label>Quận / Huyện *</label><input type="text" id="co-district" value="${s.district}" placeholder="Quận 1, Huyện..."></div>
        </div>
        <div class="form-row-2">
          <div class="form-group"><label>Phường / Xã</label><input type="text" id="co-ward" value="${s.ward}" placeholder="Phường Bến Nghé..."></div>
          <div class="form-group"><label>Số nhà, tên đường *</label><input type="text" id="co-address" value="${s.address}" placeholder="123 Đường ABC..."></div>
        </div>
        <div class="form-group"><label>Ghi chú đơn hàng</label><textarea id="co-note" rows="2" placeholder="Yêu cầu đặc biệt về thời gian giao, hướng dẫn tìm nhà...">${s.note}</textarea></div>
        <div class="checkout-nav-btns">
          <button class="btn btn-outline" id="co-back-home"><i class="fa-solid fa-arrow-left"></i> Quay lại giỏ hàng</button>
          <button class="btn btn-primary" id="co-next-1">Tiếp theo <i class="fa-solid fa-arrow-right"></i></button>
        </div>
      </div>`;
  } else if (step === 2) {
    const dm = state.checkout.deliveryMethod;
    formHtml = `
      <div class="checkout-form-panel">
        <div class="checkout-section-title"><i class="fa-solid fa-truck-fast"></i> Phương thức vận chuyển</div>
        <div class="option-list">
          <label class="option-item ${dm==='standard'?'selected':''}" id="ship-standard">
            <input type="radio" name="delivery" value="standard" ${dm==='standard'?'checked':''}><div class="payment-icon" style="background:#e8f5e9;color:#388e3c;"><i class="fa-solid fa-truck"></i></div>
            <div class="option-item-content"><div class="option-item-title">Giao hàng tiêu chuẩn</div><div class="option-item-desc">3 – 5 ngày làm việc · Xanh carbon thấp</div></div>
            <span class="option-item-price">35.000đ</span>
          </label>
          <label class="option-item ${dm==='express'?'selected':''}" id="ship-express">
            <input type="radio" name="delivery" value="express" ${dm==='express'?'checked':''}><div class="payment-icon" style="background:#fff3e0;color:#f57c00;"><i class="fa-solid fa-truck-fast"></i></div>
            <div class="option-item-content"><div class="option-item-title">Giao hàng nhanh</div><div class="option-item-desc">1 – 2 ngày làm việc · Đảm bảo an toàn hộp quà</div></div>
            <span class="option-item-price">65.000đ</span>
          </label>
          <label class="option-item ${dm==='same_day'?'selected':''}" id="ship-same">
            <input type="radio" name="delivery" value="same_day" ${dm==='same_day'?'checked':''}><div class="payment-icon" style="background:#fce4ec;color:#c62828;"><i class="fa-solid fa-bolt"></i></div>
            <div class="option-item-content"><div class="option-item-title">Hỏa tốc nội thành (HN / HCM)</div><div class="option-item-desc">Giao trong ngày · Chỉ áp dụng nội thành</div></div>
            <span class="option-item-price">95.000đ</span>
          </label>
        </div>
        <div class="checkout-nav-btns">
          <button class="btn btn-outline" id="co-back-2"><i class="fa-solid fa-arrow-left"></i> Quay lại</button>
          <button class="btn btn-primary" id="co-next-2">Tiếp theo <i class="fa-solid fa-arrow-right"></i></button>
        </div>
      </div>`;
  } else if (step === 3) {
    const pm = state.checkout.paymentMethod;
    formHtml = `
      <div class="checkout-form-panel">
        <div class="checkout-section-title"><i class="fa-solid fa-credit-card"></i> Phương thức thanh toán</div>
        <div class="option-list">
          <label class="option-item ${pm==='cod'?'selected':''}" id="pay-cod">
            <input type="radio" name="payment" value="cod" ${pm==='cod'?'checked':''}><div class="payment-icon" style="background:#e8f5e9;color:#2e7d32;"><i class="fa-solid fa-money-bill-wave"></i></div>
            <div class="option-item-content"><div class="option-item-title">COD – Thanh toán khi nhận hàng</div><div class="option-item-desc">Kiểm tra hàng rồi mới trả tiền</div></div>
            <span class="option-item-price">Miễn phí</span>
          </label>
          <label class="option-item ${pm==='bank_transfer'?'selected':''}" id="pay-bank">
            <input type="radio" name="payment" value="bank_transfer" ${pm==='bank_transfer'?'checked':''}><div class="payment-icon" style="background:#e3f2fd;color:#1565c0;"><i class="fa-solid fa-building-columns"></i></div>
            <div class="option-item-content"><div class="option-item-title">Chuyển khoản ngân hàng</div><div class="option-item-desc">Quét mã QR – Xác nhận trong 15 phút</div></div>
            <span class="option-item-price">Miễn phí</span>
          </label>
          <label class="option-item ${pm==='momo'?'selected':''}" id="pay-momo">
            <input type="radio" name="payment" value="momo" ${pm==='momo'?'checked':''}><div class="payment-icon" style="background:#fce4ec;color:#ad1457;font-weight:900;font-size:0.8rem;">M</div>
            <div class="option-item-content"><div class="option-item-title">Ví MoMo</div><div class="option-item-desc">Thanh toán qua ứng dụng MoMo</div></div>
            <span class="option-item-price">Miễn phí</span>
          </label>
          <label class="option-item ${pm==='zalopay'?'selected':''}" id="pay-zalopay">
            <input type="radio" name="payment" value="zalopay" ${pm==='zalopay'?'checked':''}><div class="payment-icon" style="background:#e3f2fd;color:#0056a0;font-weight:900;font-size:0.8rem;">Z</div>
            <div class="option-item-content"><div class="option-item-title">ZaloPay</div><div class="option-item-desc">Thanh toán qua ứng dụng ZaloPay</div></div>
            <span class="option-item-price">Miễn phí</span>
          </label>
        </div>
        <div id="qr-container" class="qr-mock-container ${pm==='bank_transfer'?'show':''}">
          <p style="font-size:0.85rem;font-weight:600;margin-bottom:0.75rem;">Quét mã QR để chuyển khoản</p>
          <div class="qr-mock-grid" id="qr-grid"></div>
          <p style="font-size:0.8rem;"><strong>MB Bank</strong> · 1234567890 · ECOKNOT GIFTING</p>
          <p style="font-size:0.75rem;color:var(--color-text-light);margin-top:0.25rem;">Nội dung: <strong>${state.user.email} - ${formatCurrency(grandTotal)}</strong></p>
        </div>
        <div style="margin-top:1.25rem;">
          <div class="checkout-section-title" style="font-size:0.95rem;"><i class="fa-solid fa-ticket"></i> Mã giảm giá</div>
          <div class="coupon-row">
            <input type="text" id="coupon-input" placeholder="ECOWELCOME10" value="${state.checkout.couponCode}">
            <button class="btn btn-outline" id="apply-coupon-btn">Áp dụng</button>
          </div>
          ${discount > 0 ? `<p style="color:var(--color-accent);font-size:0.85rem;margin-top:0.5rem;font-weight:600;"><i class="fa-solid fa-circle-check"></i> Đã giảm ${formatCurrency(discount)}!</p>` : ''}
        </div>
        <div class="checkout-nav-btns">
          <button class="btn btn-outline" id="co-back-3"><i class="fa-solid fa-arrow-left"></i> Quay lại</button>
          <button class="btn btn-primary" id="co-next-3">Xem lại đơn hàng <i class="fa-solid fa-arrow-right"></i></button>
        </div>
      </div>`;
  } else if (step === 4) {
    const si = state.checkout.shippingInfo;
    const dmLabel = {standard:'Tiêu chuẩn (3-5 ngày)', express:'Nhanh (1-2 ngày)', same_day:'Hỏa tốc (Trong ngày)'}[state.checkout.deliveryMethod];
    const pmLabel = {cod:'COD – Nhận hàng trả tiền', bank_transfer:'Chuyển khoản QR', momo:'Ví MoMo', zalopay:'ZaloPay'}[state.checkout.paymentMethod];
    formHtml = `
      <div class="checkout-form-panel">
        <div class="checkout-section-title"><i class="fa-solid fa-clipboard-check"></i> Xác nhận đơn hàng</div>
        <div style="display:flex;flex-direction:column;gap:1rem;">
          <div style="background:var(--bg-primary);border-radius:8px;padding:1rem 1.25rem;">
            <p style="font-size:0.8rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--color-text-light);margin-bottom:0.5rem;">Địa chỉ giao hàng</p>
            <p style="font-weight:600;">${si.name} · ${si.phone}</p>
            <p style="font-size:0.875rem;color:var(--color-text-light);">${si.address}, ${si.ward ? si.ward + ', ' : ''}${si.district}, ${si.province}</p>
          </div>
          <div style="background:var(--bg-primary);border-radius:8px;padding:1rem 1.25rem;">
            <p style="font-size:0.8rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--color-text-light);margin-bottom:0.5rem;">Vận chuyển & Thanh toán</p>
            <p style="font-size:0.875rem;"><i class="fa-solid fa-truck" style="color:var(--color-accent);margin-right:0.4rem;"></i>${dmLabel}</p>
            <p style="font-size:0.875rem;margin-top:0.25rem;"><i class="fa-solid fa-credit-card" style="color:var(--color-accent);margin-right:0.4rem;"></i>${pmLabel}</p>
          </div>
        </div>
        <div class="checkout-nav-btns">
          <button class="btn btn-outline" id="co-back-4"><i class="fa-solid fa-arrow-left"></i> Chỉnh sửa</button>
          <button class="btn btn-primary" id="co-place-order" style="background:linear-gradient(135deg,var(--color-accent),#7ba173);padding:0.9rem 2rem;"><i class="fa-solid fa-check-circle"></i> Đặt hàng ngay – ${formatCurrency(grandTotal)}</button>
        </div>
      </div>`;
  }

  view.innerHTML = `
    <div class="section-title-container">
      <h2>Thanh toán đơn hàng</h2>
      <p class="section-subtitle">Hoàn tất đơn hàng của bạn một cách an toàn và nhanh chóng</p>
    </div>
    ${stepperHtml}
    <div class="checkout-layout">
      <div id="checkout-form-area">${formHtml}</div>
      ${summaryHtml}
    </div>`;

  // Bind events
  const q = (id) => document.getElementById(id);

  if (step === 1) {
    q('co-back-home')?.addEventListener('click', () => { openCartDrawer(); navigateTo('home'); });
    q('co-next-1')?.addEventListener('click', () => {
      const name = q('co-name').value.trim();
      const phone = q('co-phone').value.trim();
      const province = q('co-province').value;
      const district = q('co-district').value.trim();
      const address = q('co-address').value.trim();
      if (!name || !phone || !province || !district || !address) { showToast('Vui lòng điền đầy đủ thông tin bắt buộc (*)!'); return; }
      state.checkout.shippingInfo = { name, phone, email: q('co-email').value.trim(), province, district, ward: q('co-ward').value.trim(), address, note: q('co-note').value.trim() };
      state.checkout.step = 2;
      renderCheckout();
    });
  } else if (step === 2) {
    q('co-back-2')?.addEventListener('click', () => { state.checkout.step = 1; renderCheckout(); });
    document.querySelectorAll('input[name="delivery"]').forEach(r => {
      r.addEventListener('change', () => {
        document.querySelectorAll('.option-item').forEach(el => el.classList.remove('selected'));
        r.closest('.option-item').classList.add('selected');
      });
    });
    q('co-next-2')?.addEventListener('click', () => {
      const sel = document.querySelector('input[name="delivery"]:checked')?.value || 'standard';
      state.checkout.deliveryMethod = sel;
      state.checkout.shipFee = sel === 'standard' ? 35000 : sel === 'express' ? 65000 : 95000;
      state.checkout.step = 3;
      renderCheckout();
    });
  } else if (step === 3) {
    // QR grid generation
    const qrGrid = q('qr-grid');
    if (qrGrid) {
      for (let i = 0; i < 49; i++) {
        const cell = document.createElement('div');
        cell.className = 'qr-mock-cell';
        cell.style.background = Math.random() > 0.45 ? '#222' : '#fff';
        qrGrid.appendChild(cell);
      }
    }
    document.querySelectorAll('input[name="payment"]').forEach(r => {
      r.addEventListener('change', () => {
        document.querySelectorAll('.option-item').forEach(el => el.classList.remove('selected'));
        r.closest('.option-item').classList.add('selected');
        const qrC = q('qr-container');
        if (qrC) qrC.classList.toggle('show', r.value === 'bank_transfer');
      });
    });
    q('apply-coupon-btn')?.addEventListener('click', () => {
      const code = q('coupon-input').value.trim().toUpperCase();
      if (code === 'ECOWELCOME10') {
        const disc = Math.round(subtotal * 0.1);
        state.checkout.couponCode = code;
        state.checkout.couponDiscount = disc;
        showToast(`Áp dụng mã thành công! Giảm ${formatCurrency(disc)}`);
        renderCheckout();
      } else if (code) {
        showToast('Mã giảm giá không hợp lệ hoặc đã hết hạn!');
      }
    });
    q('co-back-3')?.addEventListener('click', () => { state.checkout.step = 2; renderCheckout(); });
    q('co-next-3')?.addEventListener('click', () => {
      const pm = document.querySelector('input[name="payment"]:checked')?.value || 'cod';
      state.checkout.paymentMethod = pm;
      state.checkout.step = 4;
      renderCheckout();
    });
  } else if (step === 4) {
    q('co-back-4')?.addEventListener('click', () => { state.checkout.step = 3; renderCheckout(); });
    q('co-place-order')?.addEventListener('click', () => {
      q('co-place-order').disabled = true;
      q('co-place-order').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...';
      setTimeout(() => placeOrder(), 1200);
    });
  }
}

function renderCheckoutSuccess(orderId, co2Saved) {
  const view = document.getElementById('app-view');
  view.innerHTML = `
    <div class="checkout-success-page">
      <div class="checkout-success-animation"><i class="fa-solid fa-check"></i></div>
      <h2 style="font-size:1.75rem;margin-bottom:0.75rem;">Đặt hàng thành công! 🎉</h2>
      <p style="color:var(--color-text-light);margin-bottom:1rem;">Cảm ơn bạn đã tin tưởng EcoKnot Gifting. Chúng tôi sẽ chuẩn bị và giao hộp quà của bạn sớm nhất.</p>
      <div class="checkout-order-id"><i class="fa-solid fa-hashtag"></i> ${orderId}</div>
      <div style="background:rgba(143,173,136,0.08);border:1px solid rgba(143,173,136,0.25);border-radius:10px;padding:1rem 1.5rem;margin:1rem 0;text-align:center;">
        <i class="fa-solid fa-leaf" style="color:var(--color-accent);font-size:1.5rem;margin-bottom:0.5rem;"></i>
        <p style="font-size:0.9rem;">Đơn hàng này đã tránh phát thải <strong style="color:var(--color-accent);">${co2Saved.toFixed(1)} kg CO₂e</strong> so với quà tặng truyền thống!</p>
      </div>
      <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-top:1.5rem;">
        <button class="btn btn-primary" onclick="navigateTo('tracking')"><i class="fa-solid fa-location-dot"></i> Theo dõi đơn hàng</button>
        <button class="btn btn-outline" onclick="navigateTo('home')"><i class="fa-solid fa-house"></i> Trang chủ</button>
      </div>
    </div>`;
}
window.navigateTo = navigateTo;

// ==========================================================================
// 9. ADMIN DASHBOARD
// ==========================================================================
function renderAdmin() {
  const view = document.getElementById('app-view');

  if (!state.user || state.user.role !== 'admin') {
    view.innerHTML = `<div class="text-center" style="padding:4rem 0;"><i class="fa-solid fa-shield-halved" style="font-size:2.5rem;color:var(--color-border);margin-bottom:1rem;"></i><h3>Truy cập bị từ chối</h3><p style="margin-top:0.5rem;color:var(--color-text-light);">Bạn cần đăng nhập với tài khoản quản trị viên.</p><p style="font-size:0.82rem;color:var(--color-text-light);margin-top:0.5rem;">Email: admin@ecoknot.vn / Mật khẩu: admin123</p><button class="btn btn-outline" style="margin-top:1rem;" onclick="navigateTo('home')">Quay về trang chủ</button></div>`;
    return;
  }

  // Aggregate stats
  const totalOrders = state.orders.length;
  const totalRevenue = state.orders.reduce((s, o) => s + o.total, 0);
  const totalCo2 = state.orders.reduce((s, o) => s + o.metrics.carbonFootprintAvoided, 0);
  const totalPlastic = state.orders.reduce((s, o) => s + o.metrics.virginPlasticReduction, 0);
  const deliveredCount = state.orders.filter(o => o.status === 'delivered').length;
  const allProducts = [...PRODUCTS, ...PRESET_BOXES, ...CATEGORY_PRESETS];

  const activeTab = state.adminCurrentTab || 'overview';

  // Panel content
  let contentHtml = '<div class="admin-content">';

  // --- TAB: OVERVIEW ---
  const revenueByMonth = ['T1','T2','T3','T4','T5','T6'].map((m, i) => ({
    label: m, val: Math.round(totalRevenue * (0.1 + Math.random() * 0.2))
  }));
  const maxRev = Math.max(...revenueByMonth.map(r => r.val));

  let overviewHtml = `
    <div class="admin-panel ${activeTab === 'overview' ? 'active' : ''}" id="admin-panel-overview">
      <div class="admin-panel-header"><h2><i class="fa-solid fa-gauge-high" style="color:var(--color-accent);margin-right:0.5rem;"></i>Tổng quan hoạt động</h2><span style="font-size:0.8rem;color:var(--color-text-light);">Cập nhật: ${new Date().toLocaleDateString('vi-VN')}</span></div>
      <div class="kpi-grid">
        <div class="kpi-card" style="--kpi-color:#8FAD88"><div class="kpi-icon"><i class="fa-solid fa-box"></i></div><div class="kpi-value">${totalOrders}</div><div class="kpi-label">Tổng đơn hàng</div><div class="kpi-trend up"><i class="fa-solid fa-arrow-trend-up"></i> +${deliveredCount} đã giao</div></div>
        <div class="kpi-card" style="--kpi-color:#e67e22"><div class="kpi-icon"><i class="fa-solid fa-wallet"></i></div><div class="kpi-value">${(totalRevenue/1000000).toFixed(1)}M</div><div class="kpi-label">Doanh thu (VNĐ)</div><div class="kpi-trend up"><i class="fa-solid fa-arrow-trend-up"></i> +15% so với tháng trước</div></div>
        <div class="kpi-card" style="--kpi-color:#8e44ad"><div class="kpi-icon"><i class="fa-solid fa-tag"></i></div><div class="kpi-value">${allProducts.length}</div><div class="kpi-label">Sản phẩm đang bán</div><div class="kpi-trend neutral"><i class="fa-solid fa-minus"></i> Ổn định</div></div>
        <div class="kpi-card" style="--kpi-color:#27ae60"><div class="kpi-icon"><i class="fa-solid fa-leaf"></i></div><div class="kpi-value">${totalCo2.toFixed(1)}</div><div class="kpi-label">kg CO₂e đã tránh phát thải</div><div class="kpi-trend up"><i class="fa-solid fa-arrow-trend-up"></i> Tích lũy</div></div>
      </div>
      <div class="revenue-chart-card">
        <div class="chart-header"><h3>Biểu đồ doanh thu tham khảo</h3><span class="chart-period-badge">6 tháng gần nhất</span></div>
        <div class="admin-bar-chart">`;
  revenueByMonth.forEach(r => {
    const pct = Math.round((r.val / maxRev) * 100);
    overviewHtml += `<div class="admin-bar-col"><div class="admin-bar-val">${(r.val/1000000).toFixed(1)}M</div><div class="admin-bar" style="height:${pct}%;" title="${r.label}: ${r.val}"></div><div class="admin-bar-label">${r.label}</div></div>`;
  });
  overviewHtml += `</div></div>
      <div class="admin-table-card"><div class="admin-table-card-header"><h3>Đơn hàng gần nhất</h3></div>
        <table class="admin-data-table"><thead><tr><th>Mã đơn</th><th>Ngày</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead><tbody>`;
  state.orders.slice(0, 5).forEach(o => {
    overviewHtml += `<tr><td><strong>${o.id}</strong></td><td>${o.date}</td><td>${formatCurrency(o.total)}</td><td><span class="status-badge ${o.status}">${o.statusText}</span></td></tr>`;
  });
  overviewHtml += `</tbody></table></div></div>`;

  // --- TAB: ORDERS ---
  const filter = state.adminOrderFilter || 'all';
  const filteredOrders = filter === 'all' ? state.orders : state.orders.filter(o => o.status === filter);
  const statusFlow = { confirmed: 'processing', processing: 'shipping', shipping: 'delivered' };
  const statusLabels = { confirmed: 'Đã xác nhận', processing: 'Đang đóng gói', shipping: 'Đang vận chuyển', delivered: 'Đã giao' };

  let ordersHtml = `
    <div class="admin-panel ${activeTab === 'orders' ? 'active' : ''}" id="admin-panel-orders">
      <div class="admin-panel-header"><h2><i class="fa-solid fa-box" style="color:var(--color-accent);margin-right:0.5rem;"></i>Quản lý đơn hàng</h2><span style="font-size:0.85rem;color:var(--color-text-light);">Tổng: ${totalOrders} đơn</span></div>
      <div class="admin-table-card">
        <div class="admin-filter-row">
          <button class="admin-filter-btn ${filter==='all'?'active':''}" data-order-filter="all">Tất cả (${state.orders.length})</button>
          <button class="admin-filter-btn ${filter==='confirmed'?'active':''}" data-order-filter="confirmed">Xác nhận (${state.orders.filter(o=>o.status==='confirmed').length})</button>
          <button class="admin-filter-btn ${filter==='processing'?'active':''}" data-order-filter="processing">Đóng gói (${state.orders.filter(o=>o.status==='processing').length})</button>
          <button class="admin-filter-btn ${filter==='shipping'?'active':''}" data-order-filter="shipping">Vận chuyển (${state.orders.filter(o=>o.status==='shipping').length})</button>
          <button class="admin-filter-btn ${filter==='delivered'?'active':''}" data-order-filter="delivered">Đã giao (${state.orders.filter(o=>o.status==='delivered').length})</button>
        </div>
        <div style="overflow-x:auto;"><table class="admin-data-table"><thead><tr><th>Mã đơn</th><th>Ngày đặt</th><th>Khách hàng</th><th>Tổng tiền</th><th>Trạng thái</th><th>Hành động</th></tr></thead><tbody>`;
  filteredOrders.forEach(o => {
    const nextStatus = statusFlow[o.status];
    ordersHtml += `<tr>
      <td><strong>${o.id}</strong></td>
      <td style="font-size:0.8rem;">${o.date}</td>
      <td style="font-size:0.8rem;">${o.shippingInfo?.name || (state.user?.email || 'Khách')}</td>
      <td><strong>${formatCurrency(o.total)}</strong></td>
      <td><span class="status-badge ${o.status}">${statusLabels[o.status] || o.statusText}</span></td>
      <td>${nextStatus ? `<button class="status-update-btn" data-order-id="${o.id}" data-next-status="${nextStatus}"><i class="fa-solid fa-forward"></i> → ${statusLabels[nextStatus]}</button>` : '<span style="font-size:0.75rem;color:var(--color-accent);">✓ Hoàn tất</span>'}</td>
    </tr>`;
  });
  ordersHtml += `</tbody></table></div></div></div>`;

  // --- TAB: PRODUCTS ---
  let productsHtml = `
    <div class="admin-panel ${activeTab === 'products' ? 'active' : ''}" id="admin-panel-products">
      <div class="admin-panel-header" style="display:flex; justify-content:space-between; align-items:center; width:100%; gap: 1rem;">
        <h2><i class="fa-solid fa-tag" style="color:var(--color-accent);margin-right:0.5rem;"></i>Quản lý sản phẩm</h2>
        <button class="btn btn-primary" id="admin-add-product-btn" style="padding:0.6rem 1.2rem; font-size:0.9rem; border-radius:8px; display:flex; align-items:center; gap:0.5rem; background-color:var(--color-accent); border:none; color:white; cursor:pointer;"><i class="fa-solid fa-plus"></i> Thêm sản phẩm mới</button>
      </div>
      <div class="product-stat-row">
        <div class="product-stat-chip">Sản phẩm đơn: <span>${PRODUCTS.length}</span></div>
        <div class="product-stat-chip">Combo đóng sẵn: <span>${PRESET_BOXES.length}</span></div>
        <div class="product-stat-chip">Mẫu danh mục: <span>${CATEGORY_PRESETS.length}</span></div>
        <div class="product-stat-chip">Giá thấp nhất: <span>${formatCurrency(Math.min(...PRODUCTS.map(p=>p.price)))}</span></div>
        <div class="product-stat-chip">Giá cao nhất: <span>${formatCurrency(Math.max(...PRODUCTS.map(p=>p.price)))}</span></div>
      </div>
      <div class="admin-table-card"><div class="admin-table-card-header"><h3>Danh sách sản phẩm đơn (${PRODUCTS.length})</h3></div>
        <div style="overflow-x:auto;"><table class="admin-data-table"><thead><tr><th>Ảnh</th><th>Tên sản phẩm</th><th>Giá</th><th>Tags</th><th>DPP</th></tr></thead><tbody>`;
  PRODUCTS.forEach(p => {
    productsHtml += `<tr>
      <td><img class="admin-product-thumb" src="${p.image}" alt="${p.name}" onerror="this.style.display='none'"></td>
      <td><strong style="font-size:0.85rem;">${p.name}</strong></td>
      <td><strong style="color:var(--color-accent);">${formatCurrency(p.price)}</strong></td>
      <td style="font-size:0.75rem;">${p.tags.slice(0,3).join(', ')}${p.tags.length>3?'...':''}</td>
      <td><span style="font-size:0.75rem;color:var(--color-accent);font-weight:600;">CO₂: ${p.dpp.carbonFootprintAvoided}kg</span></td>
    </tr>`;
  });
  productsHtml += `</tbody></table></div></div></div>`;

  // --- TAB: SUSTAINABILITY ---
  const avgRecycled = Math.round(state.orders.reduce((s,o) => s+o.metrics.recycledContent, 0) / Math.max(state.orders.length, 1));
  let sustainHtml = `
    <div class="admin-panel ${activeTab === 'sustainability' ? 'active' : ''}" id="admin-panel-sustainability">
      <div class="admin-panel-header"><h2><i class="fa-solid fa-leaf" style="color:var(--color-accent);margin-right:0.5rem;"></i>Báo cáo Sustainability</h2></div>
      <div class="sustain-stats-grid">
        <div class="sustain-stat-card"><i class="fa-solid fa-cloud-sun"></i><div class="sustain-stat-value">${totalCo2.toFixed(1)}</div><div class="sustain-stat-label">kg CO₂e tránh phát thải</div></div>
        <div class="sustain-stat-card"><i class="fa-solid fa-trash-arrow-up"></i><div class="sustain-stat-value">${totalPlastic}g</div><div class="sustain-stat-label">Nhựa nguyên sinh giảm thiểu</div></div>
        <div class="sustain-stat-card"><i class="fa-solid fa-recycle"></i><div class="sustain-stat-value">${avgRecycled}%</div><div class="sustain-stat-label">Vật liệu tái chế trung bình</div></div>
        <div class="sustain-stat-card"><i class="fa-solid fa-box-open"></i><div class="sustain-stat-value">${deliveredCount}</div><div class="sustain-stat-label">Hộp quà xanh đã giao thành công</div></div>
      </div>
      <div class="admin-table-card"><div class="admin-table-card-header"><h3>Chỉ số từng đơn hàng</h3></div>
        <div style="overflow-x:auto;"><table class="admin-data-table"><thead><tr><th>Đơn hàng</th><th>CO₂e tránh (kg)</th><th>Nhựa giảm (g)</th><th>Vật liệu tái chế</th><th>Trạng thái</th></tr></thead><tbody>`;
  state.orders.forEach(o => {
    sustainHtml += `<tr>
      <td><strong>${o.id}</strong></td>
      <td style="color:var(--color-accent);font-weight:600;">${o.metrics.carbonFootprintAvoided.toFixed(1)}</td>
      <td>${o.metrics.virginPlasticReduction}</td>
      <td><div style="display:flex;align-items:center;gap:0.5rem;"><div style="width:60px;height:6px;background:var(--color-border-light);border-radius:3px;overflow:hidden;"><div style="width:${o.metrics.recycledContent}%;height:100%;background:var(--color-accent);border-radius:3px;"></div></div><span style="font-size:0.8rem;">${o.metrics.recycledContent}%</span></div></td>
      <td><span class="status-badge ${o.status}">${o.statusText}</span></td>
    </tr>`;
  });
  sustainHtml += `</tbody></table></div></div></div>`;

  contentHtml += overviewHtml + ordersHtml + productsHtml + sustainHtml + '</div>';

  view.innerHTML = `
    <div class="section-title-container">
      <h2><i class="fa-solid fa-gauge-high" style="color:var(--color-accent);margin-right:0.5rem;"></i>Admin Dashboard</h2>
      <p class="section-subtitle">Quản trị toàn diện cửa hàng EcoKnot Gifting</p>
    </div>
    <div class="admin-layout" style="grid-template-columns: 1fr;">${contentHtml}</div>`;

  // Order filter buttons
  document.querySelectorAll('.admin-filter-btn[data-order-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.adminOrderFilter = btn.dataset.orderFilter;
      state.adminCurrentTab = 'orders';
      renderAdmin();
    });
  });

  // Status update buttons
  document.querySelectorAll('.status-update-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = btn.dataset.orderId;
      const nextStatus = btn.dataset.nextStatus;
      const order = state.orders.find(o => o.id === orderId);
      if (order) {
        order.status = nextStatus;
        order.statusText = { confirmed: 'Đã xác nhận', processing: 'Đang đóng gói', shipping: 'Đang vận chuyển', delivered: 'Đã giao hàng thành công' }[nextStatus];
        order.tracking.push({ time: new Date().toISOString().replace('T',' ').substring(0,16), desc: `[Admin] Cập nhật trạng thái: ${order.statusText}` });
        saveStateToStorage();
        showToast(`Đã cập nhật đơn ${orderId} → ${order.statusText}`);
        renderAdmin();
      }
    });
  });

  // Add Product Button
  const addProdBtn = document.getElementById('admin-add-product-btn');
  if (addProdBtn) {
    addProdBtn.addEventListener('click', () => {
      const modal = document.getElementById('add-product-modal');
      if (modal) modal.classList.add('active');
    });
  }
}

// ==========================================================================
// 10. CARE-LENDAR & PREDICTIVE SYSTEM
// ==========================================================================

async function loadCareLendarData() {
  const userId = state.user?.email || 'admin@ecoknot.vn';
  try {
    // 1. Fetch Relationship Graph
    const resGraph = await fetch(`/api/relationship-graph?userId=${userId}`);
    state.relationshipGraph = await resGraph.json();

    // 2. Fetch Events
    const resEvents = await fetch(`/api/care-lendar/events?userId=${userId}`);
    state.careLendarEvents = await resEvents.json();

    // 3. Fetch Notifications
    const resNotifs = await fetch(`/api/notifications?userId=${userId}`);
    state.notifications = await resNotifs.json();

    // Update notification bell count
    updateNotificationsUI();
  } catch (e) {
    console.error("Failed to load Care-lendar data:", e);
  }
}

function updateNotificationsUI() {
  const countBadge = document.getElementById('notification-count');
  const listContainer = document.getElementById('notification-list-container');
  if (!countBadge || !listContainer) return;

  const unreadNotifs = state.notifications.filter(n => !n.is_read);
  const count = unreadNotifs.length;

  if (count > 0) {
    countBadge.innerText = count;
    countBadge.style.display = 'flex';
  } else {
    countBadge.style.display = 'none';
  }

  if (state.notifications.length === 0) {
    listContainer.innerHTML = `
      <div style="padding: 1.5rem; text-align: center; color: var(--color-text-light); font-size: 0.85rem;">
        <i class="fa-regular fa-bell-slash" style="font-size: 1.5rem; margin-bottom: 0.5rem; display: block; opacity: 0.5;"></i>
        Không có thông báo mới
      </div>
    `;
    return;
  }

  let html = '';
  state.notifications.forEach(n => {
    const timeStr = new Date(n.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(n.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    html += `
      <div class="notification-item ${n.is_read ? '' : 'unread'}" data-notification-id="${n.id}">
        <div class="notification-item-title-row">
          <span class="notification-item-title">${n.title}</span>
          <span class="notification-item-time">${timeStr}</span>
        </div>
        <div class="notification-item-desc">${n.message}</div>
        <div class="notification-item-cta">
          <i class="fa-solid fa-brain"></i> Xem gợi ý quà thiết kế sẵn <i class="fa-solid fa-arrow-right" style="margin-left:auto; font-size:0.7rem;"></i>
        </div>
      </div>
    `;
  });
  listContainer.innerHTML = html;

  // Bind click event on notification items
  listContainer.querySelectorAll('.notification-item').forEach(item => {
    item.addEventListener('click', async () => {
      const notifId = parseInt(item.dataset.notificationId);
      const notif = state.notifications.find(n => n.id === notifId);
      if (!notif) return;

      // Close dropdown
      document.getElementById('notification-dropdown').classList.remove('show');

      // Mark as read
      try {
        await fetch(`/api/notifications/${notifId}/read`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: state.user?.email || 'admin@ecoknot.vn' })
        });
        notif.is_read = true;
        updateNotificationsUI();
      } catch (err) {
        console.error("Mark read API failed:", err);
      }

      // Load draft recommendation to drawer
      const event = state.careLendarEvents.find(e => e.id === notif.event_id);
      if (event && event.suggested_box_draft) {
        // Open drawer with this draft
        state.aiAssist.results = event.suggested_box_draft;
        state.aiAssist.isOpen = true;
        
        const drawer = document.getElementById('ai-assist-drawer');
        if (drawer) drawer.classList.add('active');
        
        renderAiAssist();
      } else {
        showToast("Không tìm thấy bản nháp hộp quà hoặc bản nháp chưa sẵn sàng.");
      }
    });
  });
}

function renderCareLendar() {
  const view = document.getElementById('app-view');
  if (!view) return;

  if (!state.user) {
    view.innerHTML = `
      <div class="text-center" style="padding: 4rem 0;">
        <i class="fa-solid fa-calendar-days" style="font-size: 3rem; color: var(--color-border); margin-bottom: 1rem; display:block;"></i>
        <p>Vui lòng đăng nhập để sử dụng chức năng Lịch sự kiện &amp; Bản đồ mối quan hệ.</p>
        <button class="btn btn-primary mt-2" onclick="document.getElementById('login-modal').classList.add('active')">Đăng nhập</button>
      </div>
    `;
    return;
  }

  // ─── Build Month Calendar Grid ─────────────────────────────────────────────
  const now = state._calendarDate ? new Date(state._calendarDate) : new Date();
  const year  = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  const monthNames = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
                      'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
  const dayNames   = ['CN','T2','T3','T4','T5','T6','T7'];

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth     = new Date(year, month + 1, 0).getDate();
  const today           = new Date();
  today.setHours(0, 0, 0, 0);

  // Build event lookup by date string "YYYY-MM-DD"
  const eventsByDate = {};
  state.careLendarEvents.forEach(ev => {
    const d = ev.event_date; // "YYYY-MM-DD"
    if (!eventsByDate[d]) eventsByDate[d] = [];
    eventsByDate[d].push(ev);
  });

  // Calendar cells
  let calendarCells = '';
  // Empty cells before first day
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells += `<div class="cal-cell empty"></div>`;
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr  = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dayDate  = new Date(year, month, d);
    const isToday  = dayDate.getTime() === today.getTime();
    const evList   = eventsByDate[dateStr] || [];
    const hasDraft = evList.some(e => e.suggested_box_draft);
    const dots     = evList.map(ev => {
      const color = hasDraft ? '#8FAD88' : '#e67e22';
      return `<span class="cal-dot" style="background:${color};" title="${ev.title}"></span>`;
    }).join('');

    calendarCells += `
      <div class="cal-cell ${isToday ? 'today' : ''} ${evList.length > 0 ? 'has-event' : ''}"
           data-date="${dateStr}" ${evList.length > 0 ? 'style="cursor:pointer;"' : ''}>
        <span class="cal-day-num">${d}</span>
        ${dots ? `<div class="cal-dots">${dots}</div>` : ''}
      </div>`;
  }

  // ─── Relationship Graph Nodes ───────────────────────────────────────────────
  let relationshipHtml = '';
  if (state.relationshipGraph.length === 0) {
    relationshipHtml = `
      <div style="padding:2rem; text-align:center; color:var(--color-text-light); font-size:0.9rem;">
        <i class="fa-solid fa-user-group" style="font-size:2rem; opacity:0.3; display:block; margin-bottom:0.75rem;"></i>
        Chưa có người nhận nào trong mạng lưới của bạn.
      </div>
    `;
  } else {
    const relTypeLabel = { friends:'Bạn bè', lovers:'Người thương', family:'Gia đình', colleagues:'Đồng nghiệp', clients:'Khách hàng', partners:'Đối tác' };
    const relTypeColor = { friends:'#3498db', lovers:'#e74c3c', family:'#8FAD88', colleagues:'#9b59b6', clients:'#e67e22', partners:'#16a085' };

    state.relationshipGraph.forEach(rc => {
      const interestsHtml  = (rc.interests || []).map(t => `<span class="interest-tag">${t.toUpperCase()}</span>`).join('');
      const lastGift       = rc.gift_history && rc.gift_history.length > 0 ? rc.gift_history[rc.gift_history.length - 1] : 'Chưa tặng';
      const rcColor        = relTypeColor[rc.relationship_type] || '#8FAD88';
      const rcLabel        = relTypeLabel[rc.relationship_type] || rc.relationship_type;
      const initials       = rc.name.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase().slice(0, 2);
      const eventCount     = state.careLendarEvents.filter(e => e.recipient_id === rc.id).length;

      relationshipHtml += `
        <div class="recipient-node-card">
          <div class="recipient-avatar-circle" style="background:${rcColor}20; border:2px solid ${rcColor}40; color:${rcColor}; font-weight:700; font-size:1rem; width:44px; height:44px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            ${initials}
          </div>
          <div class="recipient-info">
            <div class="recipient-name-row">
              <strong>${rc.name}</strong>
              <span class="relationship-badge" style="background:${rcColor}18; color:${rcColor}; border:1px solid ${rcColor}30; font-size:0.65rem; padding:0.2rem 0.55rem; border-radius:999px; font-weight:600; text-transform:uppercase;">${rcLabel}</span>
            </div>
            <div class="recipient-meta-row">
              <span class="recipient-meta-item co2"><i class="fa-solid fa-leaf"></i> ${(rc.total_co2_saved || 0).toFixed(1)} kg CO₂</span>
              <span class="recipient-meta-item"><i class="fa-regular fa-calendar"></i> ${eventCount} sự kiện</span>
            </div>
            <div class="recipient-meta-row" style="margin-top:0.25rem;">
              <span class="recipient-meta-item" style="font-size:0.72rem; color:var(--color-text-light);"><i class="fa-solid fa-gift"></i> ${lastGift}</span>
            </div>
            <div class="interests-tag-row" style="margin-top:0.4rem;">${interestsHtml}</div>
          </div>
          <div class="recipient-actions">
            <button class="icon-btn delete-recipient-btn" data-recipient-id="${rc.id}" style="color:var(--color-danger); font-size:0.9rem;" title="Xóa mối quan hệ">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;
    });
  }

  // ─── Timeline Events List ───────────────────────────────────────────────────
  let eventsHtml = '';
  if (state.careLendarEvents.length === 0) {
    eventsHtml = `
      <div style="padding:2rem; text-align:center; color:var(--color-text-light); font-size:0.9rem;">
        <i class="fa-regular fa-calendar-xmark" style="font-size:2rem; opacity:0.3; display:block; margin-bottom:0.75rem;"></i>
        Chưa có sự kiện nào được ghi nhận.
      </div>
    `;
  } else {
    const eventTypeIcon = { birthday:'🎂', anniversary:'💕', tet:'🏮', christmas:'🎄', valentine:'💝', thanks:'🙏', sorry:'🌸', corporate:'🏢' };
    const sortedEvents  = [...state.careLendarEvents].sort((a,b) => new Date(a.event_date) - new Date(b.event_date));

    sortedEvents.forEach(ev => {
      const evDate    = new Date(ev.event_date);
      const day       = evDate.getDate();
      const monthNum  = `Thg ${evDate.getMonth() + 1}`;
      const rcName    = ev.recipient ? ev.recipient.name : 'Người nhận không rõ';

      const evDateNorm = new Date(ev.event_date); evDateNorm.setHours(0,0,0,0);
      const todayNorm  = new Date(); todayNorm.setHours(0,0,0,0);
      const diffDays   = Math.ceil((evDateNorm - todayNorm) / (1000 * 60 * 60 * 24));

      const icon = eventTypeIcon[ev.event_type] || '📅';

      let statusBadge = '';
      if (diffDays < 0)       statusBadge = `<span class="timeline-event-status-badge past">Đã diễn ra</span>`;
      else if (diffDays === 0) statusBadge = `<span class="timeline-event-status-badge today-badge">🔴 Hôm nay!</span>`;
      else if (diffDays <= 7)  statusBadge = `<span class="timeline-event-status-badge urgent">⚡ Còn ${diffDays} ngày</span>`;
      else if (diffDays <= 14) statusBadge = `<span class="timeline-event-status-badge soon">Còn ${diffDays} ngày</span>`;
      else                     statusBadge = `<span class="timeline-event-status-badge">Còn ${diffDays} ngày</span>`;

      let ctaHtml = '';
      if (ev.suggested_box_draft) {
        ctaHtml = `<button class="btn btn-primary btn-outline view-suggested-box-btn" data-event-id="${ev.id}" style="padding:0.3rem 0.7rem; font-size:0.72rem; display:flex; align-items:center; gap:0.3rem; border-radius:6px;">
          <i class="fa-solid fa-brain"></i> Xem hộp quà AI
        </button>`;
      } else if (diffDays > 0 && diffDays <= 14) {
        ctaHtml = `<span style="font-size:0.68rem; color:var(--color-text-light); font-style:italic; display:flex; align-items:center; gap:0.3rem;"><i class="fa-solid fa-spinner fa-spin"></i> Đang tạo gợi ý...</span>`;
      }

      eventsHtml += `
        <div class="timeline-event-card ${ev.suggested_box_draft ? 'has-draft' : ''}">
          <div class="timeline-date-badge">
            <span class="timeline-date-day">${day}</span>
            <span class="timeline-date-month">${monthNum}</span>
          </div>
          <div class="timeline-event-info">
            <div class="timeline-event-title">${icon} ${ev.title}</div>
            <div class="timeline-event-recipient"><i class="fa-solid fa-circle-user"></i> <strong>${rcName}</strong></div>
            ${statusBadge}
          </div>
          <div class="timeline-event-actions">
            ${ctaHtml}
            <button class="icon-btn delete-event-btn" data-event-id="${ev.id}" style="color:var(--color-danger); font-size:0.8rem; padding:0.2rem;" title="Xóa sự kiện">
              <i class="fa-solid fa-calendar-minus"></i>
            </button>
          </div>
        </div>
      `;
    });
  }

  // ─── Set View HTML ─────────────────────────────────────────────────────────
  view.innerHTML = `
    <div class="section-title-container">
      <h2><i class="fa-solid fa-calendar-heart" style="color:var(--color-accent);margin-right:0.5rem;"></i>Care-lendar &amp; Relationship Graph</h2>
      <p class="section-subtitle">Lập lịch trình sự kiện, lưu giữ mạng lưới yêu thương và nhận gợi ý quà thông minh từ AI</p>
    </div>

    <!-- Sweep Simulation Banner -->
    <div class="sweep-banner">
      <div>
        <h4><i class="fa-solid fa-wand-magic-sparkles"></i> Predictive Engine (Simulation)</h4>
        <p>Chạy quét để giả lập tác vụ cron hàng ngày. Hệ thống sẽ phát hiện các sự kiện diễn ra sau đúng 14 ngày (t-14) và tự động thiết kế hộp quà bằng AI.</p>
      </div>
      <button class="btn btn-primary" id="simulation-cron-sweep-btn">
        <i class="fa-solid fa-network-wired"></i> Chạy Sweep Cron (t-14)
      </button>
    </div>

    <div class="care-lendar-main-grid">
      <!-- LEFT COLUMN -->
      <div class="care-lendar-left-col">

        <!-- Month Calendar Grid -->
        <div class="care-lendar-section-card">
          <div class="care-lendar-header-row">
            <h3><i class="fa-regular fa-calendar"></i> Lịch tháng</h3>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <button class="cal-nav-btn" id="cal-prev-btn"><i class="fa-solid fa-chevron-left"></i></button>
              <span style="font-size:0.9rem; font-weight:600; color:var(--color-text);">${monthNames[month]} ${year}</span>
              <button class="cal-nav-btn" id="cal-next-btn"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
          </div>

          <div class="month-calendar">
            <div class="cal-header-row">
              ${dayNames.map(d => `<div class="cal-header-cell">${d}</div>`).join('')}
            </div>
            <div class="cal-grid">
              ${calendarCells}
            </div>
          </div>

          <div class="cal-legend">
            <span><span class="cal-dot" style="background:#8FAD88; display:inline-block; margin-right:4px;"></span> Đã có gợi ý AI</span>
            <span><span class="cal-dot" style="background:#e67e22; display:inline-block; margin-right:4px;"></span> Sự kiện sắp tới</span>
          </div>
        </div>

        <!-- Relationship Graph -->
        <div class="care-lendar-section-card">
          <div class="care-lendar-header-row">
            <h3><i class="fa-solid fa-network-wired"></i> Mạng lưới mối quan hệ</h3>
            <span style="font-size:0.8rem; font-weight:600; color:var(--color-text-light);">${state.relationshipGraph.length} người</span>
          </div>
          <div class="recipients-list-container">
            ${relationshipHtml}
          </div>
        </div>

        <!-- Add Recipient Form -->
        <div class="care-lendar-form-container">
          <div class="care-lendar-form-title"><i class="fa-solid fa-user-plus"></i> Thêm người nhận mới</div>
          <form id="add-recipient-form">
            <div class="care-lendar-form-group">
              <label>Họ và tên *</label>
              <input type="text" id="rc-form-name" placeholder="Ví dụ: Chị Lan, Bạn Minh..." required>
            </div>
            <div class="care-lendar-form-group">
              <label>Mối quan hệ *</label>
              <select id="rc-form-rel" required>
                <option value="friends">Bạn bè thân thiết</option>
                <option value="lovers">Người thương</option>
                <option value="family" selected>Gia đình</option>
                <option value="colleagues">Đồng nghiệp</option>
                <option value="clients">Khách hàng</option>
                <option value="partners">Đối tác B2B</option>
              </select>
            </div>
            <div class="care-lendar-form-group">
              <label>Sở thích (tags, phân cách bằng dấu phẩy)</label>
              <input type="text" id="rc-form-interests" placeholder="eco, minimal, vintage, handmade...">
            </div>
            <div class="care-lendar-form-group">
              <label>Phong cách ưa thích</label>
              <select id="rc-form-style">
                <option value="eco">Eco – Tự nhiên</option>
                <option value="minimal">Minimal – Tối giản</option>
                <option value="vintage">Vintage – Mộc mạc xưa</option>
                <option value="luxury">Luxury – Sang trọng</option>
                <option value="cute">Cute – Đáng yêu</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary btn-block" style="margin-top:0.5rem; background-color:var(--color-accent); color:white;">
              <i class="fa-solid fa-circle-check"></i> Lưu vào Graph
            </button>
          </form>
        </div>
      </div>

      <!-- RIGHT COLUMN -->
      <div class="care-lendar-right-col">

        <!-- Event Timeline -->
        <div class="care-lendar-section-card">
          <div class="care-lendar-header-row">
            <h3><i class="fa-solid fa-timeline"></i> Lịch trình sự kiện</h3>
            <span style="font-size:0.8rem; font-weight:600; color:var(--color-text-light);">${state.careLendarEvents.length} sự kiện</span>
          </div>
          <div class="events-timeline-container">
            ${eventsHtml}
          </div>
        </div>

        <!-- Add Event Form -->
        <div class="care-lendar-form-container">
          <div class="care-lendar-form-title"><i class="fa-solid fa-calendar-plus"></i> Thêm ngày kỷ niệm / sự kiện</div>
          <form id="add-event-form">
            <div class="care-lendar-form-group">
              <label>Chọn người nhận *</label>
              <select id="ev-form-rc" required>
                <option value="">-- Chọn trong Graph --</option>
                ${state.relationshipGraph.map(rc => `<option value="${rc.id}">${rc.name} (${rc.relationship_type})</option>`).join('')}
              </select>
            </div>
            <div class="care-lendar-form-group">
              <label>Tiêu đề sự kiện *</label>
              <input type="text" id="ev-form-title" placeholder="Ví dụ: Sinh nhật lần thứ 50 của Mẹ..." required>
            </div>
            <div class="care-lendar-form-group">
              <label>Dịp sự kiện *</label>
              <select id="ev-form-type" required>
                <option value="birthday">🎂 Sinh nhật</option>
                <option value="anniversary">💕 Kỷ niệm</option>
                <option value="tet">🏮 Tết cổ truyền</option>
                <option value="christmas">🎄 Giáng sinh</option>
                <option value="valentine">💝 Lễ Tình nhân</option>
                <option value="thanks">🙏 Lời cảm ơn / Tri ân</option>
              </select>
            </div>
            <div class="care-lendar-form-group">
              <label>Ngày diễn ra sự kiện *</label>
              <input type="date" id="ev-form-date" required>
            </div>
            <div class="care-lendar-form-group" style="display:flex; align-items:center; gap:0.5rem; padding: 0.3rem 0;">
              <input type="checkbox" id="ev-form-recur" style="width:auto; accent-color:var(--color-accent);">
              <label for="ev-form-recur" style="margin-bottom:0; font-size:0.85rem; cursor:pointer;">Tự động lặp lại hàng năm</label>
            </div>
            <button type="submit" class="btn btn-primary btn-block" style="margin-top:0.5rem; background-color:var(--color-accent); color:white;">
              <i class="fa-solid fa-calendar-check"></i> Lưu sự kiện
            </button>
          </form>
        </div>

        <!-- AI Insight Panel (visible when event has draft) -->
        <div class="care-lendar-section-card" id="cl-ai-insight-panel" style="display:none;">
          <div class="care-lendar-header-row">
            <h3><i class="fa-solid fa-brain" style="color:var(--color-accent);"></i> AI Insight của Sự kiện</h3>
          </div>
          <div id="cl-ai-insight-body" style="padding:1rem; font-size:0.88rem; line-height:1.65; color:var(--color-text-light);"></div>
          <div id="cl-ai-cta-row" style="padding:0 1rem 1rem; display:flex; gap:0.75rem; flex-wrap:wrap;"></div>
        </div>
      </div>
    </div>
  `;

  // ─── Bind: Calendar Navigation ─────────────────────────────────────────────
  document.getElementById('cal-prev-btn')?.addEventListener('click', () => {
    const d = state._calendarDate ? new Date(state._calendarDate) : new Date();
    d.setMonth(d.getMonth() - 1);
    state._calendarDate = d.toISOString();
    renderCareLendar();
  });
  document.getElementById('cal-next-btn')?.addEventListener('click', () => {
    const d = state._calendarDate ? new Date(state._calendarDate) : new Date();
    d.setMonth(d.getMonth() + 1);
    state._calendarDate = d.toISOString();
    renderCareLendar();
  });

  // ─── Bind: Calendar Cell Click (show events for that day) ──────────────────
  view.querySelectorAll('.cal-cell.has-event').forEach(cell => {
    cell.addEventListener('click', () => {
      const dateStr = cell.dataset.date;
      const dayEvents = state.careLendarEvents.filter(e => e.event_date === dateStr);
      if (dayEvents.length === 0) return;

      // Show AI insight panel for the first event with a draft
      const evWithDraft = dayEvents.find(e => e.suggested_box_draft);
      const targetEv    = evWithDraft || dayEvents[0];
      showEventInsightPanel(targetEv);
    });
  });

  // ─── Bind: View Suggested Box buttons ──────────────────────────────────────
  view.querySelectorAll('.view-suggested-box-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const evId = parseInt(btn.dataset.eventId);
      const ev   = state.careLendarEvents.find(e => e.id === evId);
      if (ev && ev.suggested_box_draft) {
        showEventInsightPanel(ev);
      }
    });
  });

  // ─── Bind: Sweep Cron Button ───────────────────────────────────────────────
  document.getElementById('simulation-cron-sweep-btn')?.addEventListener('click', async () => {
    const btn = document.getElementById('simulation-cron-sweep-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang quét...';
    try {
      const res  = await fetch('/api/cron/sweep', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ userId: state.user.email })
      });
      const data = await res.json();
      await loadCareLendarData();
      renderCareLendar();
      if (data.triggeredCount > 0) {
        showToast(`✅ Phát hiện ${data.triggeredCount} sự kiện! Đã tạo gợi ý AI và gửi thông báo.`);
      } else {
        showToast('Quét hoàn tất. Chưa có sự kiện nào ở đúng mốc t-14 ngày hoặc đã được xử lý trước đó.');
      }
    } catch (err) {
      console.error('Sweep trigger failed:', err);
      showToast('Chạy quét thất bại. Vui lòng kiểm tra kết nối server.');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-network-wired"></i> Chạy Sweep Cron (t-14)';
    }
  });

  // ─── Bind: Add Recipient Form ──────────────────────────────────────────────
  document.getElementById('add-recipient-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name            = document.getElementById('rc-form-name').value.trim();
    const relationshipType = document.getElementById('rc-form-rel').value;
    const stylePreference  = document.getElementById('rc-form-style').value;
    const rawTags          = document.getElementById('rc-form-interests').value.trim();
    const interests        = rawTags ? rawTags.split(',').map(x => x.trim().toLowerCase()).filter(Boolean) : [];

    try {
      const res = await fetch('/api/recipients', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ userId: state.user.email, name, relationshipType, interests, stylePreference })
      });
      if (res.ok) {
        showToast('Đã lưu người nhận mới vào mạng lưới mối quan hệ!');
        await loadCareLendarData();
        renderCareLendar();
      }
    } catch (err) {
      console.error('Failed to add recipient:', err);
      showToast('Lỗi thêm người nhận. Vui lòng kiểm tra kết nối server.');
    }
  });

  // ─── Bind: Add Event Form ──────────────────────────────────────────────────
  document.getElementById('add-event-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const recipientId = document.getElementById('ev-form-rc').value;
    const title       = document.getElementById('ev-form-title').value.trim();
    const eventType   = document.getElementById('ev-form-type').value;
    const eventDate   = document.getElementById('ev-form-date').value;
    const recurs      = document.getElementById('ev-form-recur').checked;

    if (!recipientId) { showToast('Vui lòng chọn người nhận!'); return; }

    try {
      const res = await fetch('/api/care-lendar/events', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ userId: state.user.email, recipientId, title, eventType, eventDate, recurse: recurs })
      });
      if (res.ok) {
        showToast('Đã lên lịch sự kiện thành công!');
        // Navigate calendar to the month of the new event
        state._calendarDate = new Date(eventDate).toISOString();
        await loadCareLendarData();
        renderCareLendar();
      }
    } catch (err) {
      console.error('Failed to add event:', err);
      showToast('Lỗi thêm sự kiện.');
    }
  });

  // ─── Bind: Delete Recipient ────────────────────────────────────────────────
  view.querySelectorAll('.delete-recipient-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Bạn có chắc chắn muốn xóa người nhận này khỏi mạng lưới? Tất cả sự kiện liên quan cũng sẽ bị xóa.')) return;
      const rcId = btn.dataset.recipientId;
      try {
        const res = await fetch(`/api/recipients/${rcId}?userId=${state.user.email}`, { method: 'DELETE' });
        if (res.ok) {
          showToast('Đã xóa người nhận!');
          await loadCareLendarData();
          renderCareLendar();
        }
      } catch (err) { console.error('Delete recipient failed:', err); }
    });
  });

  // ─── Bind: Delete Event ────────────────────────────────────────────────────
  view.querySelectorAll('.delete-event-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) return;
      const evId = btn.dataset.eventId;
      try {
        const res = await fetch(`/api/care-lendar/events/${evId}?userId=${state.user.email}`, { method: 'DELETE' });
        if (res.ok) {
          showToast('Đã xóa sự kiện!');
          await loadCareLendarData();
          renderCareLendar();
        }
      } catch (err) { console.error('Delete event failed:', err); }
    });
  });
}

// Helper: show event AI insight + CTA panel
function showEventInsightPanel(ev) {
  const panel      = document.getElementById('cl-ai-insight-panel');
  const bodyEl     = document.getElementById('cl-ai-insight-body');
  const ctaRow     = document.getElementById('cl-ai-cta-row');
  if (!panel || !bodyEl || !ctaRow) return;

  const draft  = ev.suggested_box_draft;
  const rcName = ev.recipient ? ev.recipient.name : 'Người nhận';

  panel.style.display = 'block';
  bodyEl.innerHTML = draft
    ? `<div style="font-style:italic; border-left:3px solid var(--color-accent); padding-left:0.75rem; margin-bottom:0.75rem;">"${draft.insight || ''}"</div>
       <div style="font-size:0.78rem; color:var(--color-text-light); margin-bottom:0.25rem;">AI đề xuất ${draft.productIds ? draft.productIds.length : 0} sản phẩm cho hộp quà của <strong>${rcName}</strong>.</div>
       ${draft.simulation ? '<div style="font-size:0.72rem; color:var(--color-text-light); opacity:0.8;"><i class="fa-solid fa-flask-vial"></i> Được tạo bởi Mock Engine (chưa có OpenAI API Key)</div>' : '<div style="font-size:0.72rem; color:var(--color-accent);"><i class="fa-solid fa-robot"></i> Được thiết kế bởi GPT-4o</div>'}`
    : `<div>Sự kiện này chưa có bản thiết kế hộp quà AI. Hãy chạy Sweep Cron để tạo gợi ý.</div>`;

  ctaRow.innerHTML = draft ? `
    <button class="btn btn-primary" onclick="
      state.aiAssist.results = state.careLendarEvents.find(e=>e.id===${ev.id})?.suggested_box_draft;
      state.aiAssist.isOpen = true;
      document.getElementById('ai-assist-drawer')?.classList.add('active');
      renderAiAssist();
    " style="font-size:0.82rem; padding:0.4rem 0.9rem;">
      <i class="fa-solid fa-eye"></i> Duyệt ngay &amp; Xem Preview
    </button>
    <button class="btn btn-primary btn-outline" onclick="
      state.aiAssist.results = state.careLendarEvents.find(e=>e.id===${ev.id})?.suggested_box_draft;
      state.aiAssist.isOpen = true;
      state.aiAssist.step = 1;
      document.getElementById('ai-assist-drawer')?.classList.add('active');
      renderAiAssist();
    " style="font-size:0.82rem; padding:0.4rem 0.9rem;">
      <i class="fa-solid fa-pen-to-square"></i> Tùy chỉnh chuyên sâu
    </button>
  ` : '';

  // Scroll panel into view
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

