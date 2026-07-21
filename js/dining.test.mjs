import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const elements = new Map();
function element(id) {
  const value = { id, textContent: '', innerHTML: '', querySelectorAll: () => [] };
  elements.set(id, value);
  return value;
}

[
  'dining-ticket-notice',
  'dining-signature-title',
  'dining-signature-english',
  'dining-signature-description-1',
  'dining-signature-description-2',
  'dining-highlight-1-title',
  'dining-highlight-1-description',
  'dining-highlight-2-title',
  'dining-highlight-2-description',
  'dining-group-notice',
  'render-dining-options',
  'render-food-grid',
].forEach(element);

const context = {
  window: {
    DATA: {
      diningContent: {
        ticketNotice: '門票提示',
        signatureTitle: '招牌料理',
        signatureEnglish: 'Signature Dish',
        signatureDescription1: '第一段',
        signatureDescription2: '第二段',
        highlight1Title: '重點一',
        highlight1Description: '重點一說明',
        highlight2Title: '重點二',
        highlight2Description: '重點二說明',
        groupNotice: '團體提醒',
      },
      diningOptions: [{ title: '<方案>', desc: '<描述>', price: '$100', img: 'https://example.com/meal.jpg' }],
      food: [{ name: '<料理>', desc: '<料理描述>', image: 'https://example.com/food.jpg' }],
    },
  },
  document: { getElementById: (id) => elements.get(id) || null },
};

vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL('./dining.js', import.meta.url), 'utf8'), context);

assert.equal(elements.get('dining-ticket-notice').textContent, '門票提示');
assert.equal(elements.get('dining-signature-title').textContent, '招牌料理');
assert.equal(elements.get('dining-group-notice').textContent, '團體提醒');
assert.match(elements.get('render-dining-options').innerHTML, /&lt;方案&gt;/);
assert.doesNotMatch(elements.get('render-dining-options').innerHTML, /<方案>/);
assert.match(elements.get('render-food-grid').innerHTML, /&lt;料理&gt;/);

console.log('Dining tests passed');
