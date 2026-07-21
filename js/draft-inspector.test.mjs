import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const listeners = {};
const elements = new Map();

function makeClassList() {
  const values = new Set();
  return {
    add(value) { values.add(value); },
    remove(value) { values.delete(value); },
    contains(value) { return values.has(value); },
  };
}

function makeElement(tagName = "div") {
  const children = [];
  const attributes = {};
  const element = {
    tagName: tagName.toUpperCase(),
    id: "",
    dataset: {},
    style: {},
    className: "",
    classList: makeClassList(),
    textContent: "",
    children,
    appendChild(child) {
      children.push(child);
      if (child.id) elements.set(child.id, child);
      return child;
    },
    setAttribute(name, value) {
      attributes[name] = String(value);
      if (name === "id") {
        this.id = String(value);
        elements.set(this.id, this);
      }
      if (name === "data-content-key") this.dataset.contentKey = String(value);
    },
    getAttribute(name) { return attributes[name] || ""; },
    addEventListener(name, handler) { this[`on_${name}`] = handler; },
    matches(selector) { return selector === "img[data-content-key]" && this.tagName === "IMG" && !!this.dataset.contentKey; },
    closest(selector) { return this.matches(selector) ? this : null; },
    contains(target) { return target === this; },
  };
  Object.defineProperty(element, "id", {
    get() { return attributes.id || ""; },
    set(value) { attributes.id = String(value); if (value) elements.set(String(value), element); },
  });
  return element;
}

const image = makeElement("img");
image.dataset.contentKey = "food.0.image";
image.setAttribute("alt", "玫瑰花壽司｜大花農場玫瑰料理");

const documentElement = makeElement("html");
const head = makeElement("head");
const body = makeElement("body");
const document = {
  documentElement,
  head,
  body,
  createElement: makeElement,
  createTextNode(text) { return { textContent: String(text) }; },
  getElementById(id) { return elements.get(id) || null; },
  querySelectorAll(selector) { return selector === "img[data-content-key]" ? [image] : []; },
  addEventListener(name, handler) { listeners[name] = handler; },
};

const windowObject = {
  location: { search: "?preview=draft&token=test" },
  innerWidth: 1200,
};

const context = { console, document, window: windowObject, Number, Object, String };
vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL("./draft-inspector.js", import.meta.url), "utf8"), context);

windowObject.installDraftInspector({
  mode: "draft",
  editorRows: { "food.0.image": 48 },
  editorSheetId: 2026072101,
});

assert.equal(documentElement.dataset.draftInspector, "ready");
assert.equal(image.getAttribute("role"), "button");
assert.equal(image.getAttribute("tabindex"), "0");

let prevented = false;
let stopped = false;
listeners.click({
  target: image,
  preventDefault() { prevented = true; },
  stopPropagation() { stopped = true; },
});

assert.equal(prevented, true);
assert.equal(stopped, true);
assert.equal(elements.get("draft-inspector-cell").textContent, "B48");
assert.match(elements.get("draft-inspector-link").href, /gid=2026072101&range=B48$/);
assert.match(elements.get("draft-inspector-link").textContent, /B48/);
assert.equal(elements.get("draft-inspector-panel").classList.contains("is-open"), true);

console.log("Draft inspector tests passed");
