import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const diyGrid = {
  innerHTML: '',
  querySelectorAll() { return []; },
};

const context = {
  window: {
    DATA: {
      diy: [
        { enabled: true, modal: '', name: '顯示項目', price: '$100/人', tag: '30分鐘', group: '5人', image: 'https://example.com/a.jpg' },
        { enabled: false, modal: '', name: '下架項目', price: '$200/人', tag: '40分鐘', group: '8人', image: 'https://example.com/b.jpg' },
        { modal: '', name: '缺少啟用狀態', price: '$300/人', tag: '50分鐘', group: '10人', image: 'https://example.com/c.jpg' },
        { enabled: true, modal: '', name: '資料不完整', price: '', tag: '60分鐘', group: '12人', image: 'https://example.com/d.jpg' },
      ],
      products: [],
      modalContent: {},
    },
  },
  document: {
    getElementById(id) {
      if (id === 'render-diy-grid') return diyGrid;
      return null;
    },
  },
};

vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL('./products-diy.js', import.meta.url), 'utf8'), context);

assert.match(diyGrid.innerHTML, /顯示項目/);
assert.doesNotMatch(diyGrid.innerHTML, /下架項目/);
assert.doesNotMatch(diyGrid.innerHTML, /缺少啟用狀態|資料不完整|2人成團/);
assert.match(diyGrid.innerHTML, /電話洽詢 08-810-1858/);
assert.match(diyGrid.innerHTML, /href="tel:088101858"/);

console.log('Products and DIY tests passed');
