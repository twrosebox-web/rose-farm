/* ============================================
   eco-services.js｜生態小鄰居 + 服務卡片
   ★ 改生態 → 去 data.js 的 eco
   ★ 改服務 → 去 data.js 的 services
   ============================================ */
(function() {
    if (!window.DATA) return;

    // === 生態拍立得 ===
    var ecoGrid = document.getElementById('render-eco-grid');
    if (ecoGrid && window.DATA.eco) {
        ecoGrid.innerHTML = window.DATA.eco.map(function(e) {
            return '<div class="polaroid-card relative w-80 md:w-96 bg-white p-6 pb-28 shadow-xl"><div class="w-full aspect-[4/3] bg-gray-100 mb-8 overflow-hidden border"><img src="' + e.image + '" class="!w-full !h-full !object-cover !block"></div><div class="text-center absolute bottom-10 left-0 right-0"><strong class="text-3xl block mb-2">' + e.name + '</strong><span class="text-gray-500 text-xl">' + e.desc + '</span></div><div class="absolute -top-6 -right-6 w-20 h-20 bg-accent text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg">' + e.rarity + '</div></div>';
        }).join('');
    }

    // === 服務卡片 ===
    var serviceGrid = document.getElementById('render-service-cards');
    if (serviceGrid && window.DATA.services) {
        serviceGrid.innerHTML = window.DATA.services.map(function(s) {
            var isCS = s.status === 'coming-soon';
            var cursor = s.modal ? "cursor-pointer" : "cursor-default";
            var cardCls = isCS
                ? 'bg-[#f8f5f2] rounded-3xl overflow-hidden shadow-sm ' + cursor + ' text-left relative grayscale-[80%] opacity-90 border border-gray-200 hover:grayscale-0 hover:opacity-100 hover:shadow-xl transition-all duration-500'
                : 'bg-white rounded-3xl overflow-hidden shadow-lg ' + cursor + ' transition-all hover:-translate-y-2 text-left relative group border border-transparent';
            var priceCls = isCS ? 'text-gray-500 font-bold text-2xl tracking-widest' : 'text-accent font-bold text-3xl';
            var btnHtml = '';
            if (s.modal) {
                btnHtml = isCS
                    ? '<span class="text-[#d06765] font-bold text-lg tracking-widest flex items-center gap-2">✨ 查看預告</span>'
                    : '<span class="text-primary font-bold text-xl group-hover:gap-2 flex items-center gap-1 transition-all">了解詳情 →</span>';
            } else {
                btnHtml = '<span class="text-gray-400 font-bold text-lg tracking-widest cursor-not-allowed select-none">敬請期待</span>';
            }
            var click = s.modal ? ' onclick="window.openModal(\'' + s.modal + '\')"' : '';
            var ribbon = isCS ? '<div class="absolute top-0 right-0 w-36 h-36 overflow-hidden z-30 pointer-events-none"><div class="absolute top-8 -right-12 w-48 h-10 bg-[#d06765] text-white text-center text-sm font-bold tracking-[0.2em] uppercase rotate-45 flex items-center justify-center shadow-md">Coming Soon</div></div>' : '';

            return '<div class="' + cardCls + '"' + click + '>' + ribbon + '<div class="relative aspect-[4/3] overflow-hidden"><img src="' + s.img + '" class="!absolute !inset-0 !w-full !h-full !object-cover !block transition-transform duration-700 ' + (isCS ? '' : 'group-hover:scale-110') + '"><div class="absolute top-5 left-5 flex gap-3 z-10">' + (s.tags || []).map(function(t) { return '<span class="' + (isCS ? 'bg-gray-800/70 text-white' : 'bg-white/95 text-primary') + ' backdrop-blur-sm px-5 py-2 rounded-full text-sm font-bold shadow-sm">' + t + '</span>'; }).join('') + '</div></div><div class="p-10"><h3 class="text-3xl font-bold text-gray-800 mb-6 font-serif leading-tight">' + s.title + '</h3><p class="text-gray-600 leading-relaxed mb-8 text-xl line-clamp-3">' + s.desc + '</p><div class="flex items-center justify-between pt-8 border-t border-gray-200/60"><span class="' + priceCls + '">' + s.price + '</span>' + btnHtml + '</div></div></div>';
        }).join('');
    }
})();
