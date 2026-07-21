/* ============================================
   data.js｜全站資料庫
   ★ 改圖片/文案/價格 → 在這個檔案裡搜尋對應的區塊名稱
   ★ 花曆植物資料不在這裡，在 seasons.js
   ============================================ */

window.DATA = {

    // ========== 你的 Mshop 官網網址（回首頁按鈕用） ==========
    homeUrl: "https://www.rosebox.com.tw",

    // ========== 全站常改資料（票價、電話、餐廳圖片）==========
    // ★ 農場的人最常改這一區
    siteConfig: {
        phone: "08-810-1858",
        shopPhone: "0987-019-118",
        address: "屏東縣九如鄉九如路一段2-88號",
        mapUrl: "https://www.google.com/maps/search/?api=1&query=大花農場",
        facebookUrl: "https://www.facebook.com/ROSEBOXGOOD/",
        mapImage: "https://res.cloudinary.com/daypc93hn/image/upload/v1760079811/park-map-original_in4u4q.jpg",
        halfTicketRule: "學生／65 歲以上／身心障礙（含陪同 1 人）",
        announcement: { enabled: false, text: "" },
        ticket: { full: 200, fullDiscount: 150, half: 100, halfDiscount: 50, freeRule: "身高 120cm 以下孩童" },
        diningImages: [
            "https://i.meee.com.tw/bbEKYrF.webp",   // 餐廳介紹大圓圖
            "https://i.meee.com.tw/pH9AFHE.webp",   // 餐廳介紹右下方圖
            "https://i.meee.com.tw/Es9hQP8.webp",   // 餐廳介紹左上浮動圖
            "https://i.meee.com.tw/krq8ccF.webp"    // 招牌白玉鍋圖
        ]
    },

    // ========== 頁面固定文案（原本寫在 index.html 的可見文字）==========
    pageContent: {
        hero: {
            badge: "Natural Farming Rose Garden",
            title: "屏東九如大花玫瑰休閒農場",
            subtitle: "親子農場・景觀餐廳・生態導覽",
            tagline1: "自然農法・玫瑰五感療癒體驗",
            tagline2: "產地餐桌・手作工坊・生態導覽"
        },
        story: {
            title: "與土地的溫柔對話",
            paragraph1: "不必跋涉深山，在屏東九如的平原上，我們用 17 年養出了一座以自然農法照顧的玫瑰園。",
            paragraph2: "這條路不容易，但為了讓懂生活的您，能擁有一處真正安心的秘境，我們拒絕了所有化學捷徑。",
            paragraph3: "這不只是一趟旅程，更是一次對生活品質的投票。",
            paragraph4: "邀請您放慢腳步，品味這份得來不易的真實。"
        },
        overview: {
            title1: "花一開，",
            title2: "就是出發的理由。",
            description: "一站滿足「吃、玩、學、住」，讓這趟旅行成為您最珍藏的記憶。"
        },
        gallery: { english: "Farm Gallery", title: "捕捉農場光影" },
        seasons: {
            title: "四季花園・生態時序",
            subtitle: "春賞花、夏採果、秋養息、冬嚐鮮",
            calendarEnglish: "Bloom Calendar",
            calendarTitle: "年度花曆",
            calendarHint: "點擊查看 12 個月生態時序"
        },
        ecology: { english: "Ecology & Life", title: "遇見農場的小鄰居" },
        services: {
            english: "Events & Venues",
            title: "多元服務・空間租借",
            lead: "婚禮證婚 ‧ 企業場租 ‧ 生態導覽 ‧ 星空露營",
            description: "在這片寬廣的平原，為您的重要時刻打造專屬舞台。"
        },
        dining: {
            english: "Rose Garden Dining",
            subtitle: "在屏東的艷陽下，來一場「可以吃的玫瑰花」饗宴。",
            cuisineEnglish: "The Art of Rose Cuisine",
            cuisineTitle1: "將清晨的露水與花香，",
            cuisineTitle2: "化作舌尖上的詩篇。",
            cuisineParagraph1: "大花農場不只是玫瑰的故鄉，更是創意料理的實驗室。我們堅持採摘當日清晨香氣濃郁的「自然農法栽培食用玫瑰」入菜。",
            cuisineParagraph2: "玫瑰的清甜與微苦，在主廚手中與屏東在地食材交織。",
            cuisineEmphasis: "原來，花的滋味可以如此富有層次。",
            signatureLabel: "SIGNATURE DISH",
            signatureChoice: "Must-Try Choice",
            optionsTitle: "Dining Options",
            moreEnglish: "More Delicacies",
            moreTitle: "✨ 更多玫瑰創意料理"
        },
        products: { title: "來自風土的獻禮", subtitle: "把屏東的陽光與芬芳帶回家" },
        diy: { title: "體驗・手作 DIY" },
        visitor: {
            english: "Visitor Information",
            title: "參觀資訊",
            mapButton: "Google Map 導航",
            intro1: "適合親子一起走進花園，從玫瑰採摘、手作體驗到生態導覽，依照自己的步調探索農場。",
            intro2: "安排屏東一日遊時，這裡也適合作為其中一站，留一段時間賞花、用餐，再從九如慢慢出發。",
            driveTitle: "開車前往",
            driveDescription: "國道三號九如交流道下，車程約 10 分鐘。",
            transportTitle: "大眾運輸",
            transportOptionA: "方案 A：火車轉乘",
            transportOptionADescription: "搭至屏東火車站，轉搭計程車約 20 分鐘。",
            transportOptionB: "方案 B：屏東客運",
            transportOptionBDescription: "搭乘 8217、8218、8220 至「九如鄉果菜市場」下車，步行約 10–15 分鐘。",
            rulesEnglish: "Service & Rules",
            rulesTitle: "園區服務與須知"
        },
        faq: { english: "Q & A", title: "農場小學堂" },
        contact: {
            english: "Contact Us",
            title: "預約・洽詢・聯繫",
            intro: "無論是訂位用餐、團體導覽、DIY 預約或場地租借，歡迎透過以下方式聯繫我們",
            diningLabel: "餐廳訂位",
            diningNote: "10 人以上建議預約",
            shopLabel: "展售／商品",
            shopNote: "產品諮詢與訂購",
            facebookLabel: "FB 粉專私訊",
            facebookName: "大花玫瑰",
            facebookNote: "導覽・DIY・場地預約"
        },
        footer: { name: "大花農場 Grand Blossom Grange", copyright: "© 2026 All Rights Reserved." }
    },

    // ========== Hero 輪播 ==========
    heroSlides: [
        { image: "https://i.meee.com.tw/crisF2H.webp" },
        { image: "https://i.meee.com.tw/RmAkCjL.webp" },
        { image: "https://i.meee.com.tw/daJBaEH.webp" },
        { image: "https://i.meee.com.tw/fwdmPGN.webp" },
        { image: "https://i.meee.com.tw/46xL6hH.webp" },
        { image: "https://i.meee.com.tw/04BMMlF.webp" }
    ],

    // ========== 三大特色 ==========
    features: [
        { id: "01", titleEn: "Environment", title: "平原上的私房秘境", desc: "無需翻山越嶺，就能抵達這片受到大武山湧泉滋養的淨土。 這是您口袋名單裡的珍寶，寬闊、純淨、隱密。 帶朋友來這裡，展現的是您獨到的選點品味，更是對旅遊品質的堅持。", images: ["https://i.meee.com.tw/RZEteCI.webp","https://i.meee.com.tw/rZ4um7i.webp","https://i.meee.com.tw/GhsxGer.webp","https://i.meee.com.tw/1gxiu1W.webp","https://i.meee.com.tw/Qt4jZdk.webp","https://i.meee.com.tw/tHkwMxb.webp"], reverse: false },
        { id: "02", titleEn: "Lifestyle", title: "極致的純淨標準", desc: "在這裡，您可以收起對農藥的焦慮。 我們堅持草生栽培與生態共生，為的是讓您與孩子能毫無防備地親近土地。 不用煩惱食農教育去哪找，這座生機盎然的農場，就是大自然最生動的教室。", images: ["https://i.meee.com.tw/KUyn0j1.webp","https://i.meee.com.tw/p8BrJVo.webp","https://i.meee.com.tw/eNkqsbz.webp","https://i.meee.com.tw/buFEk4s.webp","https://i.meee.com.tw/OLQB3RA.webp","https://i.meee.com.tw/kxGNIEy.webp"], reverse: true },
        { id: "03", titleEn: "Experience", title: "餐桌上的花海", desc: "賞花，不只在眼底，更在舌尖。 不必碰運氣追花季，我們已將自然農法栽培的食用玫瑰化為市面罕見的創意料理。 這份專為懂吃的您準備的驚喜，請直接入座，用味蕾感受這份奢華的款待。", images: ["https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=1200&q=80","https://images.unsplash.com/photo-1585032226651-759b368d7246?w=1200&q=80","https://images.unsplash.com/photo-1560155016-bd4879ae8f21?w=1200&q=80"], reverse: false }
    ],

    // ========== Bento Grid ==========
    bentoItems: [
        { type: 'big', modal: 'modal-picking', title: '去花田探險', desc: "走在田間，尋找您最喜歡的那朵玫瑰，感受被花香包圍的幸福。", img: "https://i.meee.com.tw/3jGevqB.webp", col: 'md:col-span-2 md:row-span-1', tags: ['#尋找蜜蜂', '#花田漫步'] },
        { type: 'link', link: 'dining', title: '吃一口花香', desc: "品一口全台獨創的「玫瑰花壽司」，味蕾會記得這個味道。", img: "https://i.meee.com.tw/46xL6hH.webp", col: 'md:col-span-1 md:row-span-1', tags: ['#特色蔬食', '#創意料理'] },
        { type: 'info', title: '營業時間', time: '09:00 - 17:00', note: '週一固定公休', col: 'md:col-span-1 md:row-span-1' },
        { type: 'link', link: 'diy', title: '把香味帶回家', desc: "親手煮一罐玫瑰醬，把屏東的陽光封存起來。", img: "https://i.meee.com.tw/BEJHVnh.jpg", col: 'md:col-span-1 md:row-span-1', tags: ['#手作溫度', '#回憶打包'] },
        { type: 'modal', modal: 'modal-tour', title: '食農教育', desc: "在自然農法照顧的田園裡，脫下鞋子，我們一起向自然學習。", img: "https://i.meee.com.tw/4ZOOMP4.jpg", col: 'md:col-span-2 md:row-span-1', tags: ['#自然農法', '#自然教室'] },
        { type: 'closed', title: '星空露營', desc: "我們正打造在星空下入睡的地方", img: "https://i.meee.com.tw/3HB6tCG.webp", col: 'md:col-span-1 md:row-span-1', tags: ['#懶人式'] },
        { type: 'modal', modal: 'modal-corporate', title: '多元場地空間', desc: "戶外有草皮與舞台可辦夢幻婚禮，室內備有投影設備適合會議。滿足您對聚會的所有想像。", img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80", col: 'md:col-span-4 md:row-span-1', tags: ['#戶外婚禮', '#會議空間'] }
    ],

    // ========== 相簿 ==========
    gallery: [
        { title: "綠色走廊", image: "https://i.meee.com.tw/hKBueVG.webp" },
        { title: "藍花藤拱門", image: "https://i.meee.com.tw/8XHHWq5.webp" },
        { title: "玫瑰餐廳外觀", image: "https://i.meee.com.tw/sFttTqo.webp" },
        { title: "戶外客座區", image: "https://i.meee.com.tw/O5R3LpR.webp" },
        { title: "戶外客座區", image: "https://i.meee.com.tw/JBxzD7k.webp" },
        { title: "戶外客座區", image: "https://i.meee.com.tw/IRXWsuH.webp" },
        { title: "玫瑰餐廳外觀", image: "https://i.meee.com.tw/1J4IN3o.webp" },
        { title: "會議室外觀", image: "https://i.meee.com.tw/4vejoRN.webp" },
        { title: "玫瑰餐廳內部", image: "https://i.meee.com.tw/WoyC0rF.webp" },
        { title: "園區入口", image: "https://i.meee.com.tw/5MB264C.webp" }
    ],

    // ========== 四季 ==========
    seasons: [
        { name: '藍花藤季', period: '春季 (2-4月)', desc: '夢幻的「紫色花瀑」在春日甦醒，藍花藤全盛綻放，與全園翠綠交織成最迷人的風景。', image: "https://i.meee.com.tw/8XHHWq5.webp" },
        { name: '綠意走廊', period: '夏季 (5-8月)', desc: '在屏東的艷陽下，長達百公尺的綠色走廊是最涼爽的避風港，感受草木生長最旺盛的生命力。', image: "https://i.meee.com.tw/hKBueVG.webp" },
        { name: '垂枝茉莉', period: '秋季 (9-10月)', desc: '玫瑰正在蓄能，此時由「垂枝茉莉」接棒，潔白如蝶的小花垂墜飛舞，帶動入秋後的輕盈氣息。', image: "https://i.meee.com.tw/Ak3rkQu.webp" },
        { name: '冬日玫瑰', period: '冬季 (11-1月)', desc: '大花玫瑰回歸的主場。微涼季節，品嚐第一波以自然農法栽培的鮮採玫瑰，體驗品質最高雅的芬芳。', image: "https://i.meee.com.tw/daJBaEH.webp" }
    ],

    // ========== 生態 ==========
    eco: [
        { name: "綠繡眼寶寶", desc: "枝頭精靈", image: "https://i.meee.com.tw/D3O9J9j.jpg", rarity: "稀有" },
        { name: "鑲邊尖粉蝶", desc: "喜歡在陽光充足的花叢間飛舞", image: "https://i.meee.com.tw/FCW3Jif.webp", rarity: "春夏" },
        { name: "擬幻蛺蝶", desc: "昆蟲界的偽裝大師！", image: "https://i.meee.com.tw/xreylkv.webp", rarity: "常見" },
        { name: "黑冠麻鷺", desc: "草地上的「木頭人」", image: "https://i.meee.com.tw/ieWS8d9.webp", rarity: "全年" },
        { name: "澤蛙", desc: "用皮膚呼吸的牠對環境最挑剔", image: "https://i.meee.com.tw/AbWzB3i.webp", rarity: "常見" },
        { name: "蜜蜂", desc: "農場最嚴格的食安檢驗員！", image: "https://i.meee.com.tw/oFNE2ot.webp", rarity: "全年" }
    ],

    // ========== 服務 ==========
    services: [
        { modal: 'modal-picking', title: '自然農法玫瑰採摘體驗', price: '按朵計算', img: "https://i.meee.com.tw/GgCVgJR.webp", desc: "親手摘下晨曦綻放、以自然農法栽培的玫瑰。", tags: ['🌹 每日開放'] },
        { modal: 'modal-wedding', title: '玫瑰莊園・戶外婚禮', price: '$78,000/場', img: "https://i.meee.com.tw/XEXIaZY.webp", desc: "屏東最美的西式證婚場地。", tags: ['💍 證婚/宴客'], facts: ['👥 最多 300 人', '⏱️ 當日 8–20 時場佈', '🚚 隔日 8–12 時撤場'] },
        { modal: 'modal-tour', title: '五感療癒・生態導覽', price: '$1,500/導覽員', img: "https://i.meee.com.tw/nooP50M.webp", desc: "關於土地的生命課程。", tags: ['🌿 團體導覽'], facts: ['⏱️ 30 分鐘', '👥 15–30 人'] },
        { modal: 'modal-corporate', title: '多元場地租借', price: '專人報價', img: "https://i.meee.com.tw/CFK48OM.webp", desc: "企業訓練、抓週派對。", tags: ['🎤 視聽設備'], facts: ['⏱️ 上午 08–12 時', '⏱️ 下午 13–16 時', '👥 人數請洽詢'] },
        { status: 'coming-soon', modal: 'modal-camping-teaser', title: '玫瑰星空露營', price: '籌備中', img: "https://i.meee.com.tw/oqSBjjN.webp", desc: "屏東平原的星空秘境。在玫瑰花香中入睡，即將實現。", tags: ['⛺ Coming Soon'] }
    ],

    // ========== 餐廳主文案 ==========
    diningContent: {
        ticketNotice: "餐廳位於園區內，用餐需購買入園門票；全票 $200 折抵 $150，半票 $100 折抵 $50。",
        signatureTitle: "招牌玫瑰白玉鍋",
        signatureEnglish: "Rose Soy Milk Hot Pot",
        signatureDescription1: "選用屏東在地鮮磨的濃郁豆漿作為基底，僅保留豆類最原始的清甜。",
        signatureDescription2: "您可以親手將清晨現採的「大花玫瑰」花瓣撒入。遇熱瞬間釋放的清香與豆香融合，交織成奢華的療癒滋味。",
        highlight1Title: "醇厚豆漿底",
        highlight1Description: "高蛋白健康基底",
        highlight2Title: "現採大花玫瑰",
        highlight2Description: "當日鮮採自然農法玫瑰",
        groupNotice: "※ 團體用餐與 Buffet 請務必提前來電預約。"
    },

    // ========== 餐飲 ==========
    diningOptions: [
        { title: '自主單點', img: 'https://i.meee.com.tw/04BMMlF.webp', desc: '隨心挑選多道玫瑰創意料理，適合品味獨到的您。', price: '依菜單計價', type: 'basic' },
        { title: '4人歡聚套餐', img: 'https://i.meee.com.tw/6A1A4IN.webp', desc: '精選農場核心「玫瑰入菜」精華，一次品嚐經典風味。', price: '$2,400', subPrice: '/ 套', type: 'recommend', modal: 'modal-set-meal' },
        { title: '春節團圓套餐', img: 'https://i.meee.com.tw/Ry43uYS.webp', desc: '新春限定！4人家庭首選，主廚特製年節玫瑰饗宴。', price: '$3,600', subPrice: '/ 套', type: 'basic', modal: 'modal-cny' },
        { title: '20人主廚派對 Buffet', img: 'https://i.meee.com.tw/WDUHpVG.webp', desc: '適合企業團體、家族聚會。提供玫瑰創意料理與在地食材饗宴。', price: '$880', subPrice: 'up / 人', type: 'basic', modal: 'modal-buffet' }
    ],
    food: [
        { modal: 'modal-food-sushi', name: '玫瑰花壽司', desc: '以花瓣包裹酸甜醋飯', image: "https://i.meee.com.tw/46xL6hH.webp" },
        { modal: 'modal-food-pizza', name: '手作玫瑰披薩', desc: '薄脆餅皮鋪上獨家花醬', image: "https://i.meee.com.tw/GxDfCdj.webp" },
        { modal: 'modal-food-chicken', name: '秘製古早味烤雞', desc: '選用在地黑羽土雞', image: "https://i.meee.com.tw/P14fNQG.webp" }
    ],

    // ========== DIY ==========
    diy: [
        { enabled: true, modal: 'modal-diy-jam', name: "玫瑰花醬DIY", price: "$250/人", tag: "?分鐘", group: "15人成團", image: "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=600&q=80" },
        { enabled: true, modal: 'modal-diy-dye', name: "花壽司DIY", price: "$320/人", tag: "?分鐘", group: "15人成團", image: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&q=80" },
        { enabled: true, modal: 'modal-diy-distill', name: "手作花禮DIY", price: "$999/人", tag: "?分鐘", group: "5-10人", image: "https://images.unsplash.com/photo-1612217430626-996e9e32e004?w=800&q=80" },
        { enabled: true, modal: 'modal-diy-tea', name: "手作香氛磚", price: "$350/人", tag: "?分鐘", group: "5-10人", image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80" },
        { enabled: false, modal: '', name: '', price: '', tag: '', group: '', image: '' },
        { enabled: false, modal: '', name: '', price: '', tag: '', group: '', image: '' },
        { enabled: false, modal: '', name: '', price: '', tag: '', group: '', image: '' },
        { enabled: false, modal: '', name: '', price: '', tag: '', group: '', image: '' }
    ],

    // ========== 伴手禮 ==========
    products: [
        { name: "玫瑰多酚", desc: "花青素含量為紅葡萄的 22 倍", image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&q=80" },
        { name: "玫瑰精露", desc: "整朵玫瑰蒸餾的純淨精華", image: "https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=600&q=80" },
        { name: "玫瑰花醬", desc: "保留每片花瓣的手工熬製", image: "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=600&q=80" },
        { name: "玫瑰花茶", desc: "低溫慢焙鎖住清晨芬芳", image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=80" }
    ],

    // ========== 電梯導覽 ==========
    navItems: [
        { id: 'dining', name: '玫瑰餐廳', icon: '🍽️', color: '#b5803a' },
        { id: 'info', name: '參觀資訊', icon: '🎫', color: '#3a5a40' },
        { id: 'diy', name: '手作體驗', icon: '🎨', color: '#5a8a7a' },
        { id: 'contact', name: '聯繫我們', icon: '📞', color: '#7a6a9a' },
        { id: 'seasons', name: '花曆花況', icon: '🌹', color: '#d06765' },
        { id: '_home_', name: '回官網首頁', icon: '🏠', color: '#2c3e50' }
    ],

    // ========== FAQ ==========
    qa: {
        infoIcons: [
            { icon: "🅿️", title: "免費停車", text: "腹地寬廣，遊覽車可停" },
            { icon: "🐕", title: "寵物友善", text: "繫牽繩或推車即可入園" },
            { icon: "🍽️", title: "餐廳須知", text: "收現金 / LinePay" },
            { icon: "🚫", title: "禁帶外食", text: "餐廳禁帶外食 (嬰兒食除外)" },
            { icon: "🛍️", title: "展售付款", text: "接受 現金 / 信用卡" },
            { icon: "🌹", title: "採花體驗", text: "免預約 / 現場按朵計費" },
            { icon: "👶", title: "親子友善", text: "備有尿布台 / 推車友善" },
            { icon: "🦟", title: "貼心服務", text: "提供防蚊液 / 簡易急救箱" },
            { icon: "📞", title: "餐廳訂位", text: "散客採現場候位，10人以上建議預約<br><span style='font-size:0.85em;color:#999'>(連假無訂位服務)</span>" }
        ],
        categories: [
            { id: "park", name: "入園與票務", list: [
                { q: "營業時間與公休日？", a: "09:00–17:00；每週一公休。" },
                { q: "是否需門票？", type: "table", rows: [
                    { label: "全票", value: "$200", note: "折抵 $150" },
                    { label: "半票", value: "$100", note: "折抵 $50（學生/65歲以上/身心障礙）" },
                    { label: "免費", value: "120cm 以下孩童", note: "" }
                ] },
                { q: "折抵範圍？", a: "門票折抵券可用於玫瑰餐廳、展售室等園區消費。" },
                { q: "支付方式？", type: "table", rows: [
                    { label: "售票處", value: "現金", note: "" },
                    { label: "展售室", value: "現金、信用卡", note: "" },
                    { label: "玫瑰餐廳", value: "現金、LINE Pay", note: "" }
                ] },
                { q: "團體入園？", a: "團體票價與行程安排請洽專人 (08-810-1858)。" },
                { q: "有無預購票？", a: "目前無販售預購票，請於現場購票入園。" },
                { q: "屏東一日遊怎麼安排大花農場？", a: "建議預留 2–3 小時，依序參觀花園、參加生態導覽或 DIY，再到玫瑰餐廳用餐；可與屏東九如及周邊行程串聯，出發前請先確認營業時間與活動預約狀況。" }
            ]},
            { id: "traffic", name: "交通與停車", list: [
                { q: "停車方便嗎？", a: "園區提供免費停車場(約30-50台)，遊覽車亦可駛入停放。" },
                { q: "大眾運輸怎麼來？", a: "至屏東火車站轉乘計程車(約20分)；或搭屏東客運至「九如鄉果菜市場」站步行。" },
                { q: "計程車/Uber好叫嗎？", a: "九如地區叫車狀況依時段而定，建議回程預先安排或請櫃台協助。" },
                { q: "導航提醒？", a: "導航路線持續優化中，建議依 Google Maps 最新指引行駛。" }
            ]},
            { id: "picking", name: "玫瑰採摘", list: [
                { q: "採花需要預約嗎？", a: "不需要。請直接至展售室領取籃子即可入園體驗。" },
                { q: "採摘費用？", a: "每朵 NT$20。" },
                { q: "可以只拍照不採嗎？", a: "可以！歡迎在花田步道間拍照，但請勿折損花枝。" },
                { q: "玫瑰可以吃嗎？", a: "可以。我們採自然農法管理，並選用食用玫瑰品種。" },
                { q: "雨天可以採花嗎？", a: "可採，但田間可能泥濘，建議依現場狀況評估。" },
                { q: "可否整枝帶走？", a: "僅採花朵，枝條不可帶走。" }
            ]},
            { id: "diy", name: "DIY體驗", list: [
                { q: "有哪些 DIY 項目？", a: "玫瑰花醬、玫瑰壽司、手作花禮等。詳細內容請參考 DIY 方案。" },
                { q: "需要預約嗎？", a: "DIY 以團體報名為主，散客可現場詢問是否有開課。" },
                { q: "最低開課人數？", a: "通常為 25 人，容納人數約 40-50 人。" },
                { q: "所需時間？", a: "約 1-2 小時，視項目而定。" }
            ]},
            { id: "kids", name: "親子友善", list: [
                { q: "大花農場適合帶小孩嗎？", a: "適合。園區有寬敞草地、玫瑰採摘、DIY 與生態導覽，並設有哺乳室及尿布台；身高 120cm 以下孩童免費入園。雨後部分區域可能濕滑，請留意腳步。" },
                { q: "可以推推車嗎？", a: "園區可推行；雨後部分區域可能較濕滑，請留意。" },
                { q: "有無哺乳室？", a: "有，園區設有哺乳室與尿布台。" },
                { q: "有無遊樂設施？", a: "無固定大型遊具，但有寬敞草地與足球框可活動。" },
                { q: "免費入園標準？", a: "身高 120cm 以下孩童免費入園。" }
            ]},
            { id: "dining", name: "玫瑰餐廳", list: [
                { q: "吃飯需要買門票嗎？", a: "需要。玫瑰餐廳位於園區內，用餐須購買入園門票；全票 NT$200 可折抵 NT$150，半票 NT$100 可折抵 NT$50，折抵券可用於玫瑰餐廳、展售室等園區消費。" },
                { q: "需要訂位嗎？", a: "10 人以上建議訂位；散客採現場候位。" },
                { q: "禁帶外食規範？", a: "餐廳禁止攜帶外食與飲料（嬰兒副食品除外）。" },
                { q: "有素食嗎？", a: "有！提供多款蛋奶素與全素的主餐及火鍋。" },
                { q: "用餐時間限制？", a: "尖峰時段依現場公告，通常為 90 分鐘。" },
                { q: "過敏資訊？", a: "菜單皆清楚標示過敏原，點餐時請告知服務人員。" }
            ]},
            { id: "rental", name: "場地租借", list: [
                { q: "租借時段？", a: "08:00–12:00；13:00–16:00。費用請電洽報價。" },
                { q: "提供哪些設備？", a: "桌椅、冷氣、投影設備、音響麥克風、白板等。" },
                { q: "可加購項目？", a: "可安排飲料、餐點、DIY、導覽等服務。" }
            ]},
            { id: "safety", name: "安全規範", list: [
                { q: "園區是否禁菸？", a: "是的，園區全面禁菸。" },
                { q: "雷雨避難？", a: "有室內空間可供避雨。" }
            ]},
            { id: "camping", name: "露營住宿", list: [
                { q: "露營區開放了嗎？", a: "目前星空露營區仍在籌備中，開放時間請以官網公告為準。" }
            ]}
        ]
    }

}; // END window.DATA
