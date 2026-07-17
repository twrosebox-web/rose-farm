# CLAUDE.md — 大花農場體驗頁專案規則

## 專案是什麼
屏東九如「大花農場」（玫瑰盒子 / Grand Blossom Grange）的農場體驗頁。
純靜態多檔案網站，目標部署到 GitHub Pages，作為 Mshop 官網（https://www.rosebox.com.tw）的外掛體驗頁。
角色定位：回答外地遊客出發前的所有問題（票價、交通、餐廳、DIY、FAQ），並承接關鍵字廣告的落地流量。

## 檔案結構（不要打破）
- `index.html`：所有 section 的 HTML 骨架，Tailwind CDN + Noto 字型
- `css/style.css`：全域樣式
- `js/data.js`：★ 全站資料庫（票價、電話、文案、圖片、FAQ）——改內容只動這裡
- `js/data-modals.js`：彈窗內容資料
- `js/` 其餘模組：每支負責一個 section 的渲染（hero / bento / gallery / seasons / dining / diy / info-faq…）
- **index.html 底部的 `<script>` 載入順序不可更動**（data → data-modals → modal → 其他）

## 品牌紅線（違反 = 法律風險，最高優先）
- 全農場只能寫「**自然農法**」，**不可**籠統宣稱「有機」「有機農場」「有機玫瑰園」「Organic Farm」
- 只有兩項產品可標示有機：**有機玫瑰精露**、**給麗U 高麗菜粉**（UCS 采園有機驗證）
- 任何出現「有機」二字的文案，修改前先列出清單給使用者確認，不可自行決定去留

## 文案與語言
- 一律繁體中文；可見文字使用全形標點（，。？！：（））
- CSS 值、JS 語法、URL 內保持半形
- 電話格式統一：08-810-1858 / 0987-019-118
- 已知待修資料：DIY 時長「?分鐘」為佔位符；成團人數多處不一致（卡片 15 人 vs FAQ 25 人）——以使用者提供的最終數字為準，不可自行猜測

## SEO 原則（來自關鍵字策略）
- 目標字：屏東景點、屏東餐廳、屏東親子、生態導覽、DIY——不是品牌字
- 關鍵資訊必須是**靜態可見文字**：modal 內的價格 / 人數 / 時長要同步出現在卡片可見處
- `<title>` 與 H1 需含地名與類別詞（屏東九如、景觀餐廳、親子農場）
- 靜態 HTML 內維護 JSON-LD（TouristAttraction + Restaurant + FAQPage）
- 餐廳區塊內必須有門票提示：「用餐需購票入園，門票 $200 可折抵 $150 園區消費」

## Modal / Overlay 行為規範
- 關閉判定用 mousedown + mouseup 雙重確認（兩者都落在遮罩上才關），防止反白文字拖出時誤關
- 所有 overlay 支援 ESC 關閉

## 未來 Sheet 後台（Apps Script）鐵律
- 資料按 key 分行存（一欄位一行 + 獨立 updatedAt），**禁止**整包 JSON 塞單一 cell
- GET 用 JSONP 繞 CORS；POST 才用 fetch
- 部署設定：執行身分「我自己」、存取權限「所有人」
- 雲端 pull 完成後，若 `window.getSelection().toString().length > 0` 或正在輸入，不觸發 renderAll
- 計時類功能一律用時間戳（Date.now() - startTs）計算，setInterval 只負責更新畫面

## 工作方式
- 小步提交：一個 commit 只做一件事，訊息用中文寫清楚改了什麼
- 每次改動後在本地瀏覽器驗證（`python3 -m http.server 8000`）再提交
- 不確定是刻意設計還是 bug 時，先問使用者，不要直接「修好」
- 依 PLAN.md 分階段執行，完成一階段停下來等驗收
