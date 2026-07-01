export const ONBOARDING_QUESTIONS = [
  {
    id: 1,
    question: "Bạn thường mua quà cho ai?",
    type: "checkbox",
    options: [
      { value: "friends", label: "Bạn bè" },
      { value: "lovers", label: "Người yêu" },
      { value: "family", label: "Gia đình" },
      { value: "colleagues", label: "Đồng nghiệp" },
      { value: "clients", label: "Khách hàng" },
      { value: "partners", label: "Đối tác doanh nghiệp" }
    ]
  },
  {
    id: 2,
    question: "Bạn quan tâm điều gì nhất khi chọn quà?",
    type: "checkbox",
    options: [
      { value: "design", label: "Thiết kế đẹp" },
      { value: "meaning", label: "Ý nghĩa" },
      { value: "customization", label: "Cá nhân hóa" },
      { value: "eco", label: "Thân thiện môi trường" },
      { value: "price", label: "Giá cả" },
      { value: "fast_shipping", label: "Giao nhanh" }
    ]
  },
  {
    id: 3,
    question: "Ngân sách thường sử dụng cho một hộp quà?",
    type: "radio",
    options: [
      { value: "under_300", label: "Dưới 300.000đ" },
      { value: "300_500", label: "Từ 300.000đ – 500.000đ" },
      { value: "500_1000", label: "Từ 500.000đ – 1.000.000đ" },
      { value: "over_1000", label: "Trên 1.000.000đ" }
    ]
  },
  {
    id: 4,
    question: "Những dịp bạn thường mua quà?",
    type: "checkbox",
    options: [
      { value: "birthday", label: "Sinh nhật" },
      { value: "christmas", label: "Noel" },
      { value: "valentine", label: "Valentine" },
      { value: "tet", label: "Tết" },
      { value: "anniversary", label: "Kỷ niệm" },
      { value: "thanks", label: "Cảm ơn" },
      { value: "sorry", label: "Xin lỗi" },
      { value: "corporate", label: "Corporate Gift" }
    ]
  },
  {
    id: 5,
    question: "Bạn thích phong cách nào?",
    type: "radio",
    options: [
      { value: "minimal", label: "Minimal (Tối giản)" },
      { value: "vintage", label: "Vintage (Cổ điển)" },
      { value: "luxury", label: "Luxury (Sang trọng)" },
      { value: "eco", label: "Eco (Mộc mạc)" },
      { value: "cute", label: "Cute (Đáng yêu)" },
      { value: "modern", label: "Modern (Hiện đại)" }
    ]
  }
];

export const PRODUCTS = [
  {
    id: "prod-candle",
    name: "Nến thơm sáp đậu nành Organic",
    category: "handicraft",
    price: 150000,
    image: "./images/candle.png",
    tags: ["eco", "minimal", "lovers", "family", "birthday", "valentine", "anniversary", "thanks"],
    description: "Nến thơm thảo mộc tự nhiên từ sáp đậu nành lành tính, không khói độc, mang hương thơm thư thái của tinh dầu cam ngọt và oải hương.",
    dpp: {
      recycledContent: 85,
      recyclabilityRate: 100,
      reusablePackaging: 90,
      renewableMaterial: 95,
      virginPlasticReduction: 120, // grams
      carbonFootprintAvoided: 1.2, // kg CO2e
      origin: "Đà Lạt, Lâm Đồng, Việt Nam",
      material: "Sáp đậu nành tự nhiên, tinh dầu nguyên chất, hũ thủy tinh tái chế",
      packaging: "Hộp giấy tái chế FSC, nhãn in mực đậu nành",
      certifications: ["USDA Organic", "FSC Certified", "Cruelty-Free"]
    }
  },
  {
    id: "prod-tea",
    name: "Trà hoa thảo mộc Hoàng Cúc",
    category: "handicraft",
    price: 120000,
    image: "./images/tea.png",
    tags: ["eco", "vintage", "family", "clients", "partners", "thanks", "tet"],
    description: "Trà hoa cúc nguyên bông thu hoạch thủ công tại thung lũng sương mù, giúp an thần, ngủ ngon và thanh nhiệt cơ thể.",
    dpp: {
      recycledContent: 90,
      recyclabilityRate: 100,
      reusablePackaging: 80,
      renewableMaterial: 100,
      virginPlasticReduction: 80,
      carbonFootprintAvoided: 0.8,
      origin: "Nghĩa Trai, Hưng Yên, Việt Nam",
      material: "100% Hoa cúc tiến vua sấy lạnh giữ nguyên màu và chất",
      packaging: "Lọ thủy tinh nắp gỗ bần, dây gai đay buộc cổ chai",
      certifications: ["VietGAP", "Organic JAS"]
    }
  },
  {
    id: "prod-cup",
    name: "Ly tre tự nhiên khắc tên theo yêu cầu",
    category: "handicraft",
    price: 95000,
    image: "./images/bamboo_cup.png",
    tags: ["customization", "minimal", "friends", "colleagues", "birthday", "thanks", "sorry"],
    description: "Sản phẩm thủ công từ thân tre tự nhiên, qua xử lý sấy cát không hóa chất độc hại, phủ sáp ong bảo vệ bề mặt chống thấm nước.",
    dpp: {
      recycledContent: 0, // Natural bamboo is raw
      recyclabilityRate: 100,
      reusablePackaging: 100,
      renewableMaterial: 100,
      virginPlasticReduction: 250,
      carbonFootprintAvoided: 2.1,
      origin: "Thanh Hóa, Việt Nam",
      material: "Tre già tự nhiên vùng trung du Bắc Bộ",
      packaging: "Túi vải cotton dây rút tái sử dụng",
      certifications: ["SGS Non-toxic", "FSC Certified"]
    }
  },
  {
    id: "prod-soap",
    name: "Xà bông thảo dược Mướp Đắng Mật Ong",
    category: "handicraft",
    price: 75000,
    image: "./images/herbal_soap.png",
    tags: ["eco", "cute", "friends", "lovers", "family", "birthday", "thanks", "sorry"],
    description: "Xà bông sinh dược làm sạch dịu nhẹ từ dịch ép mướp đắng rừng kết hợp mật ong hoa bạc hà vùng cao nguyên đá.",
    dpp: {
      recycledContent: 95,
      recyclabilityRate: 100,
      reusablePackaging: 50,
      renewableMaterial: 100,
      virginPlasticReduction: 90,
      carbonFootprintAvoided: 0.6,
      origin: "Gia Viễn, Ninh Bình, Việt Nam",
      material: "Phôi xà bông dầu dừa, dầu cọ, mật ong rừng, dịch chiết mướp đắng",
      packaging: "Bọc giấy kraft xi măng thô mộc mạc",
      certifications: ["OCOP 4-Star", "GMP Standard"]
    }
  },
  {
    id: "prod-notebook",
    name: "Sổ tay giấy tái chế Kraft Bìa Cứng",
    category: "handicraft",
    price: 80000,
    image: "./images/kraft_notebook.png",
    tags: ["customization", "minimal", "friends", "colleagues", "clients", "partners", "birthday", "thanks", "corporate"],
    description: "Sổ tay ghi chép cầm tay tiện dụng, chất liệu giấy tái chế không tẩy trắng, chống lóa mắt khi viết dưới ánh sáng mạnh.",
    dpp: {
      recycledContent: 100,
      recyclabilityRate: 100,
      reusablePackaging: 95,
      renewableMaterial: 100,
      virginPlasticReduction: 150,
      carbonFootprintAvoided: 1.5,
      origin: "Bình Dương, Việt Nam",
      material: "Giấy vụn văn phòng tái chế ép nhiệt",
      packaging: "Màng bọc giấy tổ ong tự phân hủy sinh học",
      certifications: ["FSC Recycled", "ISO 14001"]
    }
  },
  {
    id: "prod-honey",
    name: "Mật ong rừng nguyên chất hoa nhãn",
    category: "handicraft",
    price: 110000,
    image: "./images/honey.png",
    tags: ["eco", "family", "clients", "partners", "thanks", "tet", "corporate"],
    description: "Mật ong đặc quánh, màu vàng hổ phách tự nhiên, thu hoạch từ các tổ ong rừng sâu trong thung lũng mùa hoa nhãn nở rộ.",
    dpp: {
      recycledContent: 75,
      recyclabilityRate: 100,
      reusablePackaging: 90,
      renewableMaterial: 100,
      virginPlasticReduction: 110,
      carbonFootprintAvoided: 1.1,
      origin: "Lục Ngạn, Bắc Giang, Việt Nam",
      material: "100% Mật ong thiên nhiên nguyên chất",
      packaging: "Hũ thủy tinh lục giác dày dặn, nút bần cao cấp",
      certifications: ["VietGAP Organic", "HACCP Certified"]
    }
  },
  {
    id: "prod-tote",
    name: "Túi vải Canvas nhuộm chàm tự nhiên",
    category: "fashion",
    price: 180000,
    image: "./images/indigo_canvas_tote.png",
    tags: ["eco", "minimal", "friends", "birthday", "thanks"],
    description: "Túi canvas bền bỉ nhuộm chàm thủ công từ lá cây chàm tự nhiên vùng cao.",
    dpp: {
      recycledContent: 50,
      recyclabilityRate: 100,
      reusablePackaging: 100,
      renewableMaterial: 100,
      virginPlasticReduction: 300,
      carbonFootprintAvoided: 2.5,
      origin: "Tả Phìn, Sa Pa, Việt Nam",
      material: "Sợi bông tự nhiên nhuộm chàm organic",
      packaging: "Màng bọc xenlulo tự phân hủy sinh học",
      certifications: ["Fair Trade", "OEKO-TEX Standard 100"]
    }
  },
  {
    id: "prod-scarf",
    name: "Khăn lụa tơ tằm Bảo Lộc vẽ tay",
    category: "fashion",
    price: 320000,
    image: "./images/silk_painted_scarf.png",
    tags: ["luxury", "lovers", "family", "anniversary", "thanks"],
    description: "Khăn lụa 100% tơ tằm tự nhiên Bảo Lộc vẽ tay họa tiết cỏ cây mộc mạc.",
    dpp: {
      recycledContent: 0,
      recyclabilityRate: 100,
      reusablePackaging: 95,
      renewableMaterial: 100,
      virginPlasticReduction: 120,
      carbonFootprintAvoided: 1.8,
      origin: "Bảo Lộc, Lâm Đồng, Việt Nam",
      material: "100% Lụa tơ tằm tự nhiên vẽ màu organic",
      packaging: "Hộp giấy tái chế thô mộc mạc",
      certifications: ["Vietnam Silk", "Organic Craft"]
    }
  },
  {
    id: "prod-tray",
    name: "Khay gỗ dừa khảm xà cừ nghệ thuật",
    category: "handicraft",
    price: 220000,
    image: "./images/coconut_inlaid_tray.png",
    tags: ["vintage", "family", "clients", "partners", "thanks", "tet"],
    description: "Khay làm từ thân cây dừa già khảm họa tiết xà cừ óng ánh từ vỏ sò tự nhiên.",
    dpp: {
      recycledContent: 100,
      recyclabilityRate: 100,
      reusablePackaging: 90,
      renewableMaterial: 100,
      virginPlasticReduction: 500,
      carbonFootprintAvoided: 4.2,
      origin: "Mỏ Cày, Bến Tre, Việt Nam",
      material: "Gỗ dừa lâu năm, vỏ xà cừ tự nhiên, sơn bóng an toàn",
      packaging: "Màng bọc giấy tổ ong tự phân hủy",
      certifications: ["Handicraft Quality", "Vietnamese Traditional Heritage"]
    }
  },
  {
    id: "prod-tea-set",
    name: "Bộ ấm chén gốm mộc nung Bát Tràng",
    category: "handicraft",
    price: 450000,
    image: "./images/ceramic_tea_set.png",
    tags: ["vintage", "luxury", "family", "partners", "thanks", "tet"],
    description: "Bộ ấm chén gốm mộc mạc nung nhiệt độ cao từ đất sét Bát Tràng truyền thống.",
    dpp: {
      recycledContent: 100,
      recyclabilityRate: 100,
      reusablePackaging: 90,
      renewableMaterial: 100,
      virginPlasticReduction: 800,
      carbonFootprintAvoided: 6.8,
      origin: "Bát Tràng, Gia Lâm, Hà Nội, Việt Nam",
      material: "Đất sét tự nhiên nung lò gas nhiệt độ cao",
      packaging: "Hộp giấy tái chế có vách ngăn carton bảo vệ chống sốc",
      certifications: ["Bát Tràng Authentic", "Non-Toxic Lead Free"]
    }
  },
  {
    id: "prod-bamboo-notebook",
    name: "Sổ tay bìa tre ép tự nhiên cao cấp",
    category: "stationery",
    price: 150000,
    image: "./images/bamboo_notebook.png",
    tags: ["customization", "minimal", "friends", "colleagues", "corporate"],
    description: "Sổ tay cao cấp với bìa tre ép tự nhiên độc bản, ruột giấy kraft tái chế chống lóa.",
    dpp: {
      recycledContent: 85,
      recyclabilityRate: 100,
      reusablePackaging: 95,
      renewableMaterial: 100,
      virginPlasticReduction: 200,
      carbonFootprintAvoided: 2.1,
      origin: "Thanh Hóa, Việt Nam",
      material: "Tre ép tự nhiên, giấy vụn văn phòng tái chế",
      packaging: "Màng bọc xenlulo tự phân hủy sinh học",
      certifications: ["FSC Recycled", "SGS Certified"]
    }
  },
  {
    id: "prod-bookmark",
    name: "Bộ kẹp giấy & Bookmark đồng cổ điển",
    category: "stationery",
    price: 90000,
    image: "./images/bronze_bookmark_set.png",
    tags: ["minimal", "friends", "colleagues", "birthday", "thanks"],
    description: "Bookmark mạ đồng cổ điển hình hoa lá tinh xảo giúp lưu giữ trang sách yêu thích.",
    dpp: {
      recycledContent: 90,
      recyclabilityRate: 100,
      reusablePackaging: 100,
      renewableMaterial: 90,
      virginPlasticReduction: 50,
      carbonFootprintAvoided: 0.5,
      origin: "Làng nghề gò đồng Đại Bái, Bắc Ninh, Việt Nam",
      material: "Đồng tái chế mạ đồng cổ màu giả cổ",
      packaging: "Thẻ giấy kraft xi măng bảo vệ",
      certifications: ["Traditional Craft Certification"]
    }
  }
];

export const BOX_MATERIALS = [
  { id: "box-kraft", name: "Hộp Giấy Kraft tái chế FSC", price: 30000, description: "Bền bỉ, mộc mạc và có khả năng tự phân hủy hoàn toàn trong đất.", co2: 0.1, recycled: 100 },
  { id: "box-bamboo", name: "Hộp Tre Đan Thủ Công", price: 65000, description: "Sang trọng, bền vững, được đan tay bởi nghệ nhân làng nghề truyền thống.", co2: 0.4, recycled: 0 }
];

export const BOX_SIZES = [
  { id: "size-s", name: "Hộp Nhỏ (đựng 2-3 món)", price: 0, maxItems: 3 },
  { id: "size-m", name: "Hộp Vừa (đựng 4-5 món)", price: 10000, maxItems: 5 },
  { id: "size-l", name: "Hộp Lớn (đựng 6-8 món)", price: 20000, maxItems: 8 }
];

export const RIBBON_TYPES = [
  { id: "rib-jute", name: "Sợi đay mộc mạc tự nhiên", price: 5000, color: "#bda58d" },
  { id: "rib-cotton", name: "Dây cotton nhuộm màu tự nhiên", price: 8000, color: "#8fad88" }
];

export const GIFT_BOX_CATEGORIES = [
  {
    id: "seasonal",
    name: "Seasonal Gift Box",
    nameVi: "Quà cho các dịp lễ & Sự kiện",
    description: "Lựa chọn và kết hợp sản phẩm trong các bộ sưu tập theo mùa hoặc dịp lễ (Valentine, Giáng sinh, Tết, Ngày Nhà giáo, Ngày Phụ nữ...) kèm lời nhắn cá nhân.",
    target: "Khách hàng cá nhân",
    color: "#e74c3c",
    occasions: ["valentine", "christmas", "tet", "birthday", "anniversary"]
  },
  {
    id: "daily",
    name: "Daily Gift Box",
    nameVi: "Quà xin lỗi, Cảm ơn & Động viên",
    description: "Lựa chọn sản phẩm và lời nhắn cá nhân cho các nhu cầu tặng quà hằng ngày như cảm ơn, chúc mừng, động viên hoặc không nhân dịp cụ thể.",
    target: "Khách hàng cá nhân",
    color: "#e67e22",
    occasions: ["thanks", "sorry"]
  },
  {
    id: "premium",
    name: "Premium Customize Gift Box",
    nameVi: "Premium Customize",
    description: "Tự chọn sản phẩm từ hệ thống, tùy chỉnh lời nhắn, màu sắc, phụ kiện và nhiều chi tiết bao bì theo phong cách riêng của bạn.",
    target: "Khách hàng cá nhân",
    color: "#8e44ad",
    occasions: ["customization", "luxury"],
    redirect: "customizer"
  },
  {
    id: "corporate",
    name: "Corporate Gift Box",
    nameVi: "Quà Doanh nghiệp",
    description: "Dịch vụ quà tặng doanh nghiệp được thiết kế hoàn toàn theo yêu cầu, bao gồm lựa chọn sản phẩm, thiết kế hộp quà, túi đựng, thiệp, màu sắc chủ đạo, logo, thông điệp thương hiệu, chủ đề sự kiện,...",
    target: "Doanh nghiệp, tổ chức",
    color: "#2c3e50",
    occasions: ["corporate", "partners", "clients"],
    redirect: "b2b"
  }
];

export const CATEGORY_PRESETS = [
  // === SEASONAL GIFT BOXES ===
  {
    id: "seasonal-valentine",
    category: "seasonal",
    name: "Valentine Love Box",
    description: "Hộp quà Valentine ngọt ngào với nến thơm oải hương và mật ong rừng nguyên chất, kèm thiệp viết tay lãng mạn.",
    price: 290000,
    items: ["prod-candle", "prod-honey"],
    box: "box-bamboo",
    size: "size-s",
    ribbon: "rib-cotton",
    image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80",
    tags: ["valentine", "lovers", "luxury", "300_500"]
  },
  {
    id: "seasonal-tet",
    category: "seasonal",
    name: "Tết An Khang",
    description: "Hộp quà Tết sang trọng với trà hoa cúc, mật ong nhãn và xà bông thảo dược - món quà đầu năm ý nghĩa.",
    price: 350000,
    items: ["prod-tea", "prod-honey", "prod-soap"],
    box: "box-bamboo",
    size: "size-m",
    ribbon: "rib-jute",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80",
    tags: ["tet", "family", "eco", "300_500"]
  },
  // === DAILY GIFT BOXES ===
  {
    id: "daily-thanks",
    category: "daily",
    name: "Gửi Lời Cảm Ơn",
    description: "Món quà nhỏ gửi lời tri ân chân thành: ly tre khắc tên kèm trà hoa thảo mộc thư giãn.",
    price: 180000,
    items: ["prod-cup", "prod-tea"],
    box: "box-kraft",
    size: "size-s",
    ribbon: "rib-jute",
    image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80",
    tags: ["thanks", "colleagues", "friends", "under_300"]
  },
  {
    id: "daily-sorry",
    category: "daily",
    name: "Món Quà Hàn Gắn",
    description: "Gửi lời xin lỗi chân thành qua nến thơm dịu nhẹ và xà bông thảo dược - những điều nhỏ bé xoa dịu tổn thương.",
    price: 200000,
    items: ["prod-candle", "prod-soap"],
    box: "box-kraft",
    size: "size-s",
    ribbon: "rib-cotton",
    image: "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?auto=format&fit=crop&w=600&q=80",
    tags: ["sorry", "friends", "lovers", "under_300"]
  },
  // === PREMIUM CUSTOM GIFT BOXES (mẫu tham khảo) ===
  {
    id: "premium-luxury",
    category: "premium",
    name: "Premium Đẳng Cấp",
    description: "Hộp tre đan thủ công cao cấp chứa bộ sưu tập nến thơm, mật ong rừng và sổ tay bìa cứng - cá nhân hóa toàn bộ bao bì.",
    price: 550000,
    items: ["prod-candle", "prod-honey", "prod-notebook"],
    box: "box-bamboo",
    size: "size-m",
    ribbon: "rib-cotton",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80",
    tags: ["customization", "luxury", "lovers", "500_1000"]
  },
  // === CORPORATE GIFT BOXES (mẫu tham khảo) ===
  {
    id: "corporate-premium",
    category: "corporate",
    name: "Corporate Premium",
    description: "Hộp quà doanh nghiệp cao cấp với sổ tay, bút tre, trà hoa cúc - in logo thương hiệu, màu sắc nhận diện riêng.",
    price: 250000,
    items: ["prod-notebook", "prod-tea"],
    box: "box-kraft",
    size: "size-m",
    ribbon: "rib-cotton",
    image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80",
    tags: ["corporate", "clients", "partners", "300_500"]
  },
  {
    id: "corporate-eco",
    category: "corporate",
    name: "Corporate Eco Friendly",
    description: "Giải pháp quà tặng xanh cho doanh nghiệp: ly tre, mật ong, xà bông - thể hiện cam kết bền vững của thương hiệu.",
    price: 320000,
    items: ["prod-cup", "prod-honey", "prod-soap"],
    box: "box-bamboo",
    size: "size-m",
    ribbon: "rib-jute",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80",
    tags: ["corporate", "eco", "partners", "300_500"]
  }
];

export const PRESET_BOXES = [
  {
    id: "preset-an-yen",
    name: "Hộp Quà An Yên",
    description: "Sự kết hợp ngọt ngào giữa Nến Thơm sáp đậu nành và Trà Hoàng Cúc giúp cân bằng cảm xúc và mang lại những phút giây thư giãn tuyệt vời.",
    price: 300000,
    items: ["prod-candle", "prod-tea"],
    box: "box-kraft",
    size: "size-s",
    ribbon: "rib-jute",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80",
    tags: ["family", "thanks", "birthday", "eco", "under_500"]
  },
  {
    id: "preset-nang-dong",
    name: "Combo Sáng Tạo & Năng Lượng",
    description: "Dành cho những người bạn đồng nghiệp nhiệt huyết: Ly tre khắc tên cùng Sổ tay giấy tái chế thô mộc đầy cảm hứng.",
    price: 210000,
    items: ["prod-cup", "prod-notebook"],
    box: "box-kraft",
    size: "size-s",
    ribbon: "rib-cotton",
    image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80",
    tags: ["colleagues", "friends", "thanks", "customization", "under_300"]
  },
  {
    id: "preset-tron-ven",
    name: "Trọn Vẹn Xanh Cát Tường",
    description: "Hộp tre đan cao cấp chứa đựng Trà Hoa Cúc, Mật Ong Nhãn rừng thơm ngon cùng Xà bông sinh dược mát dịu.",
    price: 375000,
    items: ["prod-tea", "prod-honey", "prod-soap"],
    box: "box-bamboo",
    size: "size-m",
    ribbon: "rib-cotton",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80",
    tags: ["clients", "partners", "tet", "eco", "300_500"]
  }
];

export const MOCK_ORDERS = [
  {
    id: "EK-1001",
    date: "2026-06-20 10:30",
    total: 300000,
    status: "delivered", // delivered, shipping, processing, confirmed
    statusText: "Đã giao hàng thành công",
    items: [
      { name: "Hộp Quà An Yên (Tùy biến)", qty: 1, price: 300000 }
    ],
    tracking: [
      { time: "2026-06-20 10:30", desc: "Đặt hàng thành công và thiết kế hoàn tất" },
      { time: "2026-06-20 14:00", desc: "Đội ngũ EcoKnot thắt nơ & Đóng gói xanh" },
      { time: "2026-06-21 08:30", desc: "Đã bàn giao kiện hàng cho đơn vị vận chuyển tiết kiệm carbon" },
      { time: "2026-06-22 15:45", desc: "Đang giao hàng tới người nhận" },
      { time: "2026-06-23 09:12", desc: "Giao hàng thành công. Cảm ơn bạn vì đã chọn lối sống bền vững!" }
    ],
    metrics: {
      recycledContent: 88,
      recyclabilityRate: 100,
      reusablePackaging: 92,
      renewableMaterial: 96,
      virginPlasticReduction: 150,
      carbonFootprintAvoided: 1.5
    }
  },
  {
    id: "EK-1002",
    date: "2026-06-24 16:15",
    total: 210000,
    status: "shipping",
    statusText: "Đang trên đường vận chuyển",
    items: [
      { name: "Combo Sáng Tạo (Tùy biến)", qty: 1, price: 210000 }
    ],
    tracking: [
      { time: "2026-06-24 16:15", desc: "Đặt hàng thành công và thiết kế hoàn tất" },
      { time: "2026-06-25 09:00", desc: "Đóng gói xanh hoàn tất bằng giấy tổ ong" },
      { time: "2026-06-25 14:00", desc: "Đã giao cho đối tác vận chuyển" },
      { time: "2026-06-26 11:30", desc: "Đang trung chuyển qua bưu cục quận" }
    ],
    metrics: {
      recycledContent: 95,
      recyclabilityRate: 100,
      reusablePackaging: 95,
      renewableMaterial: 90,
      virginPlasticReduction: 210,
      carbonFootprintAvoided: 2.3
    }
  },
  {
    id: "EK-1003",
    date: "2026-06-25 09:00",
    total: 375000,
    status: "processing",
    statusText: "Đội ngũ EcoKnot đang đóng gói thủ công",
    items: [
      { name: "Hộp Quà Trọn Vẹn Xanh (Mẫu có sẵn)", qty: 1, price: 375000 }
    ],
    tracking: [
      { time: "2026-06-25 09:00", desc: "Đơn hàng đã được xác nhận thanh toán" },
      { time: "2026-06-26 08:00", desc: "Nghệ nhân đang chuẩn bị thắt nơ ruy băng đay & viết thiệp tay" }
    ],
    metrics: {
      recycledContent: 68,
      recyclabilityRate: 100,
      reusablePackaging: 85,
      renewableMaterial: 100,
      virginPlasticReduction: 180,
      carbonFootprintAvoided: 1.8
    }
  }
];
