/* ============================================
   products-diy.js｜伴手禮 + DIY 體驗
   ★ 改伴手禮 → 去 data.js 的 products
   ★ 改 DIY → 去 data.js 的 diy
   ============================================ */
(function() {
    if (!window.DATA) return;

    // === 伴手禮 ===
    var prodGrid = document.getElementById('render-products-grid');
    if (prodGrid && window.DATA.products) {
        prodGrid.innerHTML = window.DATA.products.map(function(p) {
            return '<div class="text-center"><div class="w-full aspect-square rounded-full overflow-hidden border-8 border-[#fffcf5] shadow-lg mb-10 mx-auto max-w-[320px]"><img src="' + p.image + '" class="!w-full !h-full !object-cover !block"></div><h3 class="text-3xl font-serif text-primary font-bold mb-4">' + p.name + '</h3><p class="text-gray-500 text-2xl line-clamp-2">' + p.desc + '</p></div>';
        }).join('');
    }

    // === DIY ===
    var diyGrid = document.getElementById('render-diy-grid');
    if (diyGrid && window.DATA.diy) {
        diyGrid.innerHTML = window.DATA.diy.map(function(d) {
            return '<div class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 cursor-pointer group" onclick="window.openModal(\'' + d.modal + '\')">'
                + '<div class="h-96 relative overflow-hidden"><img src="' + d.image + '" class="!absolute !inset-0 !w-full !h-full !object-cover !block transition-transform duration-500 group-hover:scale-110">'
                + '<div class="absolute top-5 left-5 flex flex-col gap-3 z-10"><span class="bg-white/90 backdrop-blur-sm text-primary px-4 py-2 rounded-lg text-sm font-bold shadow-sm border border-primary/10">⏱️ ' + d.tag + '</span><span class="bg-accent/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">👥 ' + (d.group || '2人成團') + '</span></div></div>'
                + '<div class="p-10 text-center"><h4 class="text-3xl font-bold text-gray-800 mb-4">' + d.name + '</h4><p class="text-primary font-serif font-bold text-3xl mb-6">' + d.price + '</p><div class="text-primary font-bold text-lg border-t border-gray-100 pt-6 opacity-0 group-hover:opacity-100 transition-opacity">了解詳情 →</div></div></div>';
        }).join('');
    }
})();
