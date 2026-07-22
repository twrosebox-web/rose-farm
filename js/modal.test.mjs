import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function createClassList(initial = []) {
  const values = new Set(initial);
  return {
    add(...names) { names.forEach((name) => values.add(name)); },
    remove(...names) { names.forEach((name) => values.delete(name)); },
    contains(name) { return values.has(name); },
  };
}

function createElement(initialClasses = []) {
  const listeners = {};
  return {
    classList: createClassList(initialClasses),
    addEventListener(type, handler) { listeners[type] = handler; },
    dispatch(type, target) { listeners[type]?.({ target }); },
  };
}

const modalBackdrop = createElement();
const modalContent = createElement();
const lightbox = createElement(["hidden"]);
const elements = {
  "modal-backdrop": modalBackdrop,
  lightbox,
};
const documentListeners = {};

const context = {
  window: {},
  document: {
    body: { style: {} },
    getElementById(id) { return elements[id] || null; },
    addEventListener(type, handler) { documentListeners[type] = handler; },
    querySelectorAll() { return []; },
  },
  clearInterval() {},
  setInterval() { return 1; },
  setTimeout(handler) { handler(); },
};
context.window.window = context.window;

vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL("./modal.js", import.meta.url), "utf8"), context);

// 在內容區按下、拖到遮罩放開，不應誤關。
modalBackdrop.dispatch("mousedown", modalContent);
modalBackdrop.dispatch("mouseup", modalBackdrop);
assert.equal(modalBackdrop.classList.contains("hidden"), false);

// 按下與放開都在遮罩上才關閉。
modalBackdrop.dispatch("mousedown", modalBackdrop);
modalBackdrop.dispatch("mouseup", modalBackdrop);
assert.equal(modalBackdrop.classList.contains("hidden"), true);

// Lightbox 開啟時，ESC 應優先關閉 Lightbox。
modalBackdrop.classList.remove("hidden");
lightbox.classList.remove("hidden");
documentListeners.keydown({ key: "Escape" });
assert.equal(lightbox.classList.contains("hidden"), true);
assert.equal(modalBackdrop.classList.contains("hidden"), false);

console.log("Modal and lightbox tests passed");
