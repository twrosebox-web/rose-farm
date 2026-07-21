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
    "__proto__.polluted": true,
  },
  updatedAt: { "siteConfig.ticket.full": "2026-07-17T00:00:00.000Z" },
});

assert.equal(windowObject.DATA.siteConfig.ticket.full, 250);
assert.equal(windowObject.DATA.diy[4].enabled, false);
assert.equal(windowObject.DATA.diy[4].name, "新增 DIY");
assert.equal({}.polluted, undefined);
assert.equal(document.documentElement.dataset.cloudData, "loaded");

console.log("Cloud data tests passed");
