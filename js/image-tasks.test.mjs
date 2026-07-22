import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function memoryStorage() {
    const values = new Map();
    return {
        getItem(key) { return values.has(key) ? values.get(key) : null; },
        setItem(key, value) { values.set(key, String(value)); },
        removeItem(key) { values.delete(key); },
        values,
    };
}

const storage = memoryStorage();
const windowObject = { localStorage: storage };
const context = { window: windowObject, Date, JSON, Number, Object, String, isFinite, console };
vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL('./image-tasks.js', import.meta.url), 'utf8'), context);

const api = windowObject.RoseFarmImageTasks;
assert.ok(api);
assert.equal(api.available(), true);
assert.equal(api.load().items.length, 0);

let result = api.add({ key: 'heroSlides.0.image', label: '主視覺', locationHint: '首頁最上方' });
assert.equal(result.added, true);
assert.equal(result.list.items[0].status, 'pending');
assert.equal(result.list.items[0].order, 0);

result = api.add({ key: 'heroSlides.0.image', label: '重複項目' });
assert.equal(result.added, false);
assert.equal(result.list.items.length, 1);

api.add({ key: 'gallery.0.image', label: '園區相簿' });
result = api.toggle({ key: 'heroSlides.0.image' });
assert.equal(result.removed, true);
assert.equal(result.list.items.length, 1);
assert.equal(result.list.items[0].order, 0);

result = api.setStatus('gallery.0.image', 'done');
assert.equal(result.changed, true);
const summary = api.summary(result.list);
assert.equal(summary.total, 1);
assert.equal(summary.pending, 0);
assert.equal(summary.done, 1);
assert.equal(summary.skipped, 0);
assert.equal(api.nextPendingIndex(result.list, 0), -1);

api.setStatus('gallery.0.image', 'pending');
api.add({ key: 'food.0.image', label: '料理圖片' });
const list = api.load();
assert.equal(api.nextPendingIndex(list, 1), 1);
assert.equal(api.nextPendingIndex(list, 2), 0);

const oldNow = Date.parse('2026-07-22T12:00:00.000Z');
const oldStore = api.createStore(memoryStorage(), () => oldNow);
oldStore.save({ version: 1, createdAt: '2026-07-21T11:59:59.000Z', items: [] });
assert.equal(oldStore.isStale(), true);

storage.setItem(api.STORAGE_KEY, '{broken json');
assert.equal(api.load().items.length, 0);

const unavailable = api.createStore({
    getItem() { throw new Error('blocked'); },
    setItem() { throw new Error('blocked'); },
    removeItem() { throw new Error('blocked'); },
});
assert.equal(unavailable.available(), false);
assert.equal(unavailable.add({ key: 'x.image' }).ok, false);
assert.equal(unavailable.clear(), false);

assert.equal(api.clear(), true);
assert.equal(storage.getItem(api.STORAGE_KEY), null);

console.log('Image task data tests passed');
