import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const listeners = {};
const document = {
  activeElement: null,
  body: {},
  documentElement: { dataset: {} },
  head: { appendChild() {} },
  addEventListener(name, handler) { listeners[name] = handler; },
  createElement() {
    return { remove() {}, set src(value) { this._src = value; }, get src() { return this._src; } };
  },
  getElementById() { return null; },
};

const windowObject = {
  CLOUD_CONFIG: { endpoint: "" },
  DATA: { siteConfig: { ticket: { full: 200 } } },
  getSelection: () => ({ toString: () => "使用者正在反白" }),
  setTimeout: () => 1,
  clearTimeout() {},
};

const context = {
  console,
  Date,
  Object,
  Promise,
  document,
  window: windowObject,
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL("./cloud-data.js", import.meta.url), "utf8"), context);

assert.equal(document.documentElement.dataset.cloudData, "disabled");
assert.equal(typeof windowObject.renderAll, "function");
assert.equal(typeof windowObject.roseFarmCloudCallback, "function");

windowObject.roseFarmCloudCallback({
  ok: true,
  values: {
    "siteConfig.ticket.full": 250,
    "diy.4.enabled": false,
    "diy.4.name": "新增 DIY",
    "food.0.image": "https://example.com/food.jpg",
    "diningContent.signatureTitle": "雲端招牌料理",
    "__proto__.polluted": true,
  },
  updatedAt: { "siteConfig.ticket.full": "2026-07-17T00:00:00.000Z" },
});

assert.equal(windowObject.DATA.siteConfig.ticket.full, 250);
assert.equal(windowObject.DATA.diy[4].enabled, false);
assert.equal(windowObject.DATA.diy[4].name, "新增 DIY");
assert.equal(windowObject.DATA.food[0].image, "https://example.com/food.jpg");
assert.equal(windowObject.DATA.diningContent.signatureTitle, "雲端招牌料理");
assert.equal({}.polluted, undefined);
assert.equal(document.documentElement.dataset.cloudData, "loaded");

const previewScripts = [];
const previewStatus = {
  textContent: "",
  classList: { toggle() {} },
};
const previewBanner = {
  classList: {
    removed: [],
    remove(value) { this.removed.push(value); },
  },
};
const previewDocument = {
  activeElement: null,
  body: {},
  documentElement: { dataset: {} },
  head: { appendChild(script) { previewScripts.push(script); } },
  addEventListener() {},
  createElement() {
    return { remove() {}, set src(value) { this._src = value; }, get src() { return this._src; } };
  },
  getElementById(id) {
    if (id === "draft-preview-banner") return previewBanner;
    if (id === "draft-preview-status") return previewStatus;
    return null;
  },
  querySelectorAll() { return []; },
};
const previewWindow = {
  CLOUD_CONFIG: { endpoint: "https://example.com/exec" },
  DATA: { siteConfig: { ticket: { full: 200 } } },
  location: { search: "?preview=draft&token=preview-token" },
  getSelection: () => ({ toString: () => "使用者正在反白" }),
  setTimeout: () => 1,
  clearTimeout() {},
};
const previewContext = {
  console,
  Date,
  Object,
  Promise,
  document: previewDocument,
  window: previewWindow,
};
vm.createContext(previewContext);
vm.runInContext(fs.readFileSync(new URL("./cloud-data.js", import.meta.url), "utf8"), previewContext);

assert.equal(previewScripts.length, 1);
assert.match(previewScripts[0].src, /[?&]mode=draft(?:&|$)/);
assert.match(previewScripts[0].src, /[?&]token=preview-token(?:&|$)/);
assert.deepEqual(previewBanner.classList.removed, ["hidden"]);
previewWindow.roseFarmCloudCallback({
  ok: true,
  mode: "draft",
  values: { "siteConfig.ticket.full": 300 },
  updatedAt: {},
  editorRows: { "siteConfig.ticket.full": 8 },
  editorSheetId: 2026072101,
});
assert.equal(previewWindow.DATA.siteConfig.ticket.full, 300);
assert.equal(previewDocument.documentElement.dataset.contentMode, "draft");
assert.match(previewStatus.textContent, /尚未發布/);
assert.equal(previewWindow.CLOUD_DATA_META.editorRows["siteConfig.ticket.full"], 8);
assert.equal(previewWindow.CLOUD_DATA_META.editorSheetId, 2026072101);

console.log("Cloud data tests passed");
