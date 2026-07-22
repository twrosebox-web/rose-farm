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
    toggle(value, force) {
      if (force === true) values.add(value);
      else if (force === false) values.delete(value);
      else if (values.has(value)) values.delete(value);
      else values.add(value);
    },
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
      child.parentElement = element;
      if (child.id) elements.set(child.id, child);
      return child;
    },
    removeChild(child) {
      const index = children.indexOf(child);
      if (index >= 0) children.splice(index, 1);
      child.parentElement = null;
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
    querySelector() { return null; },
    remove() { if (this.parentElement) this.parentElement.removeChild(this); },
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
  querySelectorAll(selector) {
    if (selector === "img[data-content-key]") return [image];
    if (selector === ".draft-task-badge") return body.children.filter((child) => child.className === "draft-task-badge");
    return [];
  },
  addEventListener(name, handler) { listeners[name] = handler; },
};

const windowObject = {
  location: { search: "?preview=draft&token=test" },
  innerWidth: 1200,
  localStorage: {
    values: new Map(),
    getItem(key) { return this.values.has(key) ? this.values.get(key) : null; },
    setItem(key, value) { this.values.set(key, String(value)); },
    removeItem(key) { this.values.delete(key); },
  },
};

const context = { console, document, window: windowObject, Number, Object, String, Date, JSON, isFinite };
vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL("./image-tasks.js", import.meta.url), "utf8"), context);
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
assert.equal(elements.get("draft-inspector-link").href, "admin.html?field=food.0.image");
assert.match(elements.get("draft-inspector-link").textContent, /專屬後台/);
assert.match(elements.get("draft-inspector-sheet-link").href, /gid=2026072101&range=B48$/);
assert.match(elements.get("draft-inspector-sheet-link").textContent, /B48/);
assert.equal(elements.get("draft-inspector-panel").classList.contains("is-open"), true);

elements.get("draft-task-mode-toggle").on_click();
assert.equal(documentElement.dataset.draftTaskMode, "true");
listeners.click({
  target: image,
  preventDefault() {},
  stopPropagation() {},
});
const taskList = windowObject.RoseFarmImageTasks.load();
assert.equal(taskList.items.length, 1);
assert.equal(taskList.items[0].key, "food.0.image");
assert.equal(image.classList.contains("draft-task-selected"), true);
assert.equal(image.dataset.draftTaskNumber, "1");
assert.equal(elements.get("draft-task-counter").textContent, "已選 1 張");
elements.get("draft-task-counter").on_click();
assert.equal(elements.get("draft-task-panel").classList.contains("is-open"), true);
assert.equal(elements.get("draft-task-start").href, "admin.html?tour=1");
assert.match(elements.get("draft-task-start").textContent, /（1）/);

listeners.click({
  target: image,
  preventDefault() {},
  stopPropagation() {},
});
assert.equal(windowObject.RoseFarmImageTasks.load().items.length, 0);
assert.equal(image.classList.contains("draft-task-selected"), false);

console.log("Draft inspector tests passed");
