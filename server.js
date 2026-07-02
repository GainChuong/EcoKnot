import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Path to JSON Local database file
const DB_FILE = path.join(process.cwd(), 'db.json');

// Mock initial data matching data.js
const DEFAULT_PRODUCTS = [
  {
    id: "prod-candle",
    name: "Nến thơm sáp đậu nành Organic",
    category: "handicraft",
    price: 150000,
    tags: ["eco", "minimal", "lovers", "family", "birthday", "valentine", "anniversary", "thanks"],
    description: "Nến thơm thảo mộc tự nhiên từ sáp đậu nành lành tính, không khói độc, mang hương thơm thư thái của tinh dầu cam ngọt và oải hương."
  },
  {
    id: "prod-tea",
    name: "Trà hoa thảo mộc Hoàng Cúc",
    category: "handicraft",
    price: 120000,
    tags: ["eco", "vintage", "family", "clients", "partners", "thanks", "tet"],
    description: "Trà hoa cúc nguyên bông thu hoạch thủ công tại thung lũng sương mù, giúp an thần, ngủ ngon và thanh nhiệt cơ thể."
  },
  {
    id: "prod-cup",
    name: "Ly tre tự nhiên khắc tên theo yêu cầu",
    category: "handicraft",
    price: 95000,
    tags: ["customization", "minimal", "friends", "colleagues", "birthday", "thanks", "sorry"],
    description: "Sản phẩm thủ công từ thân tre tự nhiên, qua xử lý sấy cát không hóa chất độc hại, phủ sáp ong bảo vệ bề mặt chống thấm nước."
  },
  {
    id: "prod-soap",
    name: "Xà bông thảo dược Mướp Đắng Mật Ong",
    category: "handicraft",
    price: 75000,
    tags: ["eco", "cute", "friends", "lovers", "family", "birthday", "thanks", "sorry"],
    description: "Xà bông sinh dược làm sạch dịu nhẹ từ dịch ép mướp đắng rừng kết hợp mật ong hoa bạc hà vùng cao nguyên đá."
  },
  {
    id: "prod-notebook",
    name: "Sổ tay giấy tái chế Kraft Bìa Cứng",
    category: "handicraft",
    price: 80000,
    tags: ["customization", "minimal", "friends", "colleagues", "clients", "partners", "birthday", "thanks", "corporate"],
    description: "Sổ tay ghi chép cầm tay tiện dụng, chất liệu giấy tái chế không tẩy trắng, chống lóa mắt khi viết dưới ánh sáng mạnh."
  },
  {
    id: "prod-honey",
    name: "Mật ong rừng nguyên chất hoa nhãn",
    category: "handicraft",
    price: 110000,
    tags: ["eco", "family", "clients", "partners", "thanks", "tet", "corporate"],
    description: "Mật ong đặc quánh, màu vàng hổ phách tự nhiên, thu hoạch từ các tổ ong rừng sâu trong thung lũng mùa hoa nhãn nở rộ."
  },
  {
    id: "prod-tote",
    name: "Túi vải Canvas nhuộm chàm tự nhiên",
    category: "fashion",
    price: 180000,
    tags: ["eco", "minimal", "friends", "birthday", "thanks"],
    description: "Túi canvas bền bỉ nhuộm chàm thủ công từ lá cây chàm tự nhiên vùng cao."
  },
  {
    id: "prod-scarf",
    name: "Khăn lụa tơ tằm Bảo Lộc vẽ tay",
    category: "fashion",
    price: 320000,
    tags: ["luxury", "lovers", "family", "anniversary", "thanks"],
    description: "Khăn lụa 100% tơ tằm tự nhiên Bảo Lộc vẽ tay họa tiết cỏ cây mộc mạc."
  },
  {
    id: "prod-tray",
    name: "Khay gỗ dừa khảm xà cừ nghệ thuật",
    category: "handicraft",
    price: 220000,
    tags: ["vintage", "family", "clients", "partners", "thanks", "tet"],
    description: "Khay làm từ thân cây dừa già khảm họa tiết xà cừ óng ánh từ vỏ sò tự nhiên."
  },
  {
    id: "prod-tea-set",
    name: "Bộ ấm chén gốm mộc nung Bát Tràng",
    category: "handicraft",
    price: 450000,
    tags: ["vintage", "luxury", "family", "partners", "thanks", "tet"],
    description: "Bộ ấm chén gốm mộc mạc nung nhiệt độ cao từ đất sét Bát Tràng truyền thống."
  },
  {
    id: "prod-bamboo-notebook",
    name: "Sổ tay bìa tre ép tự nhiên cao cấp",
    category: "stationery",
    price: 150000,
    tags: ["customization", "minimal", "friends", "colleagues", "corporate"],
    description: "Sổ tay cao cấp với bìa tre ép tự nhiên độc bản, ruột giấy kraft tái chế chống lóa."
  },
  {
    id: "prod-bookmark",
    name: "Bộ kẹp giấy & Bookmark đồng cổ điển",
    category: "stationery",
    price: 90000,
    tags: ["minimal", "friends", "colleagues", "birthday", "thanks"],
    description: "Bookmark mạ đồng cổ điển hình hoa lá tinh xảo giúp lưu giữ trang sách yêu thích."
  }
];

const DEFAULT_BOXES = [
  { id: "box-kraft", name: "Hộp Giấy Kraft tái chế FSC", price: 30000, maxItems: 8 },
  { id: "box-bamboo", name: "Hộp Tre Đan Thủ Công", price: 65000, maxItems: 8 }
];

const DEFAULT_SIZES = [
  { id: "size-s", name: "Hộp Nhỏ (đựng 2-3 món)", price: 0, maxItems: 3 },
  { id: "size-m", name: "Hộp Vừa (đựng 4-5 món)", price: 10000, maxItems: 5 },
  { id: "size-l", name: "Hộp Lớn (đựng 6-8 món)", price: 20000, maxItems: 8 }
];

const DEFAULT_RIBBONS = [
  { id: "rib-jute", name: "Sợi đay mộc mạc tự nhiên", price: 5000, color: "#bda58d" },
  { id: "rib-cotton", name: "Dây cotton nhuộm màu tự nhiên", price: 8000, color: "#8fad88" }
];

// Helper to initialize and read DB
function readDb() {
  let db;
  if (!fs.existsSync(DB_FILE)) {
    db = {
      products: DEFAULT_PRODUCTS,
      ai_feedback_logs: [],
      customer_preference_profiles: [],
      customer_recipients: [],
      care_lendar_events: [],
      notifications: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } else {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(data);
    } catch (e) {
      db = {
        products: DEFAULT_PRODUCTS,
        ai_feedback_logs: [],
        customer_preference_profiles: [],
        customer_recipients: [],
        care_lendar_events: [],
        notifications: []
      };
    }
  }

  // Ensure tables exist
  if (!db.customer_recipients) db.customer_recipients = [];
  if (!db.care_lendar_events) db.care_lendar_events = [];
  if (!db.notifications) db.notifications = [];

  // Seed mock relationship graph and events if empty
  if (db.customer_recipients.length === 0) {
    db.customer_recipients = [
      {
        id: 1,
        user_id: "admin@ecoknot.vn",
        name: "Mẹ Yêu",
        relationship_type: "family",
        interests: ["eco", "vintage"],
        style_preference: "vintage",
        gift_history: ["Hộp quà Vu Lan Xanh", "Trà hoa thảo mộc Hoàng Cúc"],
        total_co2_saved: 4.8,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        user_id: "admin@ecoknot.vn",
        name: "Nguyễn Văn A (Bạn thân)",
        relationship_type: "friends",
        interests: ["customization", "minimal"],
        style_preference: "minimal",
        gift_history: ["Ly tre khắc tên theo yêu cầu"],
        total_co2_saved: 1.2,
        created_at: new Date().toISOString()
      }
    ];

    // Seed events
    const d14 = new Date();
    d14.setDate(d14.getDate() + 14);
    const date14 = d14.toISOString().split('T')[0];

    const d30 = new Date();
    d30.setDate(d30.getDate() + 30);
    const date30 = d30.toISOString().split('T')[0];

    db.care_lendar_events = [
      {
        id: 1,
        user_id: "admin@ecoknot.vn",
        recipient_id: 1,
        title: "Sinh nhật Mẹ yêu",
        event_date: date14,
        event_type: "birthday",
        suggested_box_draft: null,
        notification_triggered: false,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        user_id: "admin@ecoknot.vn",
        recipient_id: 2,
        title: "Ngày kỷ niệm tình bạn",
        event_date: date30,
        event_type: "anniversary",
        suggested_box_draft: null,
        notification_triggered: false,
        created_at: new Date().toISOString()
      }
    ];
    writeDb(db);
  }

  return db;
}

function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// ----------------------------------------------------
// AI Simulation Engine (Algorithm fallback for GPT-4o)
// ----------------------------------------------------
function runSimulationAi(survey, history) {
  const { recipient, occasion, budget, hobbies, style } = survey;
  const db = readDb();
  
  // Calculate a matching score for each product
  const scoredProducts = db.products.map(prod => {
    let score = 0;
    
    // Budget mapping check
    const price = prod.price;
    if (budget === 'under_300' && price < 150000) score += 2;
    else if (budget === '300_500' && price >= 80000 && price <= 180000) score += 2;
    else if (budget === '500_1000' && price >= 120000 && price <= 320000) score += 2;
    else if (budget === 'over_1000' && price >= 180000) score += 2;
    
    // Style check
    if (prod.tags.includes(style)) score += 3;
    
    // Recipient check mapping
    if (prod.tags.includes(recipient)) score += 2;
    
    // Hobbies check
    const matchingHobbies = prod.tags.filter(tag => hobbies.includes(tag));
    score += matchingHobbies.length * 1.5;
    
    // Occasion check
    if (prod.tags.includes(occasion)) score += 2;
    
    // Check historical preferred items
    if (history && history.preferred_product_ids && history.preferred_product_ids.includes(prod.id)) {
      score += 3; // Boost historical favorite
    }
    
    // Penalize historically avoided/deleted items
    if (history && history.avoided_product_ids && history.avoided_product_ids.includes(prod.id)) {
      score -= 5;
    }
    
    return { prod, score };
  });

  // Sort and select top items based on budget capacity
  scoredProducts.sort((a, b) => b.score - a.score);
  
  let targetItemCount = 3;
  let boxId = "box-kraft";
  let sizeId = "size-s";
  let ribbonId = "rib-jute";
  
  if (budget === 'under_300') {
    targetItemCount = 2;
    boxId = "box-kraft";
    sizeId = "size-s";
    ribbonId = "rib-jute";
  } else if (budget === '300_500') {
    targetItemCount = 3;
    boxId = "box-kraft";
    sizeId = "size-m";
    ribbonId = "rib-cotton";
  } else if (budget === '500_1000') {
    targetItemCount = 4;
    boxId = "box-bamboo";
    sizeId = "size-m";
    ribbonId = "rib-cotton";
  } else {
    targetItemCount = 5;
    boxId = "box-bamboo";
    sizeId = "size-l";
    ribbonId = "rib-cotton";
  }
  
  const selectedProducts = scoredProducts.slice(0, targetItemCount).map(x => x.prod);
  
  // Custom insight messages based on parameters
  const recipientNameMap = {
    friends: "bạn bè thân thiết",
    lovers: "người thương lãng mạn",
    family: "thành viên gia đình yêu quý",
    colleagues: "đồng nghiệp năng nổ",
    clients: "khách hàng trân trọng",
    partners: "đối tác tin cậy"
  };
  const recipientText = recipientNameMap[recipient] || "người nhận đặc biệt";
  
  const occasionMap = {
    birthday: "sinh nhật",
    christmas: "giáng sinh ấm áp",
    valentine: "lễ tình nhân ngọt ngào",
    tet: "dịp tết đoàn viên",
    anniversary: "ngày kỷ niệm ý nghĩa",
    thanks: "lời cảm ơn chân thành",
    sorry: "lời xin lỗi chân thành",
    corporate: "sự kiện doanh nghiệp"
  };
  const occasionText = occasionMap[occasion] || "dịp tặng quà";

  const styleText = style === 'eco' ? "thân thiện, mộc mạc và gần gũi với thiên nhiên" :
                    style === 'minimal' ? "tối giản, tinh tế và tập trung vào chất lượng cốt lõi" :
                    style === 'luxury' ? "sang trọng, đẳng cấp và tôn vinh người nhận" :
                    style === 'vintage' ? "cổ điển, mang đậm dấu ấn hoài niệm và thủ công" :
                    "hiện đại, năng động và giàu tính thẩm mỹ";

  const insight = `Gợi ý được tối ưu riêng cho ${recipientText} của bạn nhân ${occasionText}. Qua các thông số được cung cấp, đối tượng là người trân trọng phong cách ${styleText}, đồng thời ưu tiên các vật phẩm ${hobbies.includes('eco') ? 'đóng góp cho môi trường sống xanh' : 'có tính thực tế và thẩm mỹ cao'}. Hộp quà được chọn phối hài hòa để mang lại cảm giác ấm áp và kết nối sâu sắc.`;
  
  const reasoning = {};
  selectedProducts.forEach(p => {
    reasoning[p.id] = `Được chọn vì có đặc tính phù hợp hoàn hảo với tiêu chuẩn phong cách ${style.toUpperCase()} và sở thích ${hobbies.join(', ').toUpperCase()}. Đồng thời, sản phẩm có mức giá hợp lý và nhận được nhiều phản hồi tích cực từ cộng đồng quà tặng xanh.`;
  });
  
  return {
    promptId: "sim-" + Math.random().toString(36).substr(2, 9),
    insight,
    giftBox: {
      boxMaterial: boxId,
      boxSize: sizeId,
      ribbon: ribbonId,
      boxColor: boxId === 'box-kraft' ? '#f3ede2' : '#e3dac9',
      ribbonColor: ribbonId === 'rib-jute' ? '#bda58d' : '#8fad88'
    },
    productIds: selectedProducts.map(p => p.id),
    reasoning,
    simulation: true
  };
}

// ----------------------------------------------------
// API 1: Suggest Gift Box (Prompt + AI model)
// ----------------------------------------------------
app.post('/api/ai-suggest', async (req, res) => {
  const { userId, survey } = req.body;
  if (!survey) {
    return res.status(400).json({ error: "Missing survey choices payload" });
  }
  
  const { recipient, occasion, budget, hobbies, style } = survey;
  
  try {
    const db = readDb();
    
    // 1. Fetch user profile from DB
    const profile = db.customer_preference_profiles.find(p => p.user_id === userId);
    
    // 2. Check OpenAI API Key availability
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn("[AI Assist] OPENAI_API_KEY is not defined. Running in Simulation Mode.");
      const result = runSimulationAi(survey, profile);
      return res.json(result);
    }
    
    // 3. Prepare products manifest for OpenAI to map correctly
    const productManifest = db.products.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      tags: p.tags,
      description: p.description
    }));
    
    // 4. Construct Prompt with constraints and mapping database
    const systemPrompt = `Bạn là Trợ lý AI chọn quà tặng cá nhân hóa cho thương hiệu EcoKnot Gifting.
Nhiệm vụ của bạn là phân tích tâm lý người nhận và thiết kế một hộp quà tặng xanh lý tưởng.

Dưới đây là Danh sách Sản phẩm Hiện có trong Cơ sở Dữ liệu của EcoKnot (BẠN CHỈ ĐƯỢC CHỌN TỪ DANH SÁCH NÀY, TUYỆT ĐỐI KHÔNG BỊA RA SẢN PHẨM KHÁC):
${JSON.stringify(productManifest, null, 2)}

Dưới đây là Danh sách Vỏ hộp (boxMaterial):
- "box-kraft": Hộp Giấy Kraft tái chế FSC (Giá: 30,000đ, tối đa 8 món)
- "box-bamboo": Hộp Tre Đan Thủ Công (Giá: 65,000đ, tối đa 8 món)

Dưới đây là Danh sách Kích cỡ (boxSize):
- "size-s": Hộp Nhỏ (chứa 2-3 món)
- "size-m": Hộp Vừa (chứa 4-5 món)
- "size-l": Hộp Lớn (chứa 6-8 món)

Dưới đây là Danh sách Ruy-băng nơ buộc (ribbon):
- "rib-jute": Sợi đay mộc mạc tự nhiên (Giá: 5,000đ, màu mặc định #bda58d)
- "rib-cotton": Dây cotton nhuộm màu tự nhiên (Giá: 8,000đ, màu mặc định #8fad88)

YÊU CẦU ĐẦU RA JSON:
Trả về duy nhất một đối tượng JSON có cấu trúc như dưới đây. Không thêm bất kỳ văn bản giải thích nào khác ngoài JSON.
{
  "promptId": "chuỗi ngẫu nhiên",
  "insight": "Đoạn văn ngắn (khoảng 3-4 câu) phân tích tâm lý người nhận dựa trên sở thích, phong cách và dịp tặng quà.",
  "giftBox": {
    "boxMaterial": "box-kraft" hoặc "box-bamboo",
    "boxSize": "size-s" hoặc "size-m" hoặc "size-l",
    "ribbon": "rib-jute" hoặc "rib-cotton",
    "boxColor": "#f3ede2" hoặc "#d7ccc8" hoặc màu hex phù hợp với phong cách,
    "ribbonColor": "#bda58d" hoặc "#8fad88" hoặc màu hex phù hợp
  },
  "productIds": ["mảng gồm 2-6 ID sản phẩm khớp CHÍNH XÁC với ID trong danh sách sản phẩm trên"],
  "reasoning": {
    "ID-san-pham-1": "Giải thích chi tiết lý do chọn sản phẩm này cho người nhận.",
    "ID-san-pham-2": "Giải thích..."
  }
}

Chú ý:
1. Tổng giá tiền các món quà + tiền hộp + tiền ruy băng nên nằm trong khoảng ngân sách user mong muốn:
   - "under_300": Tổng tiền < 300,000đ
   - "300_500": Tổng tiền từ 300,000đ đến 500,000đ
   - "500_1000": Tổng tiền từ 500,000đ đến 1,000,000đ
   - "over_1000": Tổng tiền trên 1,000,000đ
2. Kích thước hộp phải tương ứng với số sản phẩm bạn chọn (nếu chọn 3 món -> "size-s", 4-5 món -> "size-m", 6-8 món -> "size-l").
3. Hãy xem xét cả hồ sơ lịch sử của user (nếu có) để tăng chất lượng gợi ý.`;

    let userPrompt = `Yêu cầu khảo sát chọn quà tặng:
- Đối tượng người nhận: ${recipient}
- Dịp tặng: ${occasion}
- Ngân sách: ${budget}
- Sở thích người nhận: ${hobbies.join(', ')}
- Phong cách thiết kế: ${style}`;

    if (profile) {
      userPrompt += `\n\nDữ liệu lịch sử khách hàng (Hãy ưu tiên gợi ý các sản phẩm khách hàng này yêu thích và tránh các sản phẩm họ đã từng bỏ bớt):
- Số đơn hàng đã mua: ${profile.purchased_items_count}
- ID các sản phẩm thường mua hoặc giữ lại: ${JSON.stringify(profile.preferred_product_ids)}
- ID các sản phẩm thường bị thay đổi/loại bỏ khỏi set: ${JSON.stringify(profile.avoided_product_ids)}`;
    }

    const openai = new OpenAI({ apiKey });
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" }
    });
    
    let aiResponse = JSON.parse(response.choices[0].message.content);
    
    // 5. Verification Mapping to prevent AI Hallucination
    const validProductIds = db.products.map(p => p.id);
    aiResponse.productIds = aiResponse.productIds.filter(id => {
      const exists = validProductIds.includes(id);
      if (!exists) {
        console.warn(`[AI Assist Mapping Filter] Removed hallucinated product ID: ${id}`);
      }
      return exists;
    });
    
    // Fallback: If OpenAI emptied products, pick at least 2 default ones
    if (aiResponse.productIds.length === 0) {
      aiResponse.productIds = ["prod-candle", "prod-cup"];
      aiResponse.reasoning["prod-candle"] = "Lựa chọn an toàn thay thế do hệ thống hiệu chỉnh.";
      aiResponse.reasoning["prod-cup"] = "Lựa chọn thân thiện với môi trường.";
    }
    
    aiResponse.simulation = false;
    res.json(aiResponse);
    
  } catch (error) {
    console.error("OpenAI API call failed, falling back to Simulation:", error);
    const profile = readDb().customer_preference_profiles.find(p => p.user_id === userId);
    const result = runSimulationAi(survey, profile);
    res.json(result);
  }
});

// ----------------------------------------------------
// API 2: Log User Feedback (Feedback loop log)
// ----------------------------------------------------
app.post('/api/feedback', (req, res) => {
  const { userId, promptId, aiBoxMaterial, aiBoxSize, aiRibbon, aiItems, finalItems } = req.body;
  
  if (!userId || !aiItems || !finalItems) {
    return res.status(400).json({ error: "Missing required feedback fields" });
  }
  
  const db = readDb();
  
  // Calculate differences
  const itemsRemoved = aiItems.filter(item => !finalItems.includes(item));
  const itemsAdded = finalItems.filter(item => !aiItems.includes(item));
  const itemsKept = aiItems.filter(item => finalItems.includes(item));
  
  // 1. Save Log
  const logEntry = {
    id: db.ai_feedback_logs.length + 1,
    user_id: userId,
    prompt_id: promptId || "manual",
    ai_box_material: aiBoxMaterial,
    ai_box_size: aiBoxSize,
    ai_ribbon: aiRibbon,
    ai_items: aiItems,
    final_items: finalItems,
    items_removed: itemsRemoved,
    items_added: itemsAdded,
    items_kept: itemsKept,
    changed_at: new Date().toISOString()
  };
  db.ai_feedback_logs.push(logEntry);
  
  // 2. Update user profile dynamically to save preferences
  let profile = db.customer_preference_profiles.find(p => p.user_id === userId);
  if (!profile) {
    profile = {
      user_id: userId,
      survey_recipients: [],
      survey_interests: [],
      budget_tier: '300_500',
      survey_occasions: [],
      style_preference: 'eco',
      purchased_items_count: 0,
      preferred_product_ids: [],
      avoided_product_ids: [],
      last_updated_at: new Date().toISOString()
    };
    db.customer_preference_profiles.push(profile);
  }
  
  // Add kept and added items to preferred list (avoid duplicates)
  const preferList = new Set([...profile.preferred_product_ids, ...itemsKept, ...itemsAdded]);
  // Add removed items to avoided list
  const avoidList = new Set([...profile.avoided_product_ids, ...itemsRemoved]);
  
  // Keep preferred and avoided exclusive (if added now, remove from avoided)
  itemsAdded.forEach(item => avoidList.delete(item));
  itemsKept.forEach(item => avoidList.delete(item));
  itemsRemoved.forEach(item => preferList.delete(item));
  
  profile.preferred_product_ids = Array.from(preferList);
  profile.avoided_product_ids = Array.from(avoidList);
  profile.last_updated_at = new Date().toISOString();
  
  writeDb(db);
  
  res.json({ success: true, logId: logEntry.id, profile });
});

// ----------------------------------------------------
// API 3: Order Completed (Trigger preference update)
// ----------------------------------------------------
app.post('/api/purchase-complete', (req, res) => {
  const { userId, items } = req.body;
  if (!userId || !items || !Array.isArray(items)) {
    return res.status(400).json({ error: "Missing purchase details" });
  }
  
  const db = readDb();
  let profile = db.customer_preference_profiles.find(p => p.user_id === userId);
  if (!profile) {
    profile = {
      user_id: userId,
      survey_recipients: [],
      survey_interests: [],
      budget_tier: '300_500',
      survey_occasions: [],
      style_preference: 'eco',
      purchased_items_count: 0,
      preferred_product_ids: [],
      avoided_product_ids: [],
      last_updated_at: new Date().toISOString()
    };
    db.customer_preference_profiles.push(profile);
  }
  
  // Extract item IDs (assuming items contains a list of IDs)
  profile.purchased_items_count += 1;
  const preferredSet = new Set([...profile.preferred_product_ids, ...items]);
  profile.preferred_product_ids = Array.from(preferredSet);
  profile.last_updated_at = new Date().toISOString();
  
  writeDb(db);
  
  res.json({ success: true, purchasedCount: profile.purchased_items_count });
});

// ----------------------------------------------------
// API 4: Get Preferences Profile
// ----------------------------------------------------
app.get('/api/preferences/:userId', (req, res) => {
  const { userId } = req.params;
  const db = readDb();
  const profile = db.customer_preference_profiles.find(p => p.user_id === userId);
  
  if (!profile) {
    return res.json({
      user_id: userId,
      survey_recipients: [],
      survey_interests: [],
      budget_tier: '300_500',
      survey_occasions: [],
      style_preference: 'eco',
      purchased_items_count: 0,
      preferred_product_ids: [],
      avoided_product_ids: []
    });
  }
  res.json(profile);
});

// ----------------------------------------------------
// CARE-LENDAR & PREDICTIVE EVENT ENGINES
// ----------------------------------------------------

// Relationship Graph: Get Recipients
app.get('/api/relationship-graph', (req, res) => {
  const userId = req.query.userId || 'admin@ecoknot.vn';
  const db = readDb();
  const list = db.customer_recipients.filter(r => r.user_id === userId);
  res.json(list);
});

// Relationship Graph: Add/Update Recipient
app.post('/api/recipients', (req, res) => {
  const { id, userId, name, relationshipType, interests, stylePreference } = req.body;
  if (!name || !relationshipType) {
    return res.status(400).json({ error: "Missing name or relationshipType" });
  }

  const db = readDb();
  const user = userId || 'admin@ecoknot.vn';
  
  if (id) {
    const idx = db.customer_recipients.findIndex(r => r.id === parseInt(id) && r.user_id === user);
    if (idx !== -1) {
      db.customer_recipients[idx] = {
        ...db.customer_recipients[idx],
        name,
        relationship_type: relationshipType,
        interests: interests || [],
        style_preference: stylePreference || 'eco'
      };
      writeDb(db);
      return res.json(db.customer_recipients[idx]);
    } else {
      return res.status(404).json({ error: "Recipient not found" });
    }
  } else {
    const newRc = {
      id: Date.now(),
      user_id: user,
      name,
      relationship_type: relationshipType,
      interests: interests || [],
      style_preference: stylePreference || 'eco',
      gift_history: [],
      total_co2_saved: 0.00,
      created_at: new Date().toISOString()
    };
    db.customer_recipients.push(newRc);
    writeDb(db);
    res.json(newRc);
  }
});

// Relationship Graph: Delete Recipient
app.delete('/api/recipients/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const userId = req.query.userId || 'admin@ecoknot.vn';
  const db = readDb();
  
  const initialLen = db.customer_recipients.length;
  db.customer_recipients = db.customer_recipients.filter(r => !(r.id === id && r.user_id === userId));
  
  if (db.customer_recipients.length < initialLen) {
    db.care_lendar_events = db.care_lendar_events.filter(e => !(e.recipient_id === id && e.user_id === userId));
    writeDb(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Recipient not found" });
  }
});

// Events: Get Care-lendar events
app.get('/api/care-lendar/events', (req, res) => {
  const userId = req.query.userId || 'admin@ecoknot.vn';
  const db = readDb();
  
  const events = db.care_lendar_events.filter(e => e.user_id === userId);
  const enriched = events.map(ev => {
    const rc = db.customer_recipients.find(r => r.id === ev.recipient_id);
    return {
      ...ev,
      recipient: rc || null
    };
  });
  
  res.json(enriched);
});

// Events: Add/Update Event
app.post('/api/care-lendar/events', (req, res) => {
  const { id, userId, recipientId, title, eventDate, eventType } = req.body;
  if (!recipientId || !title || !eventDate || !eventType) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const db = readDb();
  const user = userId || 'admin@ecoknot.vn';
  
  if (id) {
    const idx = db.care_lendar_events.findIndex(e => e.id === parseInt(id) && e.user_id === user);
    if (idx !== -1) {
      db.care_lendar_events[idx] = {
        ...db.care_lendar_events[idx],
        recipient_id: parseInt(recipientId),
        title,
        event_date: eventDate,
        event_type: eventType,
        suggested_box_draft: null,
        notification_triggered: false
      };
      writeDb(db);
      return res.json(db.care_lendar_events[idx]);
    } else {
      return res.status(404).json({ error: "Event not found" });
    }
  } else {
    const newEv = {
      id: Date.now(),
      user_id: user,
      recipient_id: parseInt(recipientId),
      title,
      event_date: eventDate,
      event_type: eventType,
      suggested_box_draft: null,
      notification_triggered: false,
      created_at: new Date().toISOString()
    };
    db.care_lendar_events.push(newEv);
    writeDb(db);
    res.json(newEv);
  }
});

// Events: Delete Event
app.delete('/api/care-lendar/events/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const userId = req.query.userId || 'admin@ecoknot.vn';
  const db = readDb();
  
  const initialLen = db.care_lendar_events.length;
  db.care_lendar_events = db.care_lendar_events.filter(e => !(e.id === id && e.user_id === userId));
  
  if (db.care_lendar_events.length < initialLen) {
    writeDb(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Event not found" });
  }
});

// Notifications: Get list
app.get('/api/notifications', (req, res) => {
  const userId = req.query.userId || 'admin@ecoknot.vn';
  const db = readDb();
  const list = db.notifications.filter(n => n.user_id === userId);
  res.json(list);
});

// Notifications: Mark as read
app.post('/api/notifications/:id/read', (req, res) => {
  const id = parseInt(req.params.id);
  const userId = req.body.userId || 'admin@ecoknot.vn';
  const db = readDb();
  
  const idx = db.notifications.findIndex(n => n.id === id && n.user_id === userId);
  if (idx !== -1) {
    db.notifications[idx].is_read = true;
    writeDb(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Notification not found" });
  }
});

// Predictive Cron Job Simulation Sweep
app.post('/api/cron/sweep', async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  const db = readDb();
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const sweepResults = [];
  
  for (let event of db.care_lendar_events) {
    if (event.user_id !== userId || event.notification_triggered) continue;
    
    const evDate = new Date(event.event_date);
    evDate.setHours(0,0,0,0);
    
    const diffTime = evDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Trigger if event is exactly 14 days away (or less than 14 days to catch simulated dates)
    if (diffDays === 14 || (diffDays > 0 && diffDays <= 14)) {
      const rc = db.customer_recipients.find(r => r.id === event.recipient_id);
      if (!rc) continue;
      
      let boxDraft;
      if (process.env.OPENAI_API_KEY) {
        try {
          const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
          const userPrompt = `Hãy thiết kế một hộp quà cho người nhận có mối quan hệ "${rc.relationship_type}", sở thích "${rc.interests.join(', ')}", phong cách "${rc.style_preference}". Dịp: "${event.event_type}" (Tiêu đề sự kiện: "${event.title}").`;
          
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content: `Bạn là Trợ lý AI Gợi Ý của EcoKnot Gifting. Thiết kế một hộp quà độc bản theo đúng sở thích người nhận. Trả về JSON chứa: insight, giftBox (boxMaterial, boxSize, boxColor, ribbon, ribbonColor), productIds, reasoning.
Sản phẩm hợp lệ: ${JSON.stringify(db.products.map(p => ({ id: p.id, name: p.name, tags: p.tags, price: p.price })))}`
              },
              { role: "user", content: userPrompt }
            ]
          });
          boxDraft = JSON.parse(response.choices[0].message.content);
          boxDraft.isPredictive = true;
          boxDraft.simulation = false;
        } catch (e) {
          console.error("OpenAI call in Cron sweep failed:", e);
          boxDraft = runMockPredictiveGifting(rc, event, db.products);
        }
      } else {
        boxDraft = runMockPredictiveGifting(rc, event, db.products);
      }
      
      event.suggested_box_draft = boxDraft;
      event.notification_triggered = true;
      
      const newNotif = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        user_id: userId,
        title: `Gợi ý quà tặng cho ${rc.name}`,
        message: `Chỉ còn 14 ngày nữa là đến ${event.title} của ${rc.name}. EcoKnot đã chuẩn bị sẵn một bản thiết kế hộp quà dành riêng cho ${rc.name}, bạn có muốn xem thử?`,
        event_id: event.id,
        is_read: false,
        created_at: new Date().toISOString()
      };
      
      db.notifications.unshift(newNotif);
      sweepResults.push({ eventId: event.id, recipientName: rc.name, title: event.title });
    }
  }
  
  if (sweepResults.length > 0) {
    writeDb(db);
  }
  
  res.json({ success: true, triggeredCount: sweepResults.length, details: sweepResults });
});

function runMockPredictiveGifting(recipient, event, products) {
  const filtered = products.filter(p => p.tags.some(t => recipient.interests.includes(t)));
  const items = filtered.length >= 3 ? filtered.slice(0, 3) : products.slice(0, 3);
  
  const reasoning = {};
  items.forEach(p => {
    reasoning[p.id] = `Được chọn vì phù hợp với phong cách ${recipient.style_preference} và sở thích của ${recipient.name}`;
  });
  
  return {
    simulation: true,
    isPredictive: true,
    insight: `Món quà được thiết kế đặc biệt dành riêng cho ${recipient.name} (mối quan hệ ${recipient.relationship_type}), tập trung vào các sản phẩm thuộc sở thích ${recipient.interests.join(', ')} với phong cách thiết kế ${recipient.style_preference}.`,
    giftBox: {
      boxMaterial: recipient.style_preference === 'vintage' ? 'box-bamboo' : 'box-kraft',
      boxSize: "size-m",
      boxColor: recipient.style_preference === 'vintage' ? '#dfd6c0' : '#8fad88',
      ribbon: "rib-jute",
      ribbonColor: "#bda58d"
    },
    productIds: items.map(p => p.id),
    reasoning
  };
}

// ============================================================
// COMMERCE MODULE — Cart · Orders · Payment · Tracking
// ============================================================

// Helper: generate order ID in format EK-YYYYMMDD-XXXX
function generateOrderId() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `EK-${date}-${rand}`;
}

// Helper: ensure commerce collections exist in db
function ensureCommerceCollections(db) {
  if (!db.cart) db.cart = [];
  if (!db.orders) db.orders = [];
  if (!db.order_items) db.order_items = [];
  if (!db.payment_logs) db.payment_logs = [];
}

// Helper: Order Status display metadata
const ORDER_STATUS_META = {
  pending_payment: { label: 'Chờ thanh toán', icon: 'fa-clock', color: '#f59e0b', step: 0 },
  pending_quote:   { label: 'Chờ báo giá B2B', icon: 'fa-file-invoice', color: '#8b5cf6', step: 0 },
  paid:            { label: 'Đã tiếp nhận đơn hàng', icon: 'fa-circle-check', color: '#10b981', step: 1 },
  in_production:   { label: 'Đang chuẩn bị sản phẩm xanh', icon: 'fa-leaf', color: '#059669', step: 2 },
  eco_packaging:   { label: 'Đóng gói bền vững', icon: 'fa-box-open', color: '#0d9488', step: 3 },
  dispatched:      { label: 'Đang giao hàng', icon: 'fa-truck', color: '#0891b2', step: 4 },
  delivered:       { label: 'Đã trao gửi yêu thương', icon: 'fa-heart', color: '#e11d48', step: 5 },
  cancelled:       { label: 'Đã huỷ đơn', icon: 'fa-ban', color: '#6b7280', step: -1 }
};

// ─── CART APIS ────────────────────────────────────────────────────────────────

// GET /api/cart?userId=
app.get('/api/cart', (req, res) => {
  const userId = req.query.userId;
  const sessionId = req.query.sessionId;
  const db = readDb();
  ensureCommerceCollections(db);

  let cart = userId
    ? db.cart.find(c => c.user_id === userId)
    : db.cart.find(c => c.session_id === sessionId);

  res.json(cart || { items: [] });
});

// POST /api/cart  — upsert item
app.post('/api/cart', (req, res) => {
  const { userId, sessionId, item } = req.body;
  if (!item) return res.status(400).json({ error: 'Missing item payload' });

  const db = readDb();
  ensureCommerceCollections(db);

  let cart = userId
    ? db.cart.find(c => c.user_id === userId)
    : db.cart.find(c => c.session_id === sessionId);

  if (!cart) {
    cart = {
      id: Date.now().toString(36),
      user_id: userId || null,
      session_id: sessionId || null,
      items: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.cart.push(cart);
  }

  // Check if item with same id already exists → update qty
  const existingIdx = cart.items.findIndex(i => i.id === item.id);
  if (existingIdx !== -1) {
    cart.items[existingIdx].qty = (cart.items[existingIdx].qty || 1) + (item.qty || 1);
  } else {
    cart.items.push({ ...item, id: item.id || Date.now().toString(36) });
  }
  cart.updated_at = new Date().toISOString();

  writeDb(db);
  res.json(cart);
});

// DELETE /api/cart/item/:itemId
app.delete('/api/cart/item/:itemId', (req, res) => {
  const { userId, sessionId } = req.query;
  const db = readDb();
  ensureCommerceCollections(db);

  const cartIdx = userId
    ? db.cart.findIndex(c => c.user_id === userId)
    : db.cart.findIndex(c => c.session_id === sessionId);

  if (cartIdx === -1) return res.status(404).json({ error: 'Cart not found' });

  db.cart[cartIdx].items = db.cart[cartIdx].items.filter(i => i.id !== req.params.itemId);
  db.cart[cartIdx].updated_at = new Date().toISOString();
  writeDb(db);
  res.json({ success: true });
});

// DELETE /api/cart  — clear entire cart
app.delete('/api/cart', (req, res) => {
  const { userId, sessionId } = req.query;
  const db = readDb();
  ensureCommerceCollections(db);

  const cartIdx = userId
    ? db.cart.findIndex(c => c.user_id === userId)
    : db.cart.findIndex(c => c.session_id === sessionId);

  if (cartIdx !== -1) {
    db.cart[cartIdx].items = [];
    db.cart[cartIdx].updated_at = new Date().toISOString();
    writeDb(db);
  }
  res.json({ success: true });
});

// ─── ORDER APIS ───────────────────────────────────────────────────────────────

// POST /api/orders — Create new order
app.post('/api/orders', (req, res) => {
  const {
    userId, customerName, customerPhone, customerEmail,
    shippingAddress, province, district, ward,
    deliveryMethod, paymentMethod,
    subtotal, shipFee, discount, couponCode,
    vatInvoiceRequired, companyName, companyTaxId,
    notes, cartItems,
    // B2B specific
    isB2B, b2bQty, b2bNotes
  } = req.body;

  if (!customerName || !customerPhone || !customerEmail || !shippingAddress || !paymentMethod) {
    return res.status(400).json({ error: 'Missing required order fields' });
  }

  const db = readDb();
  ensureCommerceCollections(db);

  const orderId = generateOrderId();
  const total = (subtotal || 0) + (shipFee || 0) - (discount || 0);

  // Determine initial status
  let status = 'pending_payment';
  if (paymentMethod === 'b2b_quote') status = 'pending_quote';
  if (paymentMethod === 'cod') status = 'paid'; // COD = confirmed on checkout

  const newOrder = {
    id: orderId,
    user_id: userId || null,
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_email: customerEmail,
    shipping_address: shippingAddress,
    province: province || '',
    district: district || '',
    ward: ward || '',
    delivery_method: deliveryMethod || 'standard',
    payment_method: paymentMethod,
    status,
    carrier_tracking_id: null,
    carrier_name: null,
    subtotal: subtotal || 0,
    ship_fee: shipFee || 0,
    discount: discount || 0,
    total,
    coupon_code: couponCode || null,
    vat_invoice_required: vatInvoiceRequired || false,
    company_name: companyName || null,
    company_tax_id: companyTaxId || null,
    notes: notes || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.orders.unshift(newOrder);

  // Create order_items from cart
  const orderItems = (cartItems || []).map((item, idx) => ({
    id: Date.now() + idx,
    order_id: orderId,
    item_type: item.type || 'custom_box',
    box_material: item.box || null,
    box_size: item.size || null,
    ribbon: item.ribbon || null,
    box_color: item.boxColor || null,
    items_json: item.items || [],
    card_text: item.cardText || '',
    photo_url: item.photo || null,
    qty: item.qty || 1,
    unit_price: item.price || 0,
    subtotal: (item.price || 0) * (item.qty || 1),
    eco_metrics: item.metrics || {}
  }));
  db.order_items.push(...orderItems);

  // Create initial payment log
  const paymentLog = {
    id: Date.now(),
    order_id: orderId,
    gateway: paymentMethod === 'b2b_quote' ? 'b2b' : paymentMethod,
    gateway_txn_id: null,
    gateway_ref: orderId,
    amount: total,
    status: paymentMethod === 'cod' ? 'initiated' : 'initiated',
    raw_payload: { source: 'order_creation', payment_method: paymentMethod },
    verified_at: paymentMethod === 'cod' ? new Date().toISOString() : null,
    created_at: new Date().toISOString()
  };
  db.payment_logs.push(paymentLog);

  // Clear the user's cart after successful order
  if (userId) {
    const cartIdx = db.cart.findIndex(c => c.user_id === userId);
    if (cartIdx !== -1) db.cart[cartIdx].items = [];
  }

  writeDb(db);

  // Build VietQR link for online payment
  let vietqrUrl = null;
  if (paymentMethod === 'vietqr' || paymentMethod === 'bank_transfer') {
    const BANK_ID = process.env.VIETQR_BANK_ID || 'MB';
    const ACCOUNT_NO = process.env.VIETQR_ACCOUNT_NO || '0912345678';
    const ACCOUNT_NAME = encodeURIComponent(process.env.VIETQR_ACCOUNT_NAME || 'ECOKNOT GIFTING');
    const addInfo = encodeURIComponent(`ECOKNOT ${orderId}`);
    vietqrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${total}&addInfo=${addInfo}&accountName=${ACCOUNT_NAME}`;
  }

  res.status(201).json({
    success: true,
    orderId,
    status,
    total,
    vietqrUrl,
    statusMeta: ORDER_STATUS_META[status]
  });
});

// GET /api/orders/:id — Get order detail (public, no auth needed)
app.get('/api/orders/:id', (req, res) => {
  const db = readDb();
  ensureCommerceCollections(db);

  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const items = db.order_items.filter(i => i.order_id === order.id);
  const payments = db.payment_logs.filter(p => p.order_id === order.id);

  res.json({
    ...order,
    statusMeta: ORDER_STATUS_META[order.status] || {},
    order_items: items,
    payment_logs: payments
  });
});

// POST /api/orders/track — Public lookup: orderId + phone OR email
app.post('/api/orders/track', (req, res) => {
  const { orderId, phone, email } = req.body;
  if (!orderId) return res.status(400).json({ error: 'Missing orderId' });
  if (!phone && !email) return res.status(400).json({ error: 'Cần nhập số điện thoại hoặc email để xác minh' });

  const db = readDb();
  ensureCommerceCollections(db);

  const order = db.orders.find(o => {
    if (o.id !== orderId) return false;
    if (phone && o.customer_phone.replace(/\s/g, '') === phone.replace(/\s/g, '')) return true;
    if (email && o.customer_email.toLowerCase() === email.toLowerCase()) return true;
    return false;
  });

  if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn hàng. Vui lòng kiểm tra lại Mã đơn và Số điện thoại/Email.' });

  const items = db.order_items.filter(i => i.order_id === order.id);

  // Build timeline steps
  const TIMELINE_STEPS = [
    { key: 'paid',           label: 'Đã tiếp nhận đơn hàng', desc: 'Hệ thống ghi nhận dòng tiền thành công. Cảm ơn bạn đã tin tưởng EcoKnot! 🌿', icon: 'fa-circle-check' },
    { key: 'in_production',  label: 'Đang chuẩn bị sản phẩm xanh', desc: 'Đội ngũ EcoKnot đang nhặt sản phẩm hữu cơ, in thiệp thủ công và tạo mã QR video kỷ niệm.', icon: 'fa-leaf' },
    { key: 'eco_packaging',  label: 'Đóng gói bền vững', desc: 'Đơn hàng đang được bọc bằng giấy tổ ong, xếp vào hộp Kraft FSC và niêm phong bằng băng keo gốc nước.', icon: 'fa-box-open' },
    { key: 'dispatched',     label: 'Đang giao hàng', desc: order.carrier_tracking_id ? `Mã vận đơn: ${order.carrier_tracking_id} (${order.carrier_name || 'GHN'})` : 'Đã bàn giao cho đơn vị vận chuyển.', icon: 'fa-truck' },
    { key: 'delivered',      label: 'Đã trao gửi yêu thương', desc: 'Giao hàng thành công. Hy vọng người nhận thật hạnh phúc với hộp quà xanh của bạn! 💚', icon: 'fa-heart' }
  ];

  const currentStatusMeta = ORDER_STATUS_META[order.status];
  const currentStep = currentStatusMeta ? currentStatusMeta.step : 0;

  const timeline = TIMELINE_STEPS.map((step, idx) => ({
    ...step,
    status: idx + 1 <= currentStep ? 'done' : idx + 1 === currentStep + 1 ? 'active' : 'pending'
  }));

  res.json({
    order: {
      id: order.id,
      status: order.status,
      statusMeta: currentStatusMeta || {},
      customer_name: order.customer_name,
      total: order.total,
      created_at: order.created_at,
      delivery_method: order.delivery_method,
      carrier_tracking_id: order.carrier_tracking_id,
      carrier_name: order.carrier_name,
      shipping_address: `${order.shipping_address}, ${order.ward}, ${order.district}, ${order.province}`
    },
    timeline,
    order_items: items
  });
});

// GET /api/orders?userId= — Order history for authenticated user
app.get('/api/orders', (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  const db = readDb();
  ensureCommerceCollections(db);

  const userOrders = db.orders
    .filter(o => o.user_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const enriched = userOrders.map(order => {
    const items = db.order_items.filter(i => i.order_id === order.id);
    const lastPayment = db.payment_logs
      .filter(p => p.order_id === order.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    return {
      ...order,
      statusMeta: ORDER_STATUS_META[order.status] || {},
      order_items: items,
      last_payment: lastPayment || null
    };
  });

  res.json(enriched);
});

// POST /api/orders/:id/reorder — Clone old order as new cart items
app.post('/api/orders/:id/reorder', (req, res) => {
  const { userId } = req.body;
  const db = readDb();
  ensureCommerceCollections(db);

  const order = db.orders.find(o => o.id === req.params.id && o.user_id === userId);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const items = db.order_items.filter(i => i.order_id === order.id);

  // Map order_items back to cart item format
  const cartItems = items.map(oi => ({
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
    type: oi.item_type,
    box: oi.box_material,
    size: oi.box_size,
    ribbon: oi.ribbon,
    boxColor: oi.box_color,
    items: oi.items_json,
    cardText: oi.card_text,
    photo: oi.photo_url,
    qty: 1, // Reset to 1 for reorder
    price: oi.unit_price,
    metrics: oi.eco_metrics,
    isReorder: true,
    originalOrderId: order.id
  }));

  res.json({ success: true, cartItems });
});

// PATCH /api/orders/:id/status — Admin: update order status + tracking
app.patch('/api/orders/:id/status', (req, res) => {
  const { status, carrierTrackingId, carrierName } = req.body;
  if (!status) return res.status(400).json({ error: 'Missing status' });

  const db = readDb();
  ensureCommerceCollections(db);

  const orderIdx = db.orders.findIndex(o => o.id === req.params.id);
  if (orderIdx === -1) return res.status(404).json({ error: 'Order not found' });

  db.orders[orderIdx].status = status;
  if (carrierTrackingId) db.orders[orderIdx].carrier_tracking_id = carrierTrackingId;
  if (carrierName) db.orders[orderIdx].carrier_name = carrierName;
  db.orders[orderIdx].updated_at = new Date().toISOString();

  writeDb(db);
  res.json({ success: true, order: db.orders[orderIdx] });
});

// ─── PAYMENT WEBHOOK (Production-ready skeletons) ─────────────────────────────

// POST /api/webhook/payos — PayOS webhook handler
// Docs: https://payos.vn/docs/tich-hop-webhook/
app.post('/api/webhook/payos', express.json({ type: 'application/json' }), async (req, res) => {
  try {
    const payload = req.body;
    const PAYOS_CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY;

    // --- Production: HMAC-SHA256 Signature Verification ---
    if (PAYOS_CHECKSUM_KEY) {
      const crypto = await import('crypto');
      // PayOS signature data: amount + cancelUrl + description + orderCode + returnUrl
      const signData = [
        `amount=${payload.data?.amount}`,
        `cancelUrl=${payload.data?.cancelUrl}`,
        `description=${payload.data?.description}`,
        `orderCode=${payload.data?.orderCode}`,
        `returnUrl=${payload.data?.returnUrl}`
      ].join('&');
      const expectedSig = crypto
        .default.createHmac('sha256', PAYOS_CHECKSUM_KEY)
        .update(signData)
        .digest('hex');

      if (payload.signature !== expectedSig) {
        console.warn('[PayOS Webhook] Invalid signature. Ignoring.');
        return res.status(400).json({ error: 'Invalid signature' });
      }
    } else {
      console.warn('[PayOS Webhook] PAYOS_CHECKSUM_KEY not set — skipping signature verification (DEV MODE)');
    }

    const { code, data } = payload;
    if (!data) return res.json({ success: false, message: 'No data in payload' });

    const orderId = data.description?.match(/EK-\d{8}-\d{4}/)?.[0] || data.orderCode?.toString();

    const db = readDb();
    ensureCommerceCollections(db);

    // Write payment log (always, even on failure)
    db.payment_logs.push({
      id: Date.now(),
      order_id: orderId || 'unknown',
      gateway: 'payos',
      gateway_txn_id: data.transactionDateTime || String(data.orderCode),
      gateway_ref: String(data.orderCode),
      amount: data.amount || 0,
      status: code === '00' ? 'success' : 'failed',
      raw_payload: payload,
      verified_at: code === '00' ? new Date().toISOString() : null,
      created_at: new Date().toISOString()
    });

    if (code === '00' && orderId) {
      // Payment success → advance order to 'paid'
      const orderIdx = db.orders.findIndex(o => o.id === orderId);
      if (orderIdx !== -1 && db.orders[orderIdx].status === 'pending_payment') {
        db.orders[orderIdx].status = 'paid';
        db.orders[orderIdx].updated_at = new Date().toISOString();
        console.log(`[PayOS] ✅ Order ${orderId} advanced to "paid"`);
      }
    }

    writeDb(db);
    res.json({ success: true });
  } catch (err) {
    console.error('[PayOS Webhook] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/webhook/vnpay — VNPAY IPN handler
// Docs: https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
app.post('/api/webhook/vnpay', async (req, res) => {
  try {
    const params = req.query; // VNPAY sends IPN via GET query params
    const VNPAY_HASH_SECRET = process.env.VNPAY_HASH_SECRET;

    if (VNPAY_HASH_SECRET) {
      const crypto = await import('crypto');
      const vnpSecureHash = params['vnp_SecureHash'];
      const signParams = { ...params };
      delete signParams['vnp_SecureHash'];
      delete signParams['vnp_SecureHashType'];

      const sortedKeys = Object.keys(signParams).sort();
      const signData = sortedKeys.map(k => `${k}=${signParams[k]}`).join('&');
      const expectedHash = crypto
        .default.createHmac('sha512', VNPAY_HASH_SECRET)
        .update(signData)
        .digest('hex');

      if (vnpSecureHash !== expectedHash) {
        return res.json({ RspCode: '97', Message: 'Invalid Checksum' });
      }
    }

    const responseCode = params['vnp_ResponseCode'];
    const txnRef = params['vnp_TxnRef']; // Our order ID
    const amount = parseInt(params['vnp_Amount']) / 100; // VNPAY sends amount * 100

    const db = readDb();
    ensureCommerceCollections(db);

    db.payment_logs.push({
      id: Date.now(),
      order_id: txnRef || 'unknown',
      gateway: 'vnpay',
      gateway_txn_id: params['vnp_TransactionNo'],
      gateway_ref: txnRef,
      amount,
      status: responseCode === '00' ? 'success' : 'failed',
      raw_payload: params,
      verified_at: responseCode === '00' ? new Date().toISOString() : null,
      created_at: new Date().toISOString()
    });

    if (responseCode === '00' && txnRef) {
      const orderIdx = db.orders.findIndex(o => o.id === txnRef);
      if (orderIdx !== -1 && db.orders[orderIdx].status === 'pending_payment') {
        db.orders[orderIdx].status = 'paid';
        db.orders[orderIdx].updated_at = new Date().toISOString();
        console.log(`[VNPAY] ✅ Order ${txnRef} advanced to "paid"`);
      }
    }

    writeDb(db);
    res.json({ RspCode: '00', Message: 'Confirm Success' });
  } catch (err) {
    console.error('[VNPAY IPN] Error:', err);
    res.json({ RspCode: '99', Message: 'Unknown error' });
  }
});

// POST /api/payment/manual-confirm — Dev mode: manually confirm payment
app.post('/api/payment/manual-confirm', (req, res) => {
  const { orderId, adminNote } = req.body;
  if (!orderId) return res.status(400).json({ error: 'Missing orderId' });

  const db = readDb();
  ensureCommerceCollections(db);

  const orderIdx = db.orders.findIndex(o => o.id === orderId);
  if (orderIdx === -1) return res.status(404).json({ error: 'Order not found' });

  if (!['pending_payment'].includes(db.orders[orderIdx].status)) {
    return res.status(400).json({ error: `Order is already in status: ${db.orders[orderIdx].status}` });
  }

  db.orders[orderIdx].status = 'paid';
  db.orders[orderIdx].updated_at = new Date().toISOString();

  const txnId = 'MANUAL-' + Date.now();
  db.payment_logs.push({
    id: Date.now(),
    order_id: orderId,
    gateway: 'vietqr_manual',
    gateway_txn_id: txnId,
    gateway_ref: orderId,
    amount: db.orders[orderIdx].total,
    status: 'success',
    raw_payload: { source: 'manual_confirm', note: adminNote || 'Manual confirmation via dev tool' },
    verified_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  });

  writeDb(db);
  console.log(`[Manual Confirm] ✅ Order ${orderId} confirmed as paid`);
  res.json({ success: true, newStatus: 'paid', transactionId: txnId });
});

// ─── INVOICE DATA ─────────────────────────────────────────────────────────────

// GET /api/orders/:id/invoice-data — Full invoice JSON for PDF generation
app.get('/api/orders/:id/invoice-data', (req, res) => {
  const db = readDb();
  ensureCommerceCollections(db);

  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const items = db.order_items.filter(i => i.order_id === order.id);
  const payments = db.payment_logs
    .filter(p => p.order_id === order.id && p.status === 'success')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const invoiceData = {
    invoice_number: `INV-${order.id}`,
    issue_date: new Date(order.updated_at).toLocaleDateString('vi-VN'),
    order: {
      id: order.id,
      created_at: new Date(order.created_at).toLocaleString('vi-VN'),
      status: order.status
    },
    seller: {
      name: 'EcoKnot Gifting',
      address: '123 Đường Xanh, Phường Eco, Quận Bền Vững, TP.HCM',
      phone: '1800-ECOKNOT',
      email: 'hello@ecoknot.vn',
      tax_id: '0312345678'
    },
    buyer: {
      name: order.customer_name,
      phone: order.customer_phone,
      email: order.customer_email,
      address: `${order.shipping_address}, ${order.ward}, ${order.district}, ${order.province}`,
      company_name: order.company_name || null,
      tax_id: order.company_tax_id || null
    },
    line_items: items.map(oi => ({
      description: oi.item_type === 'custom_box'
        ? `Hộp quà cá nhân hóa (${(oi.items_json || []).length} sản phẩm)`
        : 'Hộp quà mẫu có sẵn',
      products: oi.items_json || [],
      qty: oi.qty,
      unit_price: oi.unit_price,
      subtotal: oi.subtotal
    })),
    summary: {
      subtotal: order.subtotal,
      ship_fee: order.ship_fee,
      discount: order.discount,
      total: order.total
    },
    payment: {
      method: order.payment_method,
      transaction_id: payments[0]?.gateway_txn_id || null,
      paid_at: payments[0]?.verified_at ? new Date(payments[0].verified_at).toLocaleString('vi-VN') : null
    },
    eco_metrics: {
      total_co2_saved_kg: items.reduce((sum, i) => sum + (i.eco_metrics?.co2_saved_kg || 0), 0).toFixed(2),
      total_plastic_saved_g: items.reduce((sum, i) => sum + (i.eco_metrics?.virgin_plastic_saved_g || 0), 0)
    }
  };

  res.json(invoiceData);
});

// Setup fallback server listening
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`EcoKnot AI Assist Server running on port ${PORT}`);
  console.log(`Database Local JSON file: ${DB_FILE}`);
  console.log(`=================================================`);
});

