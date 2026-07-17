/* ============================================
   bento.js｜Bento Grid 體驗總覽
   ★ 改格子內容 → 去 data.js 的 bentoItems
   ============================================ */
(function() {
    var container = document.getElementById('render-bento-grid');
    if (!container || !window.DATA || !window.DATA.bentoItems) return;

    container.innerHTML = '<div class="grid grid-cols-1 md:grid-cols-4 md:grid-rows-3 gap-8 md:h-[900px] text-left">'
        + window.DATA.bentoItems.map(function(it) {
            var p = 'p-8', tCls = 'text-3xl font-bold mb-2', dCls = 'text-lg opacity-90 mb-4 line-clamp-3';

            // 營業資訊格
            if (it.type === 'info') {
                return '<div class="relative ' + it.col + ' bg-primary/5 rounded-3xl ' + p + ' flex flex-col border border-primary/20 h-full select-none"><div><h4 class="text-primary font-bold text-3xl mb-4">' + it.title + '</h4><div class="text-gray-600 text-2xl mb-2 font-bold">' + it.time + '</div><div class="animate-pulse text-red-500 font-bold text-xl">' + it.note + '</div></div></div>';
            }

            // 籌備中格
            if (it.type === 'closed') {
                return '<div class="bento-item group relative rounded-3xl overflow-hidden ' + it.col + ' min-h-[250px] md:min-h-0 h-full select-none cursor-default grayscale transition-all duration-700 hover:grayscale-0"><img src="' + it.img + '" class="!absolute !inset-0 !w-full !h-full !object-cover !block transition-transform duration-[1.5s] ease-in-out group-hover:scale-110"><div class="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-700"></div><div class="absolute top-6 left-6 z-40"><span class="px-4 py-2 rounded-full text-sm font-bold tracking-widest text-white border border-white/50 bg-white/10 backdrop-blur-md shadow-lg transition-all duration-500 group-hover:bg-[#d06765] group-hover:border-transparent group-hover:scale-110 inline-block">Coming Soon / 籌備中</span></div><div class="absolute inset-x-0 bottom-0 ' + p + ' w-full z-30"><div class="bento-content"><h3 class="' + tCls + ' text-white leading-tight">' + it.title + '</h3><div class="bento-tags"><p class="' + dCls + ' text-white/90">' + it.desc + '</p><div class="flex flex-wrap gap-2">' + (it.tags || []).map(function(t) { return '<span class="inline-block px-3 py-1 bg-white/20 backdrop-blur border border-white/30 text-white text-sm rounded-full whitespace-nowrap">' + t + '</span>'; }).join('') + '</div></div></div></div></div>';
            }

            // 一般圖片格（純展示，刻意不可點，引導訪客順順往下滑）
            return '<div class="bento-item group relative rounded-3xl overflow-hidden ' + it.col + ' min-h-[250px] md:min-h-0 h-full select-none cursor-default"><img src="' + it.img + '" class="!absolute !inset-0 !w-full !h-full !object-cover !block transition-transform duration-1000 group-hover:scale-110"><div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div><div class="absolute inset-x-0 bottom-0 ' + p + ' w-full z-30"><div class="bento-content"><h3 class="' + tCls + ' text-white">' + it.title + '</h3><div class="bento-tags"><p class="' + dCls + ' text-white/90">' + (it.desc || '') + '</p><div class="flex flex-wrap gap-2">' + (it.tags || []).map(function(t) { return '<span class="inline-block px-3 py-1 bg-white/20 backdrop-blur border border-white/30 text-white text-sm rounded-full whitespace-nowrap">' + t + '</span>'; }).join('') + '</div></div></div></div></div>';
        }).join('')
        + '</div>';
})();
