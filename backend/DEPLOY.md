# 大花農場 Sheet 後台部署

## 1. 開啟內容資料表

[大花農場內容後台](https://docs.google.com/spreadsheets/d/1yQM7xcbUMuT4B78wNBVDCu15-_nqNn9bXOmU3chREz8/edit)

## 2. 建立 Apps Script

1. 在試算表選擇「擴充功能 → Apps Script」。
2. 將 `backend/apps-script/Code.gs` 完整貼入 `Code.gs`。
3. 在 Apps Script「專案設定」開啟 `appsscript.json` 顯示功能，再將 `backend/apps-script/appsscript.json` 內容貼入。
4. 選擇 `setupBackend`，按「執行」，依畫面完成 Google 授權。

完成後重新整理試算表，會出現「🌹 內容後台」選單。「批次編輯」分頁會自動載入全部欄位；日常操作不需要開啟隱藏的「內容資料」。

## 3. 設定寫入通行碼

1. Apps Script 左側選擇「專案設定」。
2. 在「指令碼屬性」新增：
   - 屬性：`ADMIN_PASSCODE`
   - 值：自行設定的後台通行碼，不可寫入前端或 GitHub。

## 4. 部署網頁應用程式

1. 右上角選擇「部署 → 新增部署作業」。
2. 類型選擇「網頁應用程式」。
3. 執行身分選擇「我自己」。
4. 誰可以存取選擇「所有人」。
5. 部署後複製 `/exec` 結尾的網頁應用程式網址。

## 5. 連接前端

打開 `js/cloud-config.js`，把部署網址填入 `endpoint`：

```js
window.CLOUD_CONFIG = Object.assign({
    endpoint: 'https://script.google.com/macros/s/部署代碼/exec'
}, window.CLOUD_CONFIG || {});
```

沒有填 endpoint 或雲端讀取失敗時，網站會自動使用 `js/data.js` 內建值。

## 6. 驗證

1. 打開「批次編輯」分頁。
2. 在「票價」區修改全票，並視需要同時修改其他黃色欄位。
3. 餐廳可修改門票折抵提示、招牌料理、團體用餐提醒、用餐方案，以及料理名稱、描述與圖片。
4. 「圖片」分類可修改首頁輪播、農場特色、相簿、四季花景、生態、體驗服務及伴手禮圖片；圖片網址必須以 `https://` 開頭。
5. DIY 目前預留 4 個新增位置；填寫「可新增空白項目」的名稱、價格、時長、成團人數與圖片，再勾選「顯示此項目」。取消勾選即可下架，內容仍會保留。
6. FAQ 的問題列為綠色、答案列為黃色；表格型答案也會緊接在所屬問題下方。
7. 從上方「🌹 內容後台 → 預覽尚未發布的修改」開啟草稿預覽；預覽連結 10 分鐘後失效，此時正式網站不會改變。
8. 確認預覽正確後，勾選第 5 列「我已確認，儲存全部變更」。
9. 確認狀態顯示「已儲存 N 項到 Sheet ✓」，並在正式體驗頁重新整理驗證。
10. 測試後把價格改回正確值，再儲存一次。

> 「內容資料」是隱藏的底層資料庫。批次儲存只會更新真正改動的 key，並各自更新 updatedAt。
