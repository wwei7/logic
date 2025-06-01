// 產品詳情頁面的 JavaScript 函數

// 初始化 Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBXN3ElXZ0S888oGjbcqlwElWXLT1LHKX8",
  authDomain: "game-ecc00.firebaseapp.com",
  databaseURL: "https://game-ecc00-default-rtdb.firebaseio.com",
  projectId: "game-ecc00",
  storageBucket: "game-ecc00.firebasestorage.app",
  messagingSenderId: "547677273823",
  appId: "1:547677273823:web:547b175c60167468feb36a",
  measurementId: "G-WV1H7HGZF0"
};

// Firebase 變量
let db;
let firebaseInitialized = false;

// 嘗試初始化 Firebase
try {
  // 確保 firebase 只初始化一次
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  db = firebase.firestore();
  
  // 允許離線數據
  db.enablePersistence()
    .then(() => {
      console.log("Firebase 離線持久化已啟用");
      firebaseInitialized = true;
    })
    .catch(err => {
      console.error("Firebase 離線持久化失敗:", err.code);
      if (err.code === 'failed-precondition') {
        console.log("多個標籤頁開啟，無法啟用離線持久化");
      } else if (err.code === 'unimplemented') {
        console.log("當前瀏覽器不支持所有離線功能");
      }
    });
} catch (error) {
  console.error("Firebase 初始化錯誤:", error);
}

// 本地評論數據（當 Firebase 不可用時）
const fallbackReviews = {
  "eyeshadow1": [
    {
      name: "李小美",
      title: "絕佳顯色度",
      rating: 5,
      content: "顏色顯色度非常好，不會飛粉，很容易暈染，非常適合日常妝容！",
      timestamp: new Date(2025, 2, 15)
    },
    {
      name: "王小明",
      title: "質地細膩但有點掉粉",
      rating: 4,
      content: "眼影顏色很漂亮，但有點容易掉粉，需要先用打底才能持久。",
      timestamp: new Date(2025, 3, 2)
    }
  ],
  "mascara1": [
    {
      name: "陳曉華",
      title: "纖長效果明顯",
      rating: 4,
      content: "睫毛膏刷頭設計很好，能夠刷到每根睫毛，纖長效果顯著，但濃密度稍嫌不足。",
      timestamp: new Date(2025, 1, 20)
    }
  ]
};

// 產品資料庫 - 實際應用中這應該從後端或 Firestore 獲取
const productsDatabase = {
  // 眼妝系列
  eyeshadow1: {
    id: "eyeshadow1",
    name: "星光眼影盤",
    category: "eye",
    categoryName: "眼妝",
    price: 590,
    rating: 4.5,
    ratingCount: 120,
    sku: "EY-001",
    shortDesc: "9色高顯色星空漸變眼影盤，打造明亮迷人眼妝",
    fullDesc: `
      <h4>產品詳情</h4>
      <p>這款星光眼影盤結合了9款精心挑選的色調，從日常自然到華麗夜妝都能輕鬆駕馭。每個色彩都蘊含細膩珠光粒子，能創造出如星空般閃耀的眼妝效果。</p>
      <p>高度顯色的粉質能輕鬆暈染，即使是彩妝新手也能打造漸變眼影效果。同時質地柔滑，不易飛粉，妝效持久不脫妝。</p>
      
      <h4>色彩組合</h4>
      <p>包含4款啞光色、3款珠光色以及2款閃粉色，可依照不同場合自由搭配，打造出多樣眼妝風格。</p>
    `,
    features: [
      "9色高顯色眼影集合",
      "珠光質地，打造星空閃耀眼妝",
      "粉質細膩易於暈染",
      "不飛粉、不脫妝",
      "適合各種場合使用"
    ],
    specs: [
      { name: "淨重", value: "12g" },
      { name: "保存期限", value: "開封後12個月" },
      { name: "產地", value: "韓國" },
      { name: "適用膚質", value: "所有膚質" }
    ],
    ingredients: [
      "滑石粉", "雲母", "尼龍-12", "硼矽酸鈉鋁", "異十二烷", 
      "硬脂酸鎂", "辛酸/癸酸甘油三酯", "矽石", "苯氧乙醇",
      "水楊酸辛酯", "生育酚", "黃原膠", "氧化鐵", "氧化鋅",
      "二氧化鈦", "紅色4號", "藍色1號"
    ],
    usage: `
      <ol>
        <li>使用眼影打底產品均勻塗抹於整個眼窩區域，提高眼影的持久度。</li>
        <li>使用眼影刷沾取淺色系打底，均勻暈染在整個眼窩。</li>
        <li>使用中等深淺的顏色在眼窩摺疊處進行暈染，加深輪廓。</li>
        <li>使用最深色在眼尾處做重點暈染，塑造深邃感。</li>
        <li>使用亮色或珠光色點綴在眼頭和眼中央，增加立體感。</li>
        <li>可使用眼線筆或深色眼影沿著睫毛根部描繪眼線，增加眼妝精緻度。</li>
      </ol>
      <p><strong>專業提示：</strong> 使用較小的眼影刷能更精確地控制顏色分佈。眼影暈染時應採用輕拍或畫圓的方式，避免用力刷拭。</p>
    `,
    images: [
      "assets/img/eyeshadow1.jpg",
      "assets/img/eyeshadow-detail1.webp",
      "assets/img/eyeshadow-detail2.webp",
    ],
    relatedProducts: ["mascara1", "eyeliner1", "eyebrow1"]
  },
  
  // 睫毛膏
  mascara1: {
    id: "mascara1",
    name: "纖長濃密睫毛膏",
    category: "eye",
    categoryName: "眼妝",
    price: 420,
    rating: 4.0,
    ratingCount: 85,
    sku: "EY-002",
    shortDesc: "不暈染防水配方，打造纖長濃密睫毛",
    fullDesc: `
      <h4>產品詳情</h4>
      <p>這款纖長濃密睫毛膏採用獨特配方，能同時達到延長和增加睫毛濃密度的效果。特殊纖維刷頭設計，能夠捕捉每一根睫毛，從根部到尖端均勻著色。</p>
      <p>防水防汗的配方能在各種天氣和場合下保持妝容完美，不暈染、不脫妝，讓您的眼睛全天候展現迷人魅力。</p>
      
      <h4>獨特刷頭設計</h4>
      <p>採用特製錐形刷頭，纖細的刷毛能夠輕鬆觸及內外眼角的睫毛，打造全方位豐盈效果。</p>
    `,
    features: [
      "防水防汗配方",
      "增長與濃密雙重效果",
      "特殊纖維刷頭設計",
      "不易暈染",
      "易於卸除"
    ],
    specs: [
      { name: "容量", value: "10ml" },
      { name: "保存期限", value: "開封後6個月" },
      { name: "產地", value: "日本" },
      { name: "適用對象", value: "所有人群" }
    ],
    ingredients: [
      "水", "合成蜂蠟", "硬脂酸", "棕櫚酸", "胺基甲酸酯樹脂", 
      "丙烯酸酯聚合物", "尼龍纖維", "硬脂酸鎂", "聚乙烯醇", 
      "卡那棕色素", "羥基硬脂酸", "山梨醇", "生育酚",
      "氯化鈉", "羥苯甲酯", "苯氧乙醇"
    ],
    usage: `
      <ol>
        <li>使用睫毛夾先夾翹睫毛，提供基礎捲翹效果。</li>
        <li>將刷頭輕輕放入睫毛膏管中，避免過度抽取產品。</li>
        <li>從睫毛根部開始，以鋸齒狀動作向上刷拭，確保睫毛均勻著色。</li>
        <li>對於內眼角和下睫毛，可將刷頭垂直使用，細緻著色。</li>
        <li>待第一層乾燥後，可再添加第二層增強效果。</li>
        <li>如有睫毛結塊情況，可使用睫毛梳輕輕梳理。</li>
      </ol>
      <p><strong>專業提示：</strong> 使用紙巾輕輕擦拭刷頭可減少產品堆積，避免睫毛結塊。</p>
    `,
    images: [
      "assets/img/mascara.webp",
      "assets/img/mascara-detail1.avif",
      "assets/img/mascara-detail2.jpg"
    ],
    relatedProducts: ["eyeshadow1", "eyeliner1", "eyebrow1"]
  },

  // 眼線液
  eyeliner1: {
    id: "eyeliner1",
    name: "持久防水眼線液",
    category: "eye",
    categoryName: "眼妝",
    price: 350,
    rating: 4.9,
    ratingCount: 210,
    sku: "EY-003",
    shortDesc: "極細筆尖設計，輕鬆畫出精細眼線",
    fullDesc: `
      <h4>產品詳情</h4>
      <p>這款眼線液採用專業級防水防汗配方，即使流汗或淚水也不會暈染。極細筆尖設計讓您能夠精確控制線條粗細，輕鬆畫出貼合眼型的流暢眼線。</p>
      <p>超強持久力可維持一整天的完美眼線，不暈染、不脫妝，讓您的目光更加深邃迷人。</p>
      
      <h4>筆尖設計</h4>
      <p>0.01mm極細筆尖，彈性佳且不易斷裂，能夠精確繪製睫毛根部及內眼線。</p>
    `,
    features: [
      "24小時超強防水配方",
      "0.01mm極細筆尖",
      "快乾不暈染",
      "深邃純黑色澤",
      "溫和配方不刺激眼周"
    ],
    specs: [
      { name: "容量", value: "0.5ml" },
      { name: "保存期限", value: "開封後3個月" },
      { name: "產地", value: "韓國" },
      { name: "適用膚質", value: "所有膚質" }
    ],
    ingredients: [
      "水", "丙烯酸酯共聚物", "碳黑", "丁二醇", "丙烯酸羥乙酯/丙烯酰氧乙基三甲基氯化銨共聚物",
      "苯氧乙醇", "十八醇", "PEG-60氫化蓖麻油", "山梨醇", "EDTA二鈉",
      "丙二醇", "生育酚", "檸檬酸"
    ],
    usage: `
      <ol>
        <li>使用前輕輕搖晃眼線液。</li>
        <li>取適量產品，從眼睛內側開始向外畫線。</li>
        <li>眼頭部分可畫得較細，眼尾可稍微加粗並輕微上揚，創造提拉效果。</li>
        <li>如需精確控制，可將手肘抵在桌面上穩定手部，或使用小鏡子靠近觀察。</li>
        <li>畫完後保持眼睛半閉狀態約10秒，讓產品完全乾燥。</li>
      </ol>
      <p><strong>專業提示：</strong> 如有畫錯，可使用沾有卸妝液的棉花棒精確修正，無需重畫整個眼線。</p>
    `,
    images: [
      "assets/img/eyeliner.jpg",
      "assets/img/eyeliner-detail1.jpg",
      "assets/img/eyeliner-detail2.jpg"
    ],
    relatedProducts: ["eyeshadow1", "mascara1", "eyebrow1"]
  },

  // 眉筆
  eyebrow1: {
    id: "eyebrow1",
    name: "三角形自動眉筆",
    category: "eye",
    categoryName: "眼妝",
    price: 320,
    rating: 4.2,
    ratingCount: 65,
    sku: "EY-004",
    shortDesc: "三角筆頭設計，輕鬆畫出自然眉形",
    fullDesc: `
      <h4>產品詳情</h4>
      <p>這款三角形眉筆採用創新的三角形筆頭設計，能夠同時勾勒眉型輪廓和填充眉毛，一支搞定所有眉妝需求。</p>
      <p>防水防汗配方，讓眉妝全天持久不脫落。質地適中，不會太乾也不會太油，能畫出清晰且自然的線條。</p>
      
      <h4>雙頭設計</h4>
      <p>筆身另一端配有眉刷，可用於梳理眉毛和暈染產品，使眉妝更加自然。</p>
    `,
    features: [
      "三角形筆頭設計",
      "雙頭設計帶眉刷",
      "防水防汗配方",
      "自動旋轉筆芯，免削尖",
      "六種自然眉色可選"
    ],
    specs: [
      { name: "淨重", value: "0.28g" },
      { name: "保存期限", value: "開封後18個月" },
      { name: "產地", value: "日本" },
      { name: "適用膚質", value: "所有膚質" }
    ],
    ingredients: [
      "合成蜂蠟", "石蠟", "棕櫚酸", "硬脂酸", "微晶蠟", 
      "大豆油甘油酯", "羊毛脂", "維生素E", "二氧化鈦",
      "氧化鐵", "雲母粉", "氧化鋁"
    ],
    usage: `
      <ol>
        <li>先用眉刷梳理眉毛，確定眉毛的生長方向。</li>
        <li>使用三角筆頭最尖的部分描繪眉型輪廓，特別是眉頭和眉尾的形狀。</li>
        <li>利用筆頭的平面部分，以短小的描繪動作填補眉毛稀疏處。</li>
        <li>用眉刷從眉頭到眉尾梳理，暈染產品使眉妝更加自然。</li>
        <li>可使用遮瑕膏在眉毛周圍輕輕描繪，使眉型更加乾淨俐落。</li>
      </ol>
      <p><strong>專業提示：</strong> 選擇比自己髮色淺一階的眉色，效果會更加自然；如果希望更有存在感，則可選擇相同或稍深的顏色。</p>
    `,
    images: [
      "assets/img/eyebrow.avif",
      "assets/img/eyebrow-detail1.jpg",
      "assets/img/eyebrow-detail2.jpg"
    ],
    relatedProducts: ["eyeshadow1", "mascara1", "eyeliner1"]
  },

  // 口紅系列產品
  lipstick1: {
    id: "lipstick1",
    name: "絲絨霧面口紅",
    category: "lip",
    categoryName: "唇妝",
    price: 450,
    rating: 4.8,
    ratingCount: 230,
    sku: "LP-001",
    shortDesc: "輕盈霧面質地，不乾燥持久顯色",
    fullDesc: `
      <h4>產品詳情</h4>
      <p>這款絲絨霧面口紅採用革命性配方，能夠同時達到霧面效果和保濕滋潤，解決了傳統霧面口紅乾燥的問題。</p>
      <p>質地輕盈如空氣，塗抹後立即化為絲絨般的霧面質感，持久顯色不易脫妝，讓雙唇全天候展現完美色彩。</p>
      
      <h4>色彩系列</h4>
      <p>提供10種經典色調，從日常裸粉到深邃酒紅，滿足各種場合與膚色的需求。</p>
    `,
    features: [
      "革命性保濕霧面配方",
      "輕盈如空氣的質地",
      "8小時持久顯色",
      "不易沾杯、不易脫妝",
      "10款精選色調"
    ],
    specs: [
      { name: "淨重", value: "3.5g" },
      { name: "保存期限", value: "開封後12個月" },
      { name: "產地", value: "法國" },
      { name: "適用膚質", value: "所有膚質" }
    ],
    ingredients: [
      "二聚體甲基矽氧烷交聯聚合物", "聚甲基矽氧烷", "異十二烷", "硅石", 
      "尼龍-12", "聚乙烯蠟", "矽灰石", "微晶蠟", "角鯊烯", 
      "維生素E", "維生素C", "紅石榴精華", "紅色7號", "紅色27號"
    ],
    usage: `
      <ol>
        <li>唇部保養：塗抹前可先使用潤唇膏或唇部磨砂，保持唇部濕潤並去除死皮。</li>
        <li>唇線描繪：可先用唇線筆描繪唇形，增加口紅的持久度與精準度。</li>
        <li>口紅應用：從唇部中央開始塗抹，向唇角延展。</li>
        <li>精緻細節：用唇刷或指尖沿唇線輕拍，使唇妝與唇線自然融合。</li>
        <li>層疊塗抹：對於更鮮豔的效果，可等第一層稍乾後再塗第二層。</li>
      </ol>
      <p><strong>專業提示：</strong> 輕咬一張面紙可去除多餘產品，增加持久度。混合不同色調可創造獨特唇色。</p>
    `,
    images: [
      "assets/img/lipstick1.jpg",
      "assets/img/lipstick-detail1.jpg",
      "assets/img/lipstick-detail2.jpg"
    ],
    relatedProducts: ["liptint1", "lipbalm1", "lipstick2"]
  },
  
  // 唇釉
  liptint1: {
    id: "liptint1",
    name: "水潤持久唇釉",
    category: "lip",
    categoryName: "唇妝",
    price: 380,
    rating: 4.6,
    ratingCount: 175,
    sku: "LP-002",
    shortDesc: "水潤光澤質地，持久顯色不沾杯",
    fullDesc: `
      <h4>產品詳情</h4>
      <p>這款水潤持久唇釉結合了唇彩的光澤感和唇釉的持久度，一抹呈現水潤飽滿色澤，長效鎖色不易脫落。</p>
      <p>特殊配方能在唇部形成輕薄保護膜，防止色素脫落同時鎖住水分，讓雙唇長時間保持水潤豐滿。</p>
      
      <h4>獨特刷頭</h4>
      <p>精心設計的斜角絨毛刷頭，能精確沿唇線勾勒，也能均勻塗抹全唇。</p>
    `,
    features: [
      "水潤光感配方",
      "6小時持久顯色",
      "不易沾杯技術",
      "保濕滋潤成分",
      "8款流行色調"
    ],
    specs: [
      { name: "容量", value: "4.5ml" },
      { name: "保存期限", value: "開封後9個月" },
      { name: "產地", value: "韓國" },
      { name: "適用膚質", value: "所有膚質" }
    ],
    ingredients: [
      "聚丁烯", "二甲基硅氧烷", "異十二烷", "微晶蠟", "透明質酸鈉",
      "蜂蜜提取物", "石榴籽油", "維生素E", "橄欖油", "荷荷巴油",
      "紅色33號", "紅色27號", "黃色5號"
    ],
    usage: `
      <ol>
        <li>輕輕擰出產品，先沿唇形輪廓描繪。</li>
        <li>再均勻塗抹全唇，可用指尖輕拍唇部邊緣處理暈染。</li>
        <li>若需更強顯色度，可等第一層略乾後再添加第二層。</li>
        <li>欲呈現漸變唇妝，可在唇中央重點添加。</li>
        <li>可單獨使用，也可疊加在口紅之上增加光澤感。</li>
      </ol>
      <p><strong>專業提示：</strong> 為了更持久的效果，可先使用唇部打底或透明唇線筆打底，再塗抹唇釉。</p>
    `,
    images: [
      "assets/img/liptint.jpg",
      "assets/img/liptint-detail1.jpg",
      "assets/img/liptint-detail2.jpg"
    ],
    relatedProducts: ["lipstick1", "lipbalm1", "lipstick2"]
  },
    lipbalm1: {
    id: "lipbalm1",
    name: "滋潤護唇膏",
    category: "lipcare",
    categoryName: "唇部護理",
    price: 280,
    rating: 4.0,
    ratingCount: 120,
    sku: "LB-001",
    shortDesc: "深層修護乾裂雙唇，全天保濕不黏膩",
    fullDesc: `
        <h4>產品詳情</h4>
        <p>這款護唇膏富含乳木果油與維他命E，專為乾裂雙唇設計，迅速舒緩並修護受損唇部肌膚。</p>
        <p>絲滑質地好推不黏膩，能長效鎖水保濕，打造柔嫩雙唇。</p>
        
        <h4>無添加刺激成分</h4>
        <p>不含酒精、人工香料與防腐劑，敏感唇也能安心使用。</p>
    `,
    features: [
        "深層修護乾裂唇部",
        "富含天然植物油",
        "不黏膩質地",
        "全天保濕",
        "無酒精無香料"
    ],
    specs: [
        { name: "容量", value: "4g" },
        { name: "保存期限", value: "開封後12個月" },
        { name: "產地", value: "韓國" }
    ],
    ingredients: [
        "乳木果油", "可可脂", "維生素E", "角鯊烷", "蜂蠟", "荷荷芭油", "玻尿酸鈉"
    ],
    usage: `
        <ol>
        <li>每日早晚或感覺乾燥時使用。</li>
        <li>直接塗抹於乾燥唇部，可依需要重複塗抹。</li>
        </ol>
        <p><strong>專業提示：</strong> 睡前厚敷當作唇膜效果更佳，隔天雙唇柔嫩水潤。</p>
    `,
    images: [
        "assets/img/lipbalm.jpg",
        "assets/img/lipbalm1.jpg",
        "assets/img/lipbalm-detail1.avif"
    ],
    relatedProducts: ["lipgloss1", "primer1"]
    },
    lipgloss1: {
    id: "lipgloss1",
    name: "絲絨啞光唇釉",
    category: "lip",
    categoryName: "唇彩",
    price: 490,
    rating: 4.7,
    ratingCount: 95,
    sku: "LG-001",
    shortDesc: "輕盈絲滑，持久不脫色的啞光唇彩",
    fullDesc: `
        <h4>產品詳情</h4>
        <p>啞光唇釉擁有絲絨般的柔霧妝感，滑順塗抹、持妝一整天不乾裂。</p>
        <p>高顯色度搭配不沾杯技術，是約會與長時間活動的理想選擇。</p>
        
        <h4>時尚色選</h4>
        <p>推出12款熱門色系，從裸粉到深紅，滿足各種場合需求。</p>
    `,
    features: [
        "絲絨柔霧妝感",
        "持色不沾杯",
        "輕盈滑順",
        "高顯色度",
        "不乾裂"
    ],
    specs: [
        { name: "容量", value: "5ml" },
        { name: "保存期限", value: "開封後12個月" },
        { name: "產地", value: "義大利" }
    ],
    ingredients: [
        "二甲矽油", "合成蠟", "辛酸/癸酸三酸甘油酯", "雲母", "二氧化矽", "氧化鐵", "香料"
    ],
    usage: `
        <ol>
        <li>使用前可先薄塗護唇膏打底。</li>
        <li>以唇刷沿唇形描繪輪廓，再填滿整體唇部。</li>
        </ol>
        <p><strong>專業提示：</strong> 可疊加不同色號打造漸層唇妝。</p>
    `,
    images: [
        "assets/img/lipstick2.webp",
        "assets/img/lipgloss1.webp",
    ],
    relatedProducts: ["lipbalm1", "primer1"]
    },
  // 粉底系列
  foundation1: {
    id: "foundation1",
    name: "24小時持久粉底液",
    category: "base",
    categoryName: "底妝",
    price: 1680,
    rating: 4.5,
    ratingCount: 185,
    sku: "FD-001",
    shortDesc: "輕盈持久配方，完美遮瑕同時保持肌膚呼吸",
    fullDesc: `
      <h4>產品詳情</h4>
      <p>這款高級粉底液採用突破性24小時持妝科技，能在各種天氣環境下保持完美妝效，不氧化、不脫妝、不浮粉。</p>
      <p>輕盈透氣配方能讓肌膚自由呼吸，同時提供中高度遮瑕效果，修飾瑕疵並均勻膚色，創造自然完美的妝容。</p>
      
      <h4>廣泛色號</h4>
      <p>提供20種精準匹配的色號，從極淺到深沉，專為亞洲人膚色特別調製黃調與中性調色系。</p>
    `,
    features: [
      "24小時持妝科技",
      "輕盈透氣配方",
      "中高度遮瑕",
      "控油不泛油光",
      "20種精確色號"
    ],
    specs: [
      { name: "容量", value: "30ml" },
      { name: "保存期限", value: "開封後12個月" },
      { name: "產地", value: "法國" },
      { name: "防曬係數", value: "SPF 15" }
    ],
    ingredients: [
      "水", "環五聚矽氧烷", "異十二烷", "甘油", "聚二甲基矽氧烷",
      "氯化鈉", "硬脂酸鎂", "尼龍-12", "二氧化鈦", "聚甲基丙烯酸甲酯",
      "維生素E", "透明質酸鈉", "角鯊烷", "甲基丙烯酸甲酯交聯聚合物",
      "氧化鐵", "二氧化鈦"
    ],
    usage: `
      <ol>
        <li>使用前先進行完整保濕步驟，並可選擇使用妝前乳提高持妝度。</li>
        <li>擠取適量粉底液於手背或化妝盤中。</li>
        <li>使用化妝刷、美妝蛋或手指，從臉部中央向外輕拍推勻。</li>
        <li>可針對需要加強遮瑕的區域進行疊加。</li>
        <li>最後可使用蜜粉輕輕定妝，增加持妝效果。</li>
      </ol>
      <p><strong>專業提示：</strong> 如果需要更自然的妝效，可將粉底液與保濕乳混合使用；若需高遮瑕效果，建議先用遮瑕膏處理重點區域再塗抹粉底。</p>
    `,
    images: [
      "assets/img/foundation1.webp",
      "assets/img/foundation-detail1.webp",
      "assets/img/foundation-detail2.webp"
    ],
    relatedProducts: ["cushion1", "powder1", "primer1"]
  },
    cushion1: {
    id: "cushion1",
    name: "水潤光感氣墊粉餅",
    category: "base",
    categoryName: "底妝",
    price: 1580,
    rating: 4.2,
    ratingCount: 156,
    sku: "CU-001",
    shortDesc: "打造水光肌妝效，輕拍即上妝",
    fullDesc: `
        <h4>產品詳情</h4>
        <p>水潤光感氣墊粉餅能迅速提亮膚色、均勻肌理，帶來自然光澤的妝感。</p>
        <p>內含保濕精華，適合乾性與混合性肌膚，妝效貼合不卡粉。</p>
        
        <h4>方便補妝</h4>
        <p>氣墊設計攜帶方便，隨時隨地快速補妝。</p>
    `,
    features: [
        "自然水光妝效",
        "保濕精華成分",
        "輕盈遮瑕",
        "適合乾性肌膚",
        "快速補妝"
    ],
    specs: [
        { name: "容量", value: "15g" },
        { name: "保存期限", value: "開封後12個月" },
        { name: "產地", value: "韓國" },
        { name: "防曬係數", value: "SPF 35 / PA++" }
    ],
    ingredients: [
        "水", "甘油", "二氧化鈦", "玻尿酸鈉", "煙酰胺", "洋甘菊萃取", "角鯊烷", "氧化鋅"
    ],
    usage: `
        <ol>
        <li>打開氣墊盒，使用粉撲按壓取適量粉底。</li>
        <li>輕拍於全臉，從臉部中央向外均勻推開。</li>
        </ol>
        <p><strong>專業提示：</strong> 搭配妝前乳與蜜粉可延長妝效持久度。</p>
    `,
    images: [
        "assets/img/cushion.jpg",
        "assets/img/cushion1.webp",
    ],
    relatedProducts: ["foundation1", "primer1", "powder1"]
    },
    powder1: {
  id: "powder1",
  name: "控油持妝蜜粉",
  category: "base",
  categoryName: "底妝",
  price: 320,
  rating: 4.8,
  ratingCount: 220,
  sku: "PW-001",
  shortDesc: "超細緻粉末，全天不脫妝不卡粉",
  fullDesc: `
    <h4>產品詳情</h4>
    <p>這款蜜粉採用極細微粒技術，輕拍即可吸附多餘油脂，使妝容持久清爽。</p>
    <p>透明粉體不改變底妝色調，適合所有膚色使用。</p>
    
    <h4>多用途設計</h4>
    <p>可用於定妝、眼下提亮或唇部打底。</p>
  `,
  features: [
    "長效控油配方",
    "超細緻粉末",
    "無色不改妝",
    "多功能用途",
    "適合所有膚質"
  ],
  specs: [
    { name: "容量", value: "10g" },
    { name: "保存期限", value: "開封後24個月" },
    { name: "產地", value: "日本" }
  ],
  ingredients: [
    "滑石粉", "矽石", "玉米澱粉", "氧化鋅", "維他命E", "二氧化鈦"
  ],
  usage: `
    <ol>
      <li>使用刷具或粉撲取適量蜜粉。</li>
      <li>輕拍於T字部位及易出油區域。</li>
    </ol>
    <p><strong>專業提示：</strong> 眼下定妝可防止遮瑕積線。</p>
  `,
  images: [
    "assets/img/powder.jpg",
    "assets/img/powder1.webp",
  ],
  relatedProducts: ["foundation1", "primer1", "cushion1"]
},
primer1: {
  id: "primer1",
  name: "水潤保濕妝前乳",
  category: "base",
  categoryName: "底妝",
  price: 1450,
  rating: 4.6,
  ratingCount: 130,
  sku: "PR-001",
  shortDesc: "修飾毛孔、持久保濕妝前打底",
  fullDesc: `
    <h4>產品詳情</h4>
    <p>水潤妝前乳蘊含玻尿酸與植物萃取，能在上妝前形成柔滑保濕膜，有效延長底妝服貼時間。</p>
    <p>質地清爽不黏膩，幫助修飾粗大毛孔與膚色不均。</p>
    
    <h4>全天舒適妝感</h4>
    <p>保濕同時控油，適合各種膚質，特別是乾性與混合肌。</p>
  `,
  features: [
    "保濕修護雙效合一",
    "柔焦毛孔修飾",
    "不致粉刺配方",
    "妝效更持久",
    "適合各種膚質"
  ],
  specs: [
    { name: "容量", value: "30ml" },
    { name: "保存期限", value: "開封後12個月" },
    { name: "產地", value: "台灣" }
  ],
  ingredients: [
    "水", "甘油", "玻尿酸鈉", "綠茶萃取", "蘆薈萃取", "角鯊烷", "維他命B5"
  ],
  usage: `
    <ol>
      <li>清潔與保濕後，取適量妝前乳均勻塗抹於全臉。</li>
      <li>待吸收後再上底妝產品。</li>
    </ol>
    <p><strong>專業提示：</strong> 可針對易出油或毛孔粗大處加強塗抹。</p>
  `,
  images: [
    "assets/img/primer.jpg",
    "assets/img/primer1.png",
    "assets/img/primer-detail1.jpg"
  ],
  relatedProducts: ["foundation1", "cushion1", "powder1"]
},

  // 更多產品可以繼續添加...
};
let isSubmitting = false;
// Update review statistics UI elements
function updateReviewStatsUI(reviews) {
  const reviewCount = reviews.length;
  
  // Update review count display
  const ratingCountElement = document.getElementById('rating-count');
  if (ratingCountElement) {
    ratingCountElement.textContent = reviewCount;
  }
  
  const reviewCountElement = document.getElementById('review-count');
  if (reviewCountElement) {
    reviewCountElement.textContent = `(${reviewCount})`;
  }
  
  // If no reviews, no need to update other data
  if (reviewCount === 0) {
    return;
  }
  
  // Calculate average rating
  let totalRating = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
  const avgRating = (totalRating / reviewCount).toFixed(1);
  
  // Update average rating display
  const avgRatingElement = document.getElementById('average-rating');
  if (avgRatingElement) {
    avgRatingElement.textContent = avgRating;
  }
  
  // Update rating stars
  const ratingContainer = document.querySelector('.rating-large');
  if (ratingContainer) {
    updateStarRating(ratingContainer, avgRating);
  }
  
  // Calculate percentage for each star rating
  const ratingCounts = [0, 0, 0, 0, 0]; // 5 stars to 1 star count
  reviews.forEach(review => {
    const rating = Number(review.rating || 0);
    if (rating >= 1 && rating <= 5) {
      ratingCounts[5 - rating]++;
    }
  });
  
  // Update progress bars
  const progressBars = document.querySelectorAll('.rating-bars .progress-bar');
  if (progressBars && progressBars.length === 5) {
    ratingCounts.forEach((count, index) => {
      const percentage = Math.round((count / reviewCount) * 100);
      progressBars[index].style.width = `${percentage}%`;
      progressBars[index].setAttribute('aria-valuenow', percentage);
      
      // Update percentage text
      const percentText = progressBars[index].parentElement.nextElementSibling;
      if (percentText) {
        percentText.textContent = `${percentage}%`;
      }
    });
  }
}
// 獲取URL參數
function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  const results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// 更新頁面星級評分
function updateStarRating(container, rating) {
  const stars = container.querySelectorAll('i');
  stars.forEach((star, index) => {
    if (index < Math.floor(rating)) {
      star.className = 'bi bi-star-fill';
    } else if (index < rating) {
      star.className = 'bi bi-star-half';
    } else {
      star.className = 'bi bi-star';
    }
  });
}

// 格式化評論日期
function formatDate(timestamp) {
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('zh-TW');
}
// 新增 - 更新 localStorage 中的評論，確保 Firebase ID 被正確保存
function updateReviewInLocalStorage(review) {
  try {
    if (!review || !review.productId) {
      console.error('無法更新評論：缺少評論數據或產品ID');
      return;
    }
    
    // 從 localStorage 獲取當前評論數據
    let localReviews = JSON.parse(localStorage.getItem('product-reviews') || '{}');
    
    // 確保該產品的評論陣列存在
    if (!localReviews[review.productId]) {
      localReviews[review.productId] = [];
    }
    
    // 檢查評論是否已存在於 localStorage
    const index = localReviews[review.productId].findIndex(r => 
      // 透過 localId 或內容比對找到原評論
      (r.localId && r.localId === review.localId) ||
      (r.email === review.email && r.title === review.title && r.content === review.content)
    );
    
    if (index !== -1) {
      // 更新已存在的評論
      console.log(`更新本地存儲中的評論 ID: ${review.localId} -> ${review.id}`);
      localReviews[review.productId][index].id = review.id;
      // 可選：移除臨時 localId 以避免混淆
      if (localReviews[review.productId][index].localId) {
        delete localReviews[review.productId][index].localId;
      }
    } else {
      // 如果不存在，添加新評論
      console.log(`將評論添加到本地存儲中，ID: ${review.id}`);
      localReviews[review.productId].unshift({
        ...review,
        // 確保評論包含正確的時間戳記
        timestamp: review.timestamp instanceof Date 
          ? review.timestamp.toISOString() 
          : (typeof review.timestamp === 'string' ? review.timestamp : new Date().toISOString())
      });
    }
    
    // 保存回 localStorage
    localStorage.setItem('product-reviews', JSON.stringify(localReviews));
    console.log('評論在本地存儲中已更新');
  } catch (error) {
    console.error('更新本地存儲中的評論失敗:', error);
  }
}
// 修正提交按鈕的重複提交問題
// 2. 修改 initRatingSelection 函數，確保只綁定一次事件處理器
function initRatingSelection() {
  const stars = document.querySelectorAll('.rating-input');
  const ratingInput = document.getElementById('review-rating-input');
  
  // 解除之前可能綁定的事件
  stars.forEach(star => {
    star.removeEventListener('click', handleStarClick);
    // 重新綁定點擊事件
    star.addEventListener('click', handleStarClick);
  });
  
  // 星星點擊處理函數
  function handleStarClick() {
    const rating = parseInt(this.getAttribute('data-rating'));
    ratingInput.value = rating;
    
    // 更新星星視覺效果
    stars.forEach((s, index) => {
      if (index < rating) {
        s.className = 'bi bi-star-fill rating-input text-warning';
      } else {
        s.className = 'bi bi-star rating-input';
      }
    });
    
    console.log('評分已選擇:', rating);
  }
  
  // 添加滑鼠懸停效果，增強使用者體驗
  stars.forEach(star => {
    star.addEventListener('mouseover', function() {
      const hoverRating = parseInt(this.getAttribute('data-rating'));
      
      stars.forEach((s, index) => {
        if (index < hoverRating) {
          s.classList.add('text-warning');
        }
      });
    });
    
    star.addEventListener('mouseout', function() {
      const currentRating = parseInt(ratingInput.value) || 0;
      
      stars.forEach((s, index) => {
        if (index >= currentRating) {
          s.classList.remove('text-warning');
        }
      });
    });
  });
  
  // 提交評論表單 - 重要：確保只綁定一次事件
  const reviewForm = document.getElementById('product-review-form');
  if (reviewForm && !reviewForm.hasAttribute('data-event-bound')) {
    // 標記表單已綁定事件，避免重複綁定
    reviewForm.setAttribute('data-event-bound', 'true');
    
    // 移除之前可能綁定的事件
    reviewForm.removeEventListener('submit', handleFormSubmit);
    
    // 添加新的提交事件
    reviewForm.addEventListener('submit', handleFormSubmit);
  }
}
// 在文檔底部添加以下代碼，確保按鈕不會卡在加載狀態
setInterval(function() {
  const submitButton = document.getElementById('product-review-form')?.querySelector('button[type="submit"]');
  if (submitButton && submitButton.disabled && !isSubmitting) {
    console.log('檢測到按鈕卡住，強制重置');
    submitButton.disabled = false;
    submitButton.innerHTML = '提交評論';
  }
}, 5000);
// 修改 handleFormSubmit 函數，確保按鈕狀態始終能重置

function handleFormSubmit(e) {
  e.preventDefault();
  
  // 檢查是否正在提交中
  if (isSubmitting) {
    console.log('提交中，請勿重複點擊');
    return;
  }
  
  // 設置提交標記
  isSubmitting = true;
  
  // 獲取提交按鈕引用
  const submitButton = document.getElementById('product-review-form').querySelector('button[type="submit"]');
  const originalButtonText = submitButton.innerHTML;
  
  // 顯示加載狀態
  submitButton.disabled = true;
  
  // 添加安全超時，確保按鈕不會永遠處於加載狀態
  const safetyTimeout = setTimeout(() => {
    resetButton();
    console.log('提交操作超時，按鈕已重置');
  }, 10); // 10秒後強制重置
  
  const productId = getUrlParameter('id');
  if (!productId) {
    console.error("找不到產品 ID");
    document.getElementById('review-error').textContent = "找不到產品資訊，請重新整理頁面後再試。";
    document.getElementById('review-error').style.display = 'block';
    resetButton();
    clearTimeout(safetyTimeout);
    return;
  }
  
  const name = document.getElementById('reviewer-name').value;
  const email = document.getElementById('reviewer-email').value;
  const title = document.getElementById('review-title').value || '產品評論';
  const content = document.getElementById('review-content').value;
  const rating = parseInt(document.getElementById('review-rating-input').value);
  
  if (rating === 0 || isNaN(rating)) {
    alert('請選擇評分');
    resetButton();
    clearTimeout(safetyTimeout);
    return;
  }
  
  // 創建評論物件
  const reviewData = {
    productId: productId,
    name: name,
    email: email,
    title: title,
    content: content,
    rating: rating,
    timestamp: new Date(),
    localId: 'local_' + Date.now()
  };
  
  // 先保存到本地
  saveReviewToLocalStorage(reviewData);
  
  // 確保不重複添加評論到頁面
  const existingReview = document.querySelector(`[data-review-id="${reviewData.localId}"]`);
  if (!existingReview) {
    addNewReviewToPage(reviewData);
  }
  
  // 嘗試添加到 Firebase
  if (firebaseInitialized) {
    try {
      db.collection('product-reviews').add({
        ...reviewData,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      })
      .then((docRef) => {
        console.log("評論成功添加，ID:", docRef.id);
        
        // 更新本地 ID
        reviewData.id = docRef.id;
        updateReviewInLocalStorage(reviewData);
        
        // 更新 UI
        handleReviewSuccess();
      })
      .catch((error) => {
        console.error("添加評論時出錯:", error);
        document.getElementById('review-error').textContent = "提交評論時發生錯誤，請稍後再試。";
        document.getElementById('review-error').style.display = 'block';
      })
      .finally(() => {
        // 確保按鈕一定會重置
        resetButton();
        clearTimeout(safetyTimeout);
      });
    } catch (e) {
      console.error("Firebase 操作發生異常:", e);
      resetButton();
      clearTimeout(safetyTimeout);
    }
  } else {
    // Firebase 未初始化，直接完成處理
    console.log("Firebase 未初始化，僅使用本地保存");
    handleReviewSuccess();
    resetButton();
    clearTimeout(safetyTimeout);
  }
  
  // 按鈕重置輔助函數
  function resetButton() {
    submitButton.disabled = false;
    submitButton.innerHTML = originalButtonText;
    isSubmitting = false;
  }
}

// 4. 刪除或注釋掉重複定義的 handleReviewSuccess 函數（在文件底部）
// 保留下面這一個版本
function handleReviewSuccess() {
  const reviewForm = document.getElementById('product-review-form');
  const stars = document.querySelectorAll('.rating-input');
  const ratingInput = document.getElementById('review-rating-input');
  
  // 清空表單
  reviewForm.reset();
  
  // 重置星星評分
  stars.forEach(s => {
    s.className = 'bi bi-star rating-input';
  });
  ratingInput.value = 0;
  
  // 顯示成功訊息
  document.getElementById('review-success').style.display = 'block';
  document.getElementById('review-error').style.display = 'none';
  
  // 5秒後隱藏成功訊息
  setTimeout(() => {
    document.getElementById('review-success').style.display = 'none';
  }, 5000);
}

// 5. 移除或注釋掉 initRatingSelection 函數內部的重複函數
// 加載產品詳情
function loadProductDetails() {
  const productId = getUrlParameter('id');
  const category = getUrlParameter('category');
  
  if (!productId || !productsDatabase[productId]) {
    alert('找不到產品資訊！');
    window.location.href = 'index.html#features';
    return;
  }
  
  const product = productsDatabase[productId];
  
  // 更新麵包屑
  document.querySelector('.product-category-bc').textContent = product.categoryName || '產品';
  document.querySelector('.product-name-bc').textContent = product.name;
  
  // 更新產品基本信息
  document.getElementById('product-name').textContent = product.name;
  document.getElementById('product-price').textContent = `$${product.price}`;
  document.getElementById('product-sku').textContent = product.sku;
  document.getElementById('product-rating-display').textContent = `${product.rating} (${product.ratingCount})`;
  document.getElementById('product-short-desc').textContent = product.shortDesc;
  
  // 更新評分
  const ratingContainer = document.querySelector('.product-rating');
  updateStarRating(ratingContainer, product.rating);
  
  // 更新產品特點
  const featuresList = document.getElementById('product-features-list');
  featuresList.innerHTML = '';
  product.features.forEach(feature => {
    const li = document.createElement('li');
    li.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i>${feature}`;
    featuresList.appendChild(li);
  });
  
  // 更新產品圖片
  const mainImage = document.getElementById('main-product-image');
  mainImage.src = product.images[0];
  mainImage.alt = product.name;
  
  const thumbnailsContainer = document.getElementById('product-thumbnails');
  thumbnailsContainer.innerHTML = '';
  
  product.images.forEach((img, index) => {
    const thumbCol = document.createElement('div');
    thumbCol.className = 'col-3';
    
    const thumbImg = document.createElement('img');
    thumbImg.src = img;
    thumbImg.alt = `${product.name} - 圖片 ${index + 1}`;
    thumbImg.className = 'img-fluid product-thumbnail';
    if (index === 0) thumbImg.classList.add('active');
    
    thumbImg.onclick = function() {
      document.querySelectorAll('.product-thumbnail').forEach(thumb => thumb.classList.remove('active'));
      this.classList.add('active');
      mainImage.src = this.src;
    };
    
    thumbCol.appendChild(thumbImg);
    thumbnailsContainer.appendChild(thumbCol);
  });
  
  // 更新詳細描述
  document.getElementById('product-full-desc').innerHTML = product.fullDesc;
  
  // 更新產品規格
  const specsContainer = document.getElementById('product-specs');
  specsContainer.innerHTML = '';
  product.specs.forEach(spec => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${spec.name}:</strong> ${spec.value}`;
    specsContainer.appendChild(li);
  });
  
  // 更新成分表
  const ingredientsList = document.getElementById('ingredients-list');
  ingredientsList.innerHTML = '';
  product.ingredients.forEach(ingredient => {
    const li = document.createElement('li');
    li.textContent = ingredient;
    ingredientsList.appendChild(li);
  });
  
  // 更新使用方法
  document.getElementById('usage-instructions').innerHTML = product.usage;

  // 載入評論
  loadProductReviews(productId);
  
  // 載入相關產品
  loadRelatedProducts(product.relatedProducts);
  
  // 初始化評分選擇功能
  initRatingSelection();
}

// 修復評論載入和顯示邏輯

// 1. 修改 loadProductReviews 函數，確保在 Firebase 失敗時也能載入本地評論
function loadProductReviews(productId) {
  const reviewsContainer = document.getElementById('reviews-container');
  const noReviewsMessage = document.getElementById('no-reviews-message');
  
  // 清空舊評論
  reviewsContainer.innerHTML = '<div class="text-center py-3"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">載入中...</span></div><p class="mt-2">正在載入評論...</p></div>';
  
  // 使用集合來追蹤已處理的評論 ID
  const processedReviewIds = new Set();
  let allReviews = [];
  
  // 首先從本地存儲預加載評論
  preloadLocalReviews();
  
  function preloadLocalReviews() {
    try {
      console.log(`預先讀取 ${productId} 的本地評論...`);
      const localReviews = JSON.parse(localStorage.getItem('product-reviews') || '{}');
      
      if (localReviews[productId] && localReviews[productId].length > 0) {
        console.log(`從本地存儲找到 ${localReviews[productId].length} 條評論`);
        localReviews[productId].forEach(review => {
          if (review.id) {
            processedReviewIds.add(review.id);
          }
          
          allReviews.push({
            ...review,
            timestamp: new Date(review.timestamp),
            source: 'localStorage'
          });
        });
      }
      
      // 然後從 Firebase 讀取評論
      loadFirebaseReviews();
    } catch (error) {
      console.error('讀取本地評論失敗:', error);
      // 繼續讀取 Firebase 評論
      loadFirebaseReviews();
    }
  }
  
  // Firebase 評論讀取函數
  function loadFirebaseReviews() {
    if (!firebaseInitialized) {
      // Firebase 未初始化，直接完成載入
      finalizeMergedReviews();
      return;
    }
    
    console.log(`從 Firebase 讀取 ${productId} 的評論...`);
    db.collection('product-reviews')
      .where('productId', '==', productId)
      .orderBy('timestamp', 'desc')
      .get()
      .then((querySnapshot) => {
        console.log(`Firebase 返回 ${querySnapshot.size} 條評論`);
        
        querySnapshot.forEach(doc => {
          const data = doc.data();
          
          // 檢查這個評論是否已經存在
          if (processedReviewIds.has(doc.id)) {
            return;
          }
          
          processedReviewIds.add(doc.id);
          allReviews.push({
            ...data,
            id: doc.id,
            timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
            source: 'firebase'
          });
        });
        
        // 最後讀取備份數據
        mergeFallbackReviews();
      })
      .catch((error) => {
        console.error("獲取 Firebase 評論錯誤:", error);
        // 繼續使用已預加載的本地評論和備份評論
        mergeFallbackReviews();
      });
  }
  
  // 合併備份評論
  function mergeFallbackReviews() {
    if (fallbackReviews[productId] && fallbackReviews[productId].length > 0) {
      console.log(`從備份數據讀取 ${fallbackReviews[productId].length} 條評論`);
      
      fallbackReviews[productId].forEach(review => {
        if (review.id && processedReviewIds.has(review.id)) {
          return;
        }
        
        const isDuplicate = allReviews.some(r => 
          (review.id && r.id === review.id) ||
          (review.localId && r.localId === review.localId) ||
          (r.email === review.email && r.title === review.title && r.content === review.content)
        );
        
        if (!isDuplicate) {
          allReviews.push({
            ...review,
            source: 'fallback'
          });
        }
      });
    }
    
    // 完成所有來源評論的合併
    finalizeMergedReviews();
  }
  
  // 完成評論合併並顯示  
  function finalizeMergedReviews() {
    console.log(`評論載入完成，總共 ${allReviews.length} 條評論`);
      // 確保所有評論物件有正確的timestamp格式
    allReviews = allReviews.map(review => {
      // 處理timestamp，確保它是Date物件
      if (review.timestamp) {
        if (review.timestamp instanceof Date) {
          // 已經是Date對象，不需處理
        } else if (typeof review.timestamp === 'string') {
          // 處理ISO字符串格式
          review.timestamp = new Date(review.timestamp);
        } else if (review.timestamp && review.timestamp.seconds) {
          // 處理Firestore Timestamp格式
          review.timestamp = new Date(review.timestamp.seconds * 1000);
        } else if (review.timestamp && review.timestamp.toDate && typeof review.timestamp.toDate === 'function') {
          // 處理Firebase Timestamp對象
          review.timestamp = review.timestamp.toDate();
        } else {
          // 無法識別的格式，使用當前時間
          console.warn('無法識別的timestamp格式:', review.timestamp);
          review.timestamp = new Date();
        }
      } else {
        // 沒有timestamp，使用當前時間
        review.timestamp = new Date();
      }

      // 驗證timestamp是否為有效Date對象
      if (!(review.timestamp instanceof Date) || isNaN(review.timestamp.getTime())) {
        console.warn('無效的timestamp轉換結果，使用當前時間:', review.timestamp);
        review.timestamp = new Date();
      }
      
      return review;
    });
    
    // 按時間排序
    allReviews.sort((a, b) => {
      return b.timestamp - a.timestamp; // 降序排序，最新的在前
    });
    
    // 移除可能的重複評論
    const uniqueReviews = [];
    const uniqueIdentifiers = new Set();
    
    allReviews.forEach(review => {
      // 創建唯一標識符
      const identifier = review.id || review.localId || 
        `${review.email}-${review.title}-${review.content}`.replace(/\s+/g, '');
      
      if (!uniqueIdentifiers.has(identifier)) {
        uniqueIdentifiers.add(identifier);
        uniqueReviews.push(review);
      }
    });
    
    // 顯示評論
    if (uniqueReviews.length > 0) {
      displayReviews(uniqueReviews);
      
      // 更新評分統計
      updateReviewStatsUI(uniqueReviews);
    } else {
      // 沒有評論
      reviewsContainer.innerHTML = '';
      if (noReviewsMessage) {
        noReviewsMessage.style.display = 'block';
      } else {
        reviewsContainer.innerHTML = '<div class="text-center py-4">目前還沒有評論，成為第一個留下評論的人吧！</div>';
      }
    }
  }
}
// 修改 displayReviews 函數，移除頭像顯示

function displayReviews(reviews) {
  if (!reviews || reviews.length === 0) {
    console.log("沒有評論可顯示");
    return;
  }
  
  const reviewsContainer = document.getElementById('reviews-container');
  const noReviewsMessage = document.getElementById('no-reviews-message');
  
  if (!reviewsContainer) {
    console.error("找不到評論容器元素");
    return;
  }
  
  // 隱藏「沒有評論」訊息
  if (noReviewsMessage) {
    noReviewsMessage.style.display = 'none';
  }
  
  // 確保清空評論容器
  reviewsContainer.innerHTML = '';
  console.log(`準備顯示 ${reviews.length} 條評論`);
  
  // 顯示評論
  reviews.forEach((review, index) => {
    // 為評論創建唯一 ID
    const reviewId = review.id || review.localId || `review-${Date.now()}-${index}`;
    
    // 創建評論元素
    const reviewElement = document.createElement('div');
    reviewElement.className = 'review-item p-4 border-bottom';
    reviewElement.setAttribute('data-review-id', reviewId);
    
    // 生成星星 HTML
    const starsHTML = Array(5).fill('').map((_, i) => 
      `<i class="bi bi-star${i < review.rating ? '-fill' : ''} text-warning"></i>`
    ).join('');
    
    // 格式化日期
    const reviewDate = formatDateYMD(review.timestamp);
    
    // 設置評論 HTML - 移除頭像部分
    reviewElement.innerHTML = `
      <h4 class="review-title mb-2">${review.title || '很棒的產品'}</h4>
      <div class="d-flex align-items-center mb-2">
        <div class="me-2">
          ${starsHTML}
        </div>
      </div>
      <div class="d-flex align-items-center mb-3">
        <div>
          <div class="reviewer-name fw-medium">${review.name}</div>
          <div class="review-date text-muted">${reviewDate}</div>
        </div>
      </div>
      <p class="review-content">${review.content}</p>
    `;
    
    // 將評論添加到容器
    reviewsContainer.appendChild(reviewElement);
  });
  
  // 評論顯示完成後立即檢查
  setTimeout(() => {
    const newCount = document.querySelectorAll('.review-item').length;
    console.log(`評論顯示完成，頁面上現在有 ${newCount} 條評論`);
  }, 100);
}
// 3. 專門用於同步檢查和修復頁面評論顯示狀態的函數
function checkAndFixReviewsDisplay() {
  const productId = getUrlParameter('id');
  if (!productId) return;
  
  // 檢查本地存儲中的評論
  try {
    const localReviews = JSON.parse(localStorage.getItem('product-reviews') || '{}');
    const reviewsContainer = document.getElementById('reviews-container');
    const displayedCount = document.querySelectorAll('.review-item').length;
    
    // 如果本地有評論但頁面上沒有顯示，嘗試修復
    if (localReviews[productId] && localReviews[productId].length > 0 && displayedCount === 0) {
      console.log('檢測到本地有評論但頁面上沒有顯示，嘗試修復...');
      
      // 清除現有載入提示
      if (reviewsContainer.querySelector('.spinner-border')) {
        reviewsContainer.innerHTML = '';
      }
      
      // 直接顯示本地評論
      displayReviews(localReviews[productId]);
      updateReviewStatsUI(localReviews[productId]);
    }
  } catch (error) {
    console.error('檢查評論顯示狀態失敗:', error);
  }
}

// 改進的跨裝置評論同步機制
document.addEventListener('DOMContentLoaded', function() {
  // 確保 Firebase 初始化完成後再進行評論同步
  let syncAttempts = 0;
  const maxSyncAttempts = 5;
  
  function attemptSyncReviews() {
    if (firebaseInitialized) {
      console.log('Firebase 已初始化，開始同步評論...');
      syncReviewsWithFirebase();
    } else if (syncAttempts < maxSyncAttempts) {
      syncAttempts++;
      console.log(`Firebase 未初始化，${500 * syncAttempts}ms 後重試...`);
      setTimeout(attemptSyncReviews, 500 * syncAttempts);
    } else {
      console.warn('無法初始化 Firebase，將使用本地評論');
    }
  }
  
  // 1秒後嘗試同步，給 Firebase 初始化時間
  setTimeout(attemptSyncReviews, 1000);
});

// 同步 Firebase 和本地評論
function syncReviewsWithFirebase() {
  const productId = getUrlParameter('id');
  if (!productId || !firebaseInitialized) return;
  
  console.log(`開始同步產品 ${productId} 的評論...`);
  
  // 從 Firebase 讀取所有評論
  db.collection('product-reviews')
    .where('productId', '==', productId)
    .get()
    .then((snapshot) => {
      console.log(`從 Firebase 獲取到 ${snapshot.size} 條評論`);
      
      // 獲取當前本地評論
      let localReviews = JSON.parse(localStorage.getItem('product-reviews') || '{}');
      if (!localReviews[productId]) {
        localReviews[productId] = [];
      }
      
      // 記錄已處理的評論 ID
      const processedIds = new Set();
      
      // 處理 Firebase 評論
      snapshot.forEach(doc => {
        const firebaseReview = doc.data();
        const reviewId = doc.id;
        processedIds.add(reviewId);
        
        // 檢查評論是否已在本地存儲中
        const localIndex = localReviews[productId].findIndex(r => 
          (r.id && r.id === reviewId) || 
          (firebaseReview.localId && r.localId === firebaseReview.localId) ||
          (r.email === firebaseReview.email && r.title === firebaseReview.title && r.content === firebaseReview.content)
        );
        
        if (localIndex >= 0) {
          // 更新現有評論，確保有 Firebase ID
          localReviews[productId][localIndex] = {
            ...firebaseReview,
            id: reviewId,
            timestamp: firebaseReview.timestamp && typeof firebaseReview.timestamp.toDate === 'function' 
              ? firebaseReview.timestamp.toDate().toISOString() 
              : (firebaseReview.timestamp ? new Date(firebaseReview.timestamp).toISOString() : new Date().toISOString())
          };
        } else {
          // 添加新評論
          localReviews[productId].push({
            ...firebaseReview,
            id: reviewId,
            timestamp: firebaseReview.timestamp && typeof firebaseReview.timestamp.toDate === 'function' 
              ? firebaseReview.timestamp.toDate().toISOString() 
              : (firebaseReview.timestamp ? new Date(firebaseReview.timestamp).toISOString() : new Date().toISOString())
          });
        }
      });
      
      // 將本地未同步到 Firebase 的評論上傳
      const unsyncedReviews = localReviews[productId].filter(r => !r.id || !processedIds.has(r.id));
      console.log(`發現 ${unsyncedReviews.length} 條未同步的本地評論`);
      
      // 嘗試上傳未同步的評論到 Firebase
      unsyncedReviews.forEach(review => {
        // 避免重複上傳正在處理的評論
        if (review.syncInProgress) return;
        
        review.syncInProgress = true;
        
        // 創建要上傳的評論資料
        const reviewToUpload = {
          ...review,
          productId: productId,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // 移除本地屬性
        delete reviewToUpload.id;
        delete reviewToUpload.syncInProgress;
        
        // 上傳到 Firebase
        db.collection('product-reviews').add(reviewToUpload)
          .then(docRef => {
            console.log(`評論成功上傳到 Firebase，ID: ${docRef.id}`);
            
            // 更新本地評論的 ID
            const idx = localReviews[productId].findIndex(r => 
              r.localId === review.localId || 
              (r.email === review.email && r.title === review.title && r.content === review.content)
            );
            
            if (idx >= 0) {
              localReviews[productId][idx].id = docRef.id;
              delete localReviews[productId][idx].syncInProgress;
              localStorage.setItem('product-reviews', JSON.stringify(localReviews));
            }
          })
          .catch(error => {
            console.error('上傳評論到 Firebase 失敗:', error);
            delete review.syncInProgress;
          });
      });
      
      // 保存更新後的本地評論
      localStorage.setItem('product-reviews', JSON.stringify(localReviews));
      
      // 重新顯示評論
      loadProductReviews(productId);
    })
    .catch(error => {
      console.error('同步評論時發生錯誤:', error);
    });
}

// 處理網絡恢復時的自動同步
window.addEventListener('online', function() {
  console.log('網絡已恢復，嘗試同步評論...');
  if (firebaseInitialized) {
    setTimeout(syncReviewsWithFirebase, 1000);
  }
});

// 當 Firebase 初始化狀態變更時
function onFirebaseStatusChange(isInitialized) {
  if (isInitialized && !firebaseInitialized) {
    firebaseInitialized = true;
    console.log('Firebase 初始化完成，開始同步評論...');
    syncReviewsWithFirebase();
  }
}

// 監控 Firebase 初始化狀態
let firebaseCheckInterval = setInterval(function() {
  if (firebase.apps.length > 0 && db) {
    clearInterval(firebaseCheckInterval);
    firebaseInitialized = true;
    onFirebaseStatusChange(true);
  }
}, 1000);
// 5. 改進檢查評論狀態的函數，可以嘗試修復顯示問題
function checkReviewsStatus() {
  const productId = getUrlParameter('id');
  if (!productId) return;
  
  console.log('======= 評論存儲狀態檢查 =======');
  
  let localStorageReviews = [];
  let fallbackReviewsCount = 0;
  
  // 檢查 fallbackReviews
  if (fallbackReviews[productId]) {
    fallbackReviewsCount = fallbackReviews[productId].length;
    console.log(`fallbackReviews 中有 ${fallbackReviewsCount} 條評論`);
  } else {
    console.log('fallbackReviews 中沒有此產品的評論');
  }
  
  // 檢查 localStorage
  try {
    const localReviews = JSON.parse(localStorage.getItem('product-reviews') || '{}');
    if (localReviews[productId]) {
      localStorageReviews = localReviews[productId];
      console.log(`localStorage 中有 ${localReviews[productId].length} 條評論`);
    } else {
      console.log('localStorage 中沒有此產品的評論');
    }
  } catch (error) {
    console.error('檢查 localStorage 評論失敗:', error);
  }
  
  // 檢查頁面上顯示的評論
  const reviewElements = document.querySelectorAll('.review-item');
  const displayedCount = reviewElements.length;
  console.log(`頁面上顯示了 ${displayedCount} 條評論`);
  
  // 如果本地有評論但頁面上沒有顯示，嘗試修復
  if ((localStorageReviews.length > 0 || fallbackReviewsCount > 0) && displayedCount === 0) {
    console.log('檢測到數據不一致，嘗試修復評論顯示...');
    
    // 使用本地存儲的評論重新顯示
    if (localStorageReviews.length > 0) {
      displayReviews(localStorageReviews);
    } 
    // 如果本地存儲沒有評論但備份數據有，則使用備份數據
    else if (fallbackReviewsCount > 0) {
      displayReviews(fallbackReviews[productId]);
    }
  }
  
  console.log('==============================');
}


// 載入相關產品
function loadRelatedProducts(relatedIds) {
  const container = document.getElementById('related-products-container');
  container.innerHTML = '';
  
  relatedIds.forEach(id => {
    if (productsDatabase[id]) {
      const product = productsDatabase[id];
      
      const productCol = document.createElement('div');
      productCol.className = 'col-lg-3 col-md-6';
      
      productCol.innerHTML = `
        <div class="card product-card h-100">
          <img src="${product.images[0]}" class="card-img-top" alt="${product.name}">
          <div class="card-body">
            <h5 class="card-title">${product.name}</h5>
            <div class="product-rating mb-2">
              ${generateStarsHtml(product.rating)}
              <span class="ms-2">${product.rating} (${product.ratingCount})</span>
            </div>
            <p class="card-text">${product.shortDesc}</p>
            <div class="d-flex justify-content-between align-items-center">
              <span class="price">$${product.price}</span>
              <a href="product-details.html?id=${product.id}&category=${product.category}" class="btn btn-sm btn-primary">了解詳情</a>
            </div>
          </div>
        </div>
      `;
      
      container.appendChild(productCol);
    }
  });
}
// 產生星星 HTML
function generateStarsHtml(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      html += '<i class="bi bi-star-fill"></i>';
    } else if (i <= rating) {
      html += '<i class="bi bi-star-half"></i>';
    } else {
      html += '<i class="bi bi-star"></i>';
    }
  }
  return html;
}
// 當頁面載入完成後，執行初始化
document.addEventListener('DOMContentLoaded', function() {
  // 初始化 AOS 動畫
  AOS.init();
  
  // 載入產品詳情
  loadProductDetails();
});

// 保存評論到本地存儲以確保持久化

function saveReviewToLocalStorage(review) {
  try {
    // 從本地存儲獲取現有評論
    if (!review.productId) {
      console.error('評論沒有產品ID，無法保存');
      return;
    }
    const reviewToSave = {
      ...review,
      timestamp: review.timestamp instanceof Date ? review.timestamp.toISOString() : new Date().toISOString()
    };
    let localReviews = JSON.parse(localStorage.getItem('product-reviews') || '{}');
    
    const productId = review.productId;
    
    // 確保該產品的評論數組存在
    if (!localReviews[productId]) {
      localReviews[productId] = [];
    }
    
    // 檢查評論是否已存在
    // 檢查評論是否已存在 (避免重複)
    const exists = localReviews[review.productId].some(r => 
      (r.localId && r.localId === review.localId) || 
      (r.id && r.id === review.id) ||
      (r.email === review.email && r.content === review.content && r.title === review.title)
    );
    
   if (!exists) {
      console.log(`將評論保存到產品 ${review.productId} 的本地存儲中`);
      localReviews[review.productId].unshift(reviewToSave);
      localStorage.setItem('product-reviews', JSON.stringify(localReviews));
    } else {
      console.log('評論已存在於本地存儲中，不重複添加');
    }
  } catch (error) {
    console.error('保存評論到本地存儲失敗:', error);
  }
}

// 載入本地存儲評論並渲染
function loadReviewsFromLocalStorage() {
  try {
    const localReviews = JSON.parse(localStorage.getItem('product-reviews') || '{}');
    console.log('從本地存儲載入評論:', localReviews);

    Object.keys(localReviews).forEach(productId => {
      if (!fallbackReviews[productId]) {
        fallbackReviews[productId] = [];
      }
      
      localReviews[productId].forEach(review => {
        const exists = fallbackReviews[productId].some(r => 
          (r.localId && r.localId === review.localId) || 
          (r.id && r.id === review.id) ||
          (r.email === review.email && r.title === review.title && r.content === review.content)
        );
        
        if (!exists) {
          fallbackReviews[productId].push(review);
        }
      });
    });

    console.log('已合併本地存儲評論到全局備份:', fallbackReviews);
    
    // 取得當前頁面產品ID
    const productId = getUrlParameter('id');
    if (productId && fallbackReviews[productId] && fallbackReviews[productId].length > 0) {
      displayReviews(fallbackReviews[productId]);
    }
  } catch (error) {
    console.error('載入本地存儲評論失敗:', error);
  }
}

// 改進評論顯示函數
function displayReviews(reviews) {
  const reviewsContainer = document.getElementById('reviews-container');
  const noReviewsMessage = document.getElementById('no-reviews-message');
  
  // 隱藏「沒有評論」訊息
  if (noReviewsMessage) {
    noReviewsMessage.style.display = 'none';
  }
  
  // 清空評論容器
  reviewsContainer.innerHTML = '';
  
  // 顯示評論
  reviews.forEach((review, index) => {
    // 為評論創建唯一 ID
    const reviewId = review.id || review.localId || `review-${Date.now()}-${index}`;
    
    // 創建評論元素
    const reviewElement = document.createElement('div');
    reviewElement.className = 'review-item p-4 border-bottom';
    reviewElement.setAttribute('data-review-id', reviewId);
    reviewElement.style.setProperty('--review-index', index); // 用於動畫
    
    // 生成星星 HTML
    const starsHTML = Array(5).fill('').map((_, i) => 
      `<i class="bi bi-star${i < review.rating ? '-fill' : ''} text-warning"></i>`
    ).join('');
    
    // 格式化日期
    const reviewDate = formatDateYMD(review.timestamp);
    
    // 設置評論 HTML
    reviewElement.innerHTML = `
      <h4 class="review-title mb-2">${review.title || '很棒的產品'}</h4>
      <div class="d-flex align-items-center mb-2">
        <div class="me-2">
          ${starsHTML}
        </div>
      </div>
      <div class="d-flex align-items-center mb-3">
        <div>
          <div class="reviewer-name fw-medium">${review.name}</div>
          <div class="review-date text-muted">${reviewDate}</div>
        </div>
      </div>
      <p class="review-content">${review.content}</p>
    `;
    
    // 將評論添加到容器
    reviewsContainer.appendChild(reviewElement);
  });
  
  // 如果沒有評論，顯示訊息
  if (reviews.length === 0) {
    reviewsContainer.innerHTML = '<div class="text-center py-4">目前還沒有評論，成為第一個留下評論的人吧！</div>';
  }
}

// 改進格式化日期函數，處理各種可能的時間格式
function formatDateYMD(timestamp) {
  try {
    let date;
    
    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (timestamp && timestamp.toDate && typeof timestamp.toDate === 'function') {
      // Firebase Timestamp
      date = timestamp.toDate();
    } else if (timestamp && timestamp.seconds) {
      // Firebase Timestamp 物件但沒有 toDate 方法
      date = new Date(timestamp.seconds * 1000);
    } else if (timestamp && typeof timestamp === 'string') {
      // ISO 字符串
      date = new Date(timestamp);
    } else {
      // 默認使用當前日期
      date = new Date();
    }
    
    // 檢查是否為有效日期
    if (isNaN(date.getTime())) {
      console.warn('無效的日期格式:', timestamp);
      date = new Date(); // 使用當前日期作為後備
    }
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}/${month}/${day}`;
  } catch (error) {
    console.error('格式化日期出錯:', error);
    return new Date().toLocaleDateString('zh-TW');
  }
}

// 檢查評論是否重複的通用函數
function isReviewDuplicate(review, reviewsList) {
  if (!review || !reviewsList) return false;
  
  return reviewsList.some(r => 
    // 透過 ID 檢查
    (review.id && r.id === review.id) ||
    (review.localId && r.localId === review.localId) ||
    // 透過內容比對檢查
    (r.email === review.email && 
     r.content === review.content && 
     r.title === review.title)
  );
}

// 用於調試的函數，檢查評論存儲狀態
function checkReviewsStatus() {
  const productId = getUrlParameter('id');
  if (!productId) return;
  
  console.log('======= 評論存儲狀態檢查 =======');
  
  // 檢查 fallbackReviews
  if (fallbackReviews[productId]) {
    console.log(`fallbackReviews 中有 ${fallbackReviews[productId].length} 條評論`);
  } else {
    console.log('fallbackReviews 中沒有此產品的評論');
  }
  
  // 檢查 localStorage
  try {
    const localReviews = JSON.parse(localStorage.getItem('product-reviews') || '{}');
    if (localReviews[productId]) {
      console.log(`localStorage 中有 ${localReviews[productId].length} 條評論`);
    } else {
      console.log('localStorage 中沒有此產品的評論');
    }
  } catch (error) {
    console.error('檢查 localStorage 評論失敗:', error);
  }
  
  // 檢查頁面上顯示的評論
  const reviewElements = document.querySelectorAll('.review-item');
  console.log(`頁面上顯示了 ${reviewElements.length} 條評論`);
  
  console.log('==============================');
}

// 頁面載入後檢查評論狀態
setTimeout(checkReviewsStatus, 2000);