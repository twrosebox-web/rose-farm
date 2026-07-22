# P3｜Apps Script 部署與接通 checklist

> 這棒由你本人操作（需 Apps Script 編輯/部署權限，GPT 與 Claude 都沒有）。
> 對準新表：`1yQM7xcbUMuT4B78wNBVDCu15-_nqNn9bXOmU3chREz8`
> 舊表 `16cH2…` 全程不要碰。

---

## A. 安裝 Apps Script

1. [ ] 開新表 → 「擴充功能 → Apps Script」。
2. [ ] 把 `backend/apps-script/Code.gs` **全部**貼進 `Code.gs`（覆蓋原內容）。
3. [ ] 「專案設定」勾選顯示 `appsscript.json`，把 `backend/apps-script/appsscript.json` 內容貼入。
4. [ ] 選函式 `setupBackend` → 執行 → 依畫面完成 Google 授權。
5. [ ] 回試算表重新整理，確認出現「🌹 內容後台」選單、且「批次編輯」有 708 欄。

## B. 設定寫入通行碼

6. [ ] Apps Script → 「專案設定 → 指令碼屬性」→ 新增：
   - 屬性 `ADMIN_PASSCODE`
   - 值：自訂通行碼（**不可**寫進前端或 GitHub）。

## C. 部署 Web App

7. [ ] 右上「部署 → 新增部署作業」→ 類型「網頁應用程式」。
8. [ ] 執行身分「我自己」、存取權「所有人」→ 部署。
9. [ ] 複製 `/exec` 結尾的網址。

## D. 接上前端（走 GPT，維持單一寫入）

10. [ ] 把 `/exec` 網址**給 GPT**，由 GPT 填進 `js/cloud-config.js` 的 `endpoint`、commit + push（訊息如 `feat: 接上內容後台 Web App endpoint`）。
    - 依單一寫入原則，程式碼由 GPT 落地，你不用自己改檔。
11. [ ] 等 GitHub Pages 重建（約 1 分鐘）。

---

## E. 驗證（在你自己的瀏覽器開正式站，非 ChatGPT 內部瀏覽器）

### E1. 後台真的可存
12. [ ] 開 `https://twrosebox-web.github.io/rose-farm/admin.html` → 用通行碼登入。
13. [ ] 確認不再是「展示模式」，能載入真實內容。

### E2. 基本發布流程
14. [ ] 改一個**在重繪清單內**的欄位當對照組（例：DIY 或餐廳的某段文字）→ 存草稿 → 草稿預覽確認 → 發布。
15. [ ] 開正式站首頁，確認該處有更新。

### E3. ★ 文字重繪疑點實測（重點）
16. [ ] 改一個**不在重繪清單**的模組文字：`seasons.0.desc`（第一張四季卡描述）或 `features.0.title`（三大特色第一個標題）→ 發布。
17. [ ] 開正式站，看該文字**有沒有真的更新**。
    - ✅ 有更新 → 疑點解除，記一筆「已驗證」。
    - ❌ 沒更新（但同項圖片會變）→ **確認是重繪缺口**，回報給我，我開規格讓 GPT 把 `hero/features/seasons/gallery` 加進 `cloud-data.js` 的重繪清單或改由 `renderStaticContent` 統一處理。

### E4. 回退機制
18. [ ] （輕量驗證）確認 `js/data.js` 內建值仍在；雲端讀取失敗時前端會 fallback 這份。不需破壞性測試，知道機制在即可。

### F. 收尾
19. [ ] 把上面測試改動的值**改回正確內容**，再發布一次。
20. [ ] 回報結果（含 E3 是 ✅ 還是 ❌），我更新 `推進計畫.md` 的 P3 狀態，並決定要不要插一個「修重繪缺口」的小任務。

---

## 注意事項

- **品牌紅線**：測試時不要輸入「有機／Organic」，會觸發後台核決攔截。
- **通行碼**：只放 Script Properties，永遠不進前端/GitHub。
- **舊表**：`16cH2…` 全程不要開來編輯，維持乾淨備份。
- **DIY 待拍板**：成團人數（15/25）與時長（?分鐘）在你給最終數字前，不要在後台亂填。
