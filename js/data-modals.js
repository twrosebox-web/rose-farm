/* ============================================
   data-modals.js｜Modal 彈窗內容
   ★ 改彈窗文案/圖片 → 搜尋對應的 modal key（如 modal-tour）
   ★ 新增彈窗 → 在最下面加一筆，格式參考既有的
   ============================================ */

window.DATA.modalContent = {
    'modal-tour': { layout: 'rich', title: "五感療癒・生態導覽", sub: "Eco Farm Walk", tags: ["團體預約", "食農教育"], stats: [{ icon: "⏱️", label: "時長", value: "30分鐘" }, { icon: "👥", label: "人數", value: "15-30人" }, { icon: "💰", label: "費用", value: "$1,500/員" }], desc: "這是一堂在大自然裡的輕鬆散步課。<br>導覽員將帶您走進田埂，解說大花農場如何透過「草生栽培」養出健康的土地。沿途介紹：<b>「這是桑葚、那是...」</b>，邀請您用手摸摸看葉子的觸感、聞聞看花草的香氣。", highlights: ["自然農法介紹", "田間蔬果辨識", "五感體驗"], images: [{ src: "https://i.meee.com.tw/cq1hITH.webp", caption: "導覽員解說生態農法" }, { src: "https://i.meee.com.tw/hDljGHT.webp", caption: "近距離觀察玫瑰" }, { src: "https://i.meee.com.tw/8odoq13.webp", caption: "小朋友開心的採摘" }, { src: "https://i.meee.com.tw/ZapZhkF.webp", caption: "農場生態解說" }, { src: "https://i.meee.com.tw/a5mt0iu.webp", caption: "認識香草植物" }] },

    'modal-camping-teaser': { layout: 'teaser', image: "https://i.meee.com.tw/iC10KZJ.webp", title: "預約一場未來的夢", sub: "Coming Soon", desc: "我們正在屏東的星空下，為您搭建一座最靠近玫瑰的家。<br><br>沒有鬧鐘，只有晨曦與花香。<br>不用裝備，只要帶著想放鬆的心。<br><br>玫瑰莊園星空露營區，全區養護籌備中。<br>將於近期開放，敬請期待。" },

    'modal-picking': { layout: 'rich', title: "自然農法玫瑰採摘", tags: ["親子"], stats: [{ icon: "🕒", label: "開放", value: "09-16時" }, { icon: "⚖️", label: "費用", value: "20元/朵" }, { icon: "🌹", label: "品種", value: "大花玫瑰" }], desc: "戴上斗笠、提起竹籃，親手摘下清晨以自然農法栽培的玫瑰。這是與土地最親密的接觸。", highlights: ["現採現算", "採花不採枝", "帶回家泡花茶、入料理"], images: ["https://i.meee.com.tw/wSB3Ewd.webp","https://i.meee.com.tw/whdCubC.webp","https://i.meee.com.tw/5ETxYoD.webp","https://i.meee.com.tw/KWcf357.webp","https://i.meee.com.tw/JPyCKoC.webp"] },

    'modal-wedding': { layout: 'rich', title: "戶外婚禮・草地派對", sub: "Outdoor Wedding & Party", tags: ["草地&舞台包場", "寵物友善", "可明火"], stats: [{ icon: "💰", label: "包場費", value: "$78,000" }, { icon: "👥", label: "容納", value: "300人" }, { icon: "➕", label: "選購", value: "豐富配套" }], desc: "在大武山的見證下，無論是<b>夢幻婚禮</b>還是<b>狂歡草地派對</b>，這裡都是您的最佳主場。我們提供寬敞的草地、舞台與基礎燈光，採「場域開放」模式，讓您自由發揮創意。<br><br>這裡<b>歡迎寵物、可舉辦烤肉晚會</b>。除了場地租借，我們更提供<b>多樣化的加購配套服務</b>（餐飲、佈置、活動企劃等），讓您能依照預算與需求，靈活打造專屬活動。", highlights: ["超充裕時段 (當日8時-20時場佈 - 隔日8時-12時撤場)", "開放外食、酒精、寵物與營火", "場地需復原並帶走垃圾 (亦可付費代清)"], images: ["https://i.meee.com.tw/XEXIaZY.webp","https://i.meee.com.tw/iO3pxqC.webp","https://i.meee.com.tw/Epty58S.webp","https://i.meee.com.tw/ryD6UFn.webp","https://i.meee.com.tw/MqDu183.webp","https://i.meee.com.tw/e3F3ZH9.webp","https://i.meee.com.tw/3fnAQlb.webp","https://i.meee.com.tw/kPnSL0K.webp"] },

    'modal-corporate': { layout: 'rich', title: "多元會議空間租借", sub: "Space Rental", tags: ["企業會議", "教育訓練", "講座包場"], stats: [{ icon: "🕒", label: "時段", value: "08-12 / 13-16" }, { icon: "🎤", label: "設備", value: "投影音響白板" }, { icon: "📞", label: "費用", value: "專人報價" }], desc: '專為企業與團體打造的舒適空間，提供 <b>上午 (08:00-12:00)</b> 與 <b>下午 (13:00-16:00)</b> 兩大彈性時段。<br><br><b>✅ 空間與硬體規格：</b><br>提供桌椅、冷氣、獨立廁所。會議設備包含：投影機 (含布幕/轉接頭/投影筆)、音響麥克風、白板 (含筆)，讓您只需攜帶電腦即可開始會議。<br><br><b>➕ 加值服務 (需預約)：</b><br>可客製化安排餐飲、飲料、園區生態導覽或 DIY 課程，讓活動更豐富。', highlights: ["綠意環繞、採光極佳的舒壓空間", "可結合生態導覽與手作體驗", "彈性半日/全日租借方案"], images: ["https://i.meee.com.tw/LbfC8vq.webp","https://i.meee.com.tw/08nAsWS.webp","https://i.meee.com.tw/Yd4Zdv1.webp","https://i.meee.com.tw/NRd8SRK.webp"] },

    'modal-diy-jam': { layout: 'rich', title: "玫瑰花醬 DIY", sub: "Rose Jam", tags: ["手作", "美食"], stats: [{ icon: "⏱️", label: "時長", value: "?分鐘" }, { icon: "💰", label: "費用", value: "$250/人" }, { icon: "👥", label: "成團", value: "15人" }], desc: "親手揉製鮮採玫瑰花瓣，體驗將花香封存進罐中的療癒過程。", highlights: ["選用可食用級玫瑰", "無化學添加物", "包含精美玻璃瓶"], images: ["https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=600&q=80"] },

    'modal-diy-dye': { layout: 'rich', title: "花壽司 DIY", tags: ["親子", "料理"], stats: [{ icon: "⏱️", label: "時長", value: "?分鐘" }, { icon: "💰", label: "費用", value: "$320/人" }, { icon: "🍙", label: "成團", value: "15人" }], desc: "將自然農法栽培的食用玫瑰花瓣融入壽司米中，捲出色彩繽紛的創意花壽司。", highlights: ["食用花入菜", "清爽低卡料理", "適合親子同樂"], images: ["https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&q=80"] },

    'modal-diy-distill': { layout: 'rich', title: "手作花禮 DIY", tags: ["花藝", "設計"], stats: [{ icon: "⏱️", label: "時長", value: "?分鐘" }, { icon: "💰", label: "費用", value: "$999/人" }, { icon: "💐", label: "人數", value: "5-10人" }], desc: "由專業花藝師指導，親手設計獨一無二的精緻花禮。", highlights: ["專業花藝指導", "頂級花材選用", "附贈禮盒包裝"], images: ["https://images.unsplash.com/photo-1612217430626-996e9e32e004?w=800&q=80"] },

    'modal-diy-tea': { layout: 'rich', title: "手作香氛磚", tags: ["香氛", "療癒"], stats: [{ icon: "⏱️", label: "時長", value: "40分鐘" }, { icon: "💰", label: "費用", value: "$350/人" }, { icon: "🕯️", label: "人數", value: "5-10人" }], desc: "將天然大豆蠟與純精油融合，點綴乾燥玫瑰花苞與葉材。", highlights: ["天然環保大豆蠟", "客製化花材排列", "居家香氛小物"], images: ["https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80"] },

    'modal-cny': { layout: 'rich', title: "春節 4人團圓餐", tags: ["春節限定"], stats: [{ icon: "🍽️", label: "份量", value: "4人" }, { icon: "📅", label: "供應", value: "春節期間" }, { icon: "🧧", label: "特色", value: "年節大菜" }], desc: "主廚特製年節饗宴，融合玫瑰花香與在地食材。", highlights: ["忘不了口水雞","玫瑰花壽司","玫瑰肉燥飯","玫瑰囍三拼","玫瑰雙拼PIZZA","玫瑰虎斑魚","玫瑰蕃茄豬肉暖鍋","芳香萬壽玫瑰茶（冰/熱）","招待四人份玫瑰甜點"], images: ["https://i.meee.com.tw/WDUHpVG.webp","https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80"] },

    'modal-set-meal': { layout: 'rich', title: "4人歡聚套餐", tags: ["超值"], stats: [{ icon: "🍲", label: "份量", value: "4人份" }, { icon: "💰", label: "價格", value: "$2,400" }, { icon: "👍", label: "推薦", value: "首次必點" }], desc: "精選農場核心「玫瑰入菜」精華，一次滿足味蕾。", highlights: ["忘不了口水雞","玫瑰花壽司","蔬菜煎餅","玫瑰肉燥飯","綜合炸物","玫瑰雙拼pizza","玫瑰香腸","蔬食洋春捲","萬壽玫瑰花茶（壺）","玫瑰昆布豚肉暖心鍋"], images: ["https://i.meee.com.tw/6A1A4IN.webp","https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80"] },

    'modal-buffet': { layout: 'rich', title: "主廚派對 Buffet", sub: "25人起團體限定", tags: ["團體聚餐", "客製菜單"], stats: [{ icon: "🍽️", label: "菜色", value: "15道以上" }, { icon: "👥", label: "人數", value: "25-100人" }, { icon: "🕒", label: "預約", value: "7天前" }], desc: "為您的團體量身打造的玫瑰饗宴！", highlights: ["從菜單單點料理任選"], images: ["https://images.unsplash.com/photo-1555244162-803834f70033?w=1200&q=80","https://images.unsplash.com/photo-1544025162-d76690b6d015?w=800&q=80"] },

    'modal-food-sushi': { layout: 'simple', title: "玫瑰花壽司", desc: "以花瓣包裹酸甜醋飯。", images: ["https://i.meee.com.tw/46xL6hH.webp"] },
    'modal-food-pizza': { layout: 'simple', title: "手作玫瑰披薩", desc: "薄脆餅皮佐獨家花醬。", images: ["https://i.meee.com.tw/GxDfCdj.webp"] },
    'modal-food-chicken': { layout: 'simple', title: "秘製古早味烤雞", desc: "選用在地黑羽土雞。", images: ["https://i.meee.com.tw/P14fNQG.webp"] }
};
