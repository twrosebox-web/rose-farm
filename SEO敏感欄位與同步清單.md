# SEO 敏感欄位與同步清單

> 用途：這些內容同時存在「雲端後台（會變）」與「index.html 靜態版（不會變，搜尋引擎讀的）」兩處。
> 改雲端後，畫面會更新，但靜態版仍是舊值 → 搜尋結果、Google 摘要、無 JS 備援會顯示錯誤資訊。
> **改到下列任何一項，務必同步更新 index.html 對應的靜態內容。**

分級：
- 🔒 **唯讀**：一般農場人員視圖隱藏／鎖定，需改時找工程一起改（極少變動，改錯傷 SEO/品牌）。
- ⚠ **可改＋警告**：允許後台改，但欄位掛「改此欄需同步靜態頁」提示，走下方 checklist。

---

## 一、票價 ⚠ 可改＋警告

| 雲端 key | 目前值 | 需同步的靜態位置 |
|---|---|---|
| `siteConfig.ticket.full` | 200 | JSON-LD 全票 offer、noscript FAQ「是否需門票／吃飯需要買門票嗎」、`#dining-ticket-notice` |
| `siteConfig.ticket.fullDiscount` | 150 | 同上 |
| `siteConfig.ticket.half` | 100 | JSON-LD 半票 offer、noscript FAQ |
| `siteConfig.ticket.halfDiscount` | 50 | 同上 |
| `siteConfig.ticket.freeRule` | 身高 120cm 以下孩童 | JSON-LD 免費 offer、noscript FAQ |
| `siteConfig.halfTicketRule` | 學生／65 歲以上／身心障礙… | JSON-LD 半票 offer description |

## 二、FAQ ⚠ 可改＋警告

| 雲端 key | 內容 | 需同步的靜態位置 |
|---|---|---|
| `qa.categories.*.list.*.q` | 所有 FAQ 題目 | JSON-LD `FAQPage.mainEntity[].name` |
| `qa.categories.*.list.*.a` | 所有 FAQ 答案 | JSON-LD `FAQPage.mainEntity[].acceptedAnswer.text`、`#render-qa-grid` 內的 9 個 noscript `<article>` |

> 提醒：靜態備援目前是固定 9 題。若後台新增/刪除 FAQ，題數會對不上，需一併調整 index.html 的 JSON-LD 與 noscript 區塊。

## 三、營業時間 ⚠ 可改＋警告

| 雲端 key | 內容 | 需同步的靜態位置 |
|---|---|---|
| `bentoItems.*.time`（type:info 那格） | 09:00–17:00 | JSON-LD `openingHoursSpecification`（TouristAttraction + Restaurant 兩處）、noscript FAQ「營業時間與公休日」 |
| `bentoItems.*.note`（type:info 那格） | 週一公休 | 同上 |

## 四、地址／電話 🔒 唯讀

| 雲端 key | 內容 | 需同步的靜態位置 |
|---|---|---|
| `siteConfig.address` | 屏東縣九如鄉九如路一段2-88號 | JSON-LD address（兩處）、頁尾/聯繫區 |
| `siteConfig.phone` | 08-810-1858 | JSON-LD telephone（兩處） |

> 幾乎不會變動，改錯直接影響 Google 商家資訊；設唯讀，需改時工程一起改。
> （`siteConfig.shopPhone` 展售手機不在 JSON-LD 內，可維持一般可改。）

## 五、主標題／網頁描述 🔒 唯讀

| 項目 | 雲端 key | 需同步的靜態位置 |
|---|---|---|
| H1 主標 | `pageContent.hero.title` | index.html `<title>` 標籤 |
| 網頁描述 | （無雲端 key，純靜態） | index.html `<meta name="description">` |

> 這兩項是搜尋結果標題與摘要，屬 SEO 命脈，設唯讀由工程維護。

---

## 改動時的同步 checklist

每次改到上面 ⚠ 欄位，發布前跑一次：

1. [ ] 後台改好雲端值、存草稿、用「草稿預覽」確認畫面正確。
2. [ ] 打開 `index.html`，同步更新該項的 **JSON-LD**（票價 offers／FAQPage／openingHours／address／telephone）。
3. [ ] 同步更新 **noscript 備援**（`#render-qa-grid` 的 `<article>`、`#dining-ticket-notice` 票價提示）。
4. [ ] 若改的是 H1／描述，另改 `<title>`／`<meta description>`。
5. [ ] 本地 `python3 -m http.server 8000` 檢查畫面與 View Source 的靜態文字一致。
6. [ ] commit（訊息寫清楚改了哪個數字/文案），push。
7. [ ] 後台按「發布」，讓正式頁雲端值也更新。
8. [ ] （票價/FAQ）到 Google Search Console 用「複合式搜尋結果測試」驗 JSON-LD 沒報錯。

---

## 未來自動化（Full 版才做）

上面手動 checklist 是 MVP 做法，因這些欄位變動頻率低、可接受。
若日後票價/FAQ 變動變頻繁，再評估「發布時自動重生靜態 index.html」：

- 選項 A：GitHub Action 監看 `data.js`，push 時用腳本重生 JSON-LD／noscript。
- 選項 B：Apps Script 發布時寫回 GitHub（需先評估 repo 寫入權限的安全風險——目前不建議）。

在量還小時，**維持人工同步 + 這張 checklist 就足夠**，不要為低頻變動先上自動化。
