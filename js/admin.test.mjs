import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const context = {
    window: {},
    document: {
        readyState: 'complete',
        getElementById() { return null; },
    },
    URLSearchParams,
    Map,
    Set,
    console,
    setTimeout,
    clearTimeout,
};
context.window.window = context.window;
context.window.document = context.document;
context.window.CSS = { escape(value) { return value; } };
vm.createContext(context);

vm.runInContext(fs.readFileSync(new URL('./data.js', import.meta.url), 'utf8'), context);
vm.runInContext(fs.readFileSync(new URL('./admin.js', import.meta.url), 'utf8'), context);

const api = context.window.ADMIN_TESTING;
assert.ok(api, 'admin.js should expose test helpers');
assert.equal(api.containsBrandTerm('自然農法玫瑰'), false);
assert.equal(api.containsBrandTerm('Organic Farm'), true);
assert.equal(api.containsBrandTerm('有機農場'), true);

assert.equal(api.isImageKey('diy.0.image'), true);
assert.equal(api.isImageKey('siteConfig.diningImages.2'), true);
assert.equal(api.isImageKey('features.1.images.4'), true);
assert.equal(api.isImageKey('diningContent.ticketNotice'), false);

assert.equal(api.categoryForEntry({ key: 'siteConfig.ticket.full' }), 'ticket');
assert.equal(api.categoryForEntry({ key: 'diningContent.groupNotice' }), 'dining');
assert.equal(api.categoryForEntry({ key: 'diy.2.price' }), 'diy');
assert.equal(api.categoryForEntry({ key: 'qa.categories.0.list.1.q' }), 'faq');
assert.equal(api.categoryForEntry({ key: 'services.1.price' }), 'services');
assert.equal(api.categoryForEntry({ key: 'heroSlides.0.image' }), 'images');
assert.equal(api.faqCategoryIndex({ key: 'qa.categories.3.list.2.q' }), '3');
assert.equal(api.faqCategoryIndex({ key: 'qa.infoIcons.2.text' }), 'info');
assert.equal(api.faqCategoryIndex({ key: 'siteConfig.ticket.full' }), '');
assert.equal(api.imageCategoryForKey('heroSlides.2.image'), 'hero');
assert.equal(api.imageCategoryForKey('siteConfig.diningImages.3'), 'dining');
assert.equal(api.imageCategoryForKey('diy.4.image'), 'diy');
assert.equal(api.imageCategoryForKey('products.1.image'), 'products');
assert.match(api.imageLocationHint('heroSlides.2.image'), /第 3 張/);
assert.match(api.imageLocationHint('siteConfig.diningImages.3'), /白玉鍋/);
assert.match(api.imageLocationHint('features.1.images.4'), /第 2 區，第 5 張/);

const entries = api.buildDemoEntries(context.window.DATA);
assert.ok(entries.length > 150, `expected many editable fields, got ${entries.length}`);
assert.equal(entries.filter((entry) => api.isImageKey(entry.key)).length, 75);
assert.ok(entries.some((entry) => entry.key === 'diningContent.signatureTitle'));
assert.ok(entries.some((entry) => entry.key === 'diningOptions.0.img'));
assert.ok(entries.some((entry) => entry.key === 'diy.7.enabled'));
assert.ok(entries.some((entry) => entry.key === 'qa.categories.0.list.0.q'));
assert.ok(entries.some((entry) => entry.key === 'qa.categories.0.list.1.rows.0.value'));
assert.ok(entries.some((entry) => entry.key === 'heroSlides.0.image'));
assert.ok(!entries.some((entry) => entry.key === 'navItems.0.name'));

const current = Object.fromEntries(entries.map((entry) => [entry.key, entry.value]));
const faq = api.filterEntries(entries, 'faq', '小孩', false, new Set(), current);
assert.ok(faq.some((entry) => String(entry.value).includes('小孩')));

const dirty = new Set(['siteConfig.ticket.full']);
const modifiedOnly = api.filterEntries(entries, 'all', '', true, dirty, current);
assert.equal(Array.from(modifiedOnly, (entry) => entry.key).join(','), 'siteConfig.ticket.full');

assert.equal(api.valuesEqual('200', 200, 'number'), true);
assert.equal(api.valuesEqual('false', false, 'boolean'), true);

const html = fs.readFileSync(new URL('../admin.html', import.meta.url), 'utf8');
for (const id of ['admin-login', 'admin-nav', 'sidebar-toggle', 'editor-content', 'save-button', 'preview-button', 'publish-button', 'confirm-modal']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
}
assert.match(html, /js\/admin\.js/);

const css = fs.readFileSync(new URL('../css/admin.css', import.meta.url), 'utf8');
assert.match(css, /\.app-shell\.sidebar-collapsed \.sidebar/);
assert.match(css, /@media \(max-width: 980px\)/);
assert.match(css, /\.mobile-nav-hint/);

console.log(`Admin tests passed (${entries.length} demo fields)`);
