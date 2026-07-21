import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const sheetRows = [
  ["區塊", "項目", "key", "目前值", "類型", "必填", "填寫說明", "updatedAt", "啟用"],
  ["票價", "全票", "siteConfig.ticket.full", 200, "number", "是", "只填數字", "2026-07-17T00:00:00.000Z", true],
  ["公告", "公告內容", "siteConfig.announcement.text", "", "string", "否", "可留空", "2026-07-17T00:00:00.000Z", true],
  ["餐廳｜更多料理", "料理", "food.0.image", "https://example.com/food.jpg", "string", "是", "完整圖片網址", "2026-07-17T00:00:00.000Z", true],
  ["DIY", "DIY 項目 5", "diy.4.enabled", false, "boolean", "是", "", "2026-07-17T00:00:00.000Z", true],
  ["DIY", "DIY 項目 5", "diy.4.name", "", "string", "否", "", "2026-07-17T00:00:00.000Z", true],
  ["DIY", "DIY 項目 5", "diy.4.price", "", "string", "否", "", "2026-07-17T00:00:00.000Z", true],
  ["DIY", "DIY 項目 5", "diy.4.tag", "", "string", "否", "", "2026-07-17T00:00:00.000Z", true],
  ["DIY", "DIY 項目 5", "diy.4.group", "", "string", "否", "", "2026-07-17T00:00:00.000Z", true],
  ["DIY", "DIY 項目 5", "diy.4.image", "", "string", "否", "", "2026-07-17T00:00:00.000Z", true],
];

const cacheStore = new Map();

function makeRange(row, column, rowCount = 1, columnCount = 1) {
  return {
    getValues() {
      return sheetRows.slice(row - 3, row - 3 + rowCount).map((source) =>
        source.slice(column - 1, column - 1 + columnCount),
      );
    },
    setValue(value) {
      sheetRows[row - 3][column - 1] = value;
      return this;
    },
    setNumberFormat() {
      return this;
    },
  };
}

const sheet = {
  getLastRow: () => sheetRows.length + 3,
  getRange: makeRange,
};

const scriptProperties = new Map([
  ["SPREADSHEET_ID", "test-sheet-id"],
  ["ADMIN_PASSCODE", "secret"],
]);

const context = {
  console,
  Date,
  JSON,
  Map,
  Number,
  Object,
  String,
  CacheService: {
    getScriptCache: () => ({
      get: (key) => cacheStore.get(key) || null,
      put: (key, value) => cacheStore.set(key, value),
      remove: (key) => cacheStore.delete(key),
    }),
  },
  ContentService: {
    MimeType: { JAVASCRIPT: "js", JSON: "json" },
    createTextOutput: (text) => ({
      text,
      mimeType: null,
      setMimeType(mimeType) {
        this.mimeType = mimeType;
        return this;
      },
    }),
  },
  LockService: {
    getScriptLock: () => ({ waitLock() {}, releaseLock() {} }),
  },
  PropertiesService: {
    getScriptProperties: () => ({
      getProperty: (key) => scriptProperties.get(key) || null,
      setProperty: (key, value) => scriptProperties.set(key, value),
    }),
  },
  SpreadsheetApp: {
    openById: () => ({ getSheetByName: () => sheet }),
    getActiveSpreadsheet: () => null,
    flush() {},
  },
};

vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL("./Code.gs", import.meta.url), "utf8"), context);

assert.equal(context.isValidKey_("siteConfig.ticket.full"), true);
assert.equal(context.isValidKey_("siteConfig..full"), false);
assert.equal(context.isValidCallback_("window.cloudCallback"), true);
assert.equal(context.isValidCallback_("alert(1)"), false);
assert.equal(context.coerceValue_("250", "number"), 250);
assert.equal(context.coerceValue_("false", "boolean"), false);
assert.equal(context.valuesEqual_(200, 200), true);
assert.equal(context.valuesEqual_("200", 200), false);
assert.throws(() => context.validateDiyGroups_([
  ["DIY", "DIY 項目 5", "diy.4.enabled", true, "boolean", "是", "", "", true],
  ["DIY", "DIY 項目 5", "diy.4.name", "新增項目", "string", "否", "", "", true],
  ["DIY", "DIY 項目 5", "diy.4.price", "", "string", "否", "", "", true],
]), /啟用前/);
assert.doesNotThrow(() => context.validateDiyGroups_([
  ["DIY", "DIY 項目 5", "diy.4.enabled", false, "boolean", "是", "", "", true],
  ["DIY", "DIY 項目 5", "diy.4.name", "", "string", "否", "", "", true],
]));
assert.doesNotThrow(() => context.validateImageUrls_([
  ["圖片", "料理", "food.0.image", "https://example.com/food.jpg", "string", "是", "", "", true],
]));
assert.throws(() => context.validateImageUrls_([
  ["圖片", "料理", "food.0.image", "http://example.com/food.jpg", "string", "是", "", "", true],
]), /https:\/\//);
assert.equal(
  context.makeEditorLabel_({ item: "玫瑰花醬DIY", key: "diy.0.price" }),
  "價格",
);
assert.equal(
  context.makeEditorLabel_({ item: "入園與票務／第 2 題", key: "qa.categories.0.list.1.rows.0.value" }),
  "💬 答案 2｜選項 1・內容",
);
assert.equal(
  context.makeEditorLabel_({ item: "入園與票務／第 2 題", key: "qa.categories.0.list.1.q" }),
  "❓ 題目內容 2｜入園與票務",
);
assert.equal(context.rangeContainsCell_({
  getRow: () => 5,
  getLastRow: () => 5,
  getColumn: () => 2,
  getLastColumn: () => 4,
}, 5, 2), true);

const postResult = context.doPost({
  postData: {
    contents: JSON.stringify({
      passcode: "secret",
      key: "siteConfig.ticket.full",
      value: "250",
    }),
  },
});
const postPayload = JSON.parse(postResult.text);
assert.equal(postPayload.ok, true);
assert.equal(sheetRows[1][3], 250);

const invalidImagePost = context.doPost({
  postData: {
    contents: JSON.stringify({
      passcode: "secret",
      key: "food.0.image",
      value: "http://example.com/unsafe.jpg",
    }),
  },
});
assert.equal(JSON.parse(invalidImagePost.text).ok, false);
assert.match(JSON.parse(invalidImagePost.text).error, /https:\/\//);
assert.equal(sheetRows[3][3], "https://example.com/food.jpg");
assert.match(sheetRows[1][7], /^\d{4}-\d{2}-\d{2}T/);

const getResult = context.doGet({ parameter: { callback: "roseFarmCloudCallback" } });
assert.equal(getResult.mimeType, "js");
assert.match(getResult.text, /^roseFarmCloudCallback\(/);
assert.match(getResult.text, /"siteConfig.ticket.full":250/);

const invalidPost = context.doPost({
  postData: {
    contents: JSON.stringify({
      passcode: "wrong",
      key: "siteConfig.ticket.full",
      value: 300,
    }),
  },
});
assert.equal(JSON.parse(invalidPost.text).ok, false);

const blankRequiredNumber = context.doPost({
  postData: {
    contents: JSON.stringify({
      passcode: "secret",
      key: "siteConfig.ticket.full",
      value: "",
    }),
  },
});
assert.equal(JSON.parse(blankRequiredNumber.text).ok, false);
assert.equal(sheetRows[1][3], 250);

const incompleteDiyPost = context.doPost({
  postData: {
    contents: JSON.stringify({
      passcode: "secret",
      key: "diy.4.enabled",
      value: true,
    }),
  },
});
assert.equal(JSON.parse(incompleteDiyPost.text).ok, false);
assert.match(JSON.parse(incompleteDiyPost.text).error, /啟用前/);
assert.equal(sheetRows[4][3], false);

console.log("Apps Script tests passed");
