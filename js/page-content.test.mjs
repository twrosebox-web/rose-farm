import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL("./data.js", import.meta.url), "utf8"), context);

const data = context.window.DATA;
const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const wiredKeys = Array.from(html.matchAll(/data-page-key=["']([^"']+)["']/g), (match) => match[1]);

function getByPath(root, path) {
  return path.split(".").reduce((value, part) => (value == null ? undefined : value[part]), root);
}

function leafKeys(value, path = []) {
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) => leafKeys(child, [...path, key]));
  }
  return [path.join(".")];
}

assert.ok(wiredKeys.length > 50, "公開頁面應接上完整的固定文案欄位");
wiredKeys.forEach((key) => assert.notEqual(getByPath(data.pageContent, key), undefined, `data.js 缺少 pageContent.${key}`));
leafKeys(data.pageContent).forEach((key) => assert.ok(wiredKeys.includes(key), `index.html 尚未接上 pageContent.${key}`));

for (const id of ["map-navigation-button", "park-map-image", "half-ticket-rule", "facebook-contact-link", "contact-location-line"]) {
  assert.match(html, new RegExp(`id=["']${id}["']`));
}

const scriptOrder = ["js/data.js", "js/data-modals.js", "js/modal.js"]
  .map((src) => html.indexOf(`src="${src}"`));
assert.ok(scriptOrder.every((position) => position >= 0));
assert.ok(scriptOrder[0] < scriptOrder[1] && scriptOrder[1] < scriptOrder[2], "核心 script 載入順序不可更動");

console.log(`Page content tests passed (${wiredKeys.length} fields)`);
