# 大花農場 Sheet 後台部署

## 1. 開啟內容資料表

[大花農場內容後台](https://docs.google.com/spreadsheets/d/16cH2RYwjp0egiijK0AxZh7sNC4yUfjSNZchC57jf7N8/edit)

## 2. 建立 Apps Script

1. 在試算表選擇「擴充功能 → Apps Script」。
2. 將 `backend/apps-script/Code.gs` 完整貼入 `Code.gs`。
3. 在 Apps Script「專案設定」開啟 `appsscript.json` 顯示功能，再將 `backend/apps-script/appsscript.json` 內容貼入。
4. 選擇 `setupBackend`，按「執行」，依畫面完成 Google 授權。

完成後重新整理試算表，會出現「🌹 內容後台」選單。「後台編輯」分頁會自動載入分類與項目選單；日常操作不需要開啟隱藏的「內容資料」。

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

1. 打開「後台編輯」分頁。
2. 分類選「票價」，項目選「全票｜全票」。
3. 在黃色區域輸入測試價格。
4. 勾選「我已確認內容」，再勾選「發布更新」。
5. 確認狀態顯示「已更新 ✓」，並在體驗頁重新整理驗證。
6. 測試後把價格改回正確值。

> 「內容資料」是隱藏的底層資料庫。每次從編輯面板發布，只會更新該 key 的值與自己的 updatedAt。
