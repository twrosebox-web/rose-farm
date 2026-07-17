# 大花農場 Sheet 後台部署

## 1. 開啟內容資料表

[大花農場內容後台](https://docs.google.com/spreadsheets/d/16cH2RYwjp0egiijK0AxZh7sNC4yUfjSNZchC57jf7N8/edit)

## 2. 建立 Apps Script

1. 在試算表選擇「擴充功能 → Apps Script」。
2. 將 `backend/apps-script/Code.gs` 完整貼入 `Code.gs`。
3. 在 Apps Script「專案設定」開啟 `appsscript.json` 顯示功能，再將 `backend/apps-script/appsscript.json` 內容貼入。
4. 選擇 `setupBackend`，按「執行」，依畫面完成 Google 授權。

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

1. 在「內容資料」分頁找到 `siteConfig.ticket.full`。
2. 只修改 D 欄「目前值」。
3. 重新整理體驗頁，確認全票價格同步變更。
4. 測試後把價格改回正確值。

> C 欄 key、E 欄類型、H 欄 updatedAt 請勿手動修改。每次從後台發布時，只會更新該 key 的值與自己的 updatedAt。
