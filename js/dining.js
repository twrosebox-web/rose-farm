/* ============================================
   dining.js｜玫瑰餐廳
   ★ 改用餐方案 → 去 data.js 的 diningOptions
   ★ 改料理卡片 → 去 data.js 的 food
   ============================================ */
(function() {
    if (!window.DATA) return;

    // === 用餐方案 ===
    var diningContainer = document.getElementById('render-dining-options');
    if (diningContainer && window.DATA.diningOptions) {
        diningContainer.innerHTML = window.DATA.diningOptions.map(function(opt) {
            var isRec = opt.modal === 'modal-set-meal';
            return '<div class="bg-white rounded-3xl overflow-hidden border ' + (isRec ? 'border-[#d06765]/30 ring-1 ring-[#d06765]/10' : 'border-gray-100') + ' flex flex-col cursor-pointer group transition-all hover:shadow-2xl relative"' + (opt.modal ? ' onclick="window.openModal(\'' + opt.modal + '\')"' : '') + '>'
                + '<div class="h-80 overflow-hidden relative"><img src="' + opt.img + '" class="!absolute !inset-0 !w-full !h-full !object-cover !block transition-transform duration-700 group-hover:scale-110" alt="' + opt.title + '｜大花農場玫瑰餐廳"><div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>'
                + (isRec ? '<div class="absolute top-6 right-6 bg-[#d06765] text-white text-base font-bold px-6 py-2 rounded-full shadow-lg z-10 animate-pulse">人氣推薦</div>' : '')
                + '<div class="absolute bottom-8 left-10"><h4 class="text-white text-5xl font-serif font-bold drop-shadow-md">' + opt.title + '</h4></div></div>'
                + '<div class="p-12 flex flex-col items-center text-center flex-grow">'
                + '<span class="text-[#3a5a40] text-lg font-bold tracking-[0.3em] uppercase mb-8 opacity-70">Natural Farming Rose Cuisine</span>'
                + '<p class="text-gray-600 text-2xl mb-10 leading-relaxed font-light line-clamp-3">' + opt.desc + '</p>'
                + '<div class="mt-auto w-full"><div class="w-20 h-0.5 bg-[#d06765]/20 mx-auto mb-8"></div>'
                + '<div class="text-[#d06765] font-serif font-bold text-5xl mb-8 flex items-baseline justify-center gap-2">' + opt.price + ' <span class="text-xl text-gray-400 font-sans font-normal tracking-wider">' + (opt.subPrice || '') + '</span></div>'
                + (opt.modal ? '<div class="text-[#3a5a40] font-bold text-xl flex items-center justify-center gap-2 group-hover:gap-4 transition-all tracking-widest border border-[#3a5a40]/20 rounded-full py-4 px-10 hover:bg-[#3a5a40] hover:text-white">VIEW DETAILS <span class="text-2xl">→</span></div>' : '<div class="text-gray-400 font-bold text-lg uppercase tracking-tighter">現場選位</div>')
                + '</div></div></div>';
        }).join('');
    }

    // === 更多料理 ===
    var foodContainer = document.getElementById('render-food-grid');
    if (foodContainer && window.DATA.food) {
        foodContainer.innerHTML = window.DATA.food.map(function(f) {
            return '<div class="bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer hover:shadow-xl transition-all" onclick="window.openModal(\'' + f.modal + '\')"><div class="h-72 overflow-hidden"><img src="' + f.image + '" class="!w-full !h-full !object-cover !block" alt="' + f.name + '｜大花農場玫瑰料理"></div><div class="p-10 text-center"><h4 class="text-3xl font-bold mb-4">' + f.name + '</h4><p class="text-gray-500 text-2xl">' + f.desc + '</p></div></div>';
        }).join('');
    }
})();
