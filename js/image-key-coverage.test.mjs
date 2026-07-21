import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL("./data.js", import.meta.url), "utf8"), context);
const data = context.window.DATA;

const expectedKeys = [];
data.siteConfig.diningImages.forEach((_, index) => expectedKeys.push(`siteConfig.diningImages.${index}`));
data.heroSlides.forEach((_, index) => expectedKeys.push(`heroSlides.${index}.image`));
data.features.forEach((feature, featureIndex) => {
  feature.images.forEach((_, imageIndex) => expectedKeys.push(`features.${featureIndex}.images.${imageIndex}`));
});
data.bentoItems.forEach((item, index) => {
  if (Object.hasOwn(item, "img")) expectedKeys.push(`bentoItems.${index}.img`);
});
data.gallery.forEach((_, index) => expectedKeys.push(`gallery.${index}.image`));
data.seasons.forEach((_, index) => expectedKeys.push(`seasons.${index}.image`));
data.eco.forEach((_, index) => expectedKeys.push(`eco.${index}.image`));
data.services.forEach((_, index) => expectedKeys.push(`services.${index}.img`));
data.diningOptions.forEach((_, index) => expectedKeys.push(`diningOptions.${index}.img`));
data.food.forEach((_, index) => expectedKeys.push(`food.${index}.image`));
data.diy.forEach((item, index) => {
  if (item.enabled === true) expectedKeys.push(`diy.${index}.image`);
});
data.products.forEach((_, index) => expectedKeys.push(`products.${index}.image`));

assert.equal(expectedKeys.length, 71, "Sheet 中 71 個目前可見的圖片欄位都應有定位規則");

const sources = [
  "../index.html",
  "./hero.js",
  "./features.js",
  "./bento.js",
  "./gallery.js",
  "./seasons.js",
  "./eco-services.js",
  "./dining.js",
  "./products-diy.js",
].map((path) => fs.readFileSync(new URL(path, import.meta.url), "utf8")).join("\n");

[
  "siteConfig.diningImages.", "heroSlides.", "features.", "bentoItems.", "gallery.",
  "seasons.", "eco.", "services.", "diningOptions.", "food.", "diy.", "products.",
].forEach((prefix) => assert.ok(sources.includes(prefix), `缺少 ${prefix} 圖片定位標記`));

assert.match(sources, /data-content-key/);
console.log(`Image key coverage tests passed (${expectedKeys.length} images)`);
