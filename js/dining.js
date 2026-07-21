/* ============================================
   dining.js｜玫瑰餐廳
   ★ 餐廳主文案 → data.js 的 diningContent
   ★ 用餐方案 → data.js 的 diningOptions
   ★ 料理卡片 → data.js 的 food
   ============================================ */
(function() {
    if (!window.DATA) return;

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function setText(id, value) {
        var element = document.getElementById(id);
        if (element && value != null) element.textContent = String(value);
    }

    function bindModalCards(container) {
        if (!container) return;
        container.querySelectorAll('[data-modal-id]').forEach(function(card) {
            card.addEventListener('click', function() {
                var modalId = card.getAttribute('data-modal-id');
                if (modalId && typeof window.openModal === 'function') window.openModal(modalId);
            });
        });
    }

    var content = window.DATA.diningContent || {};
    setText('dining-ticket-notice', content.ticketNotice);
    setText('dining-signature-title', content.signatureTitle);
    setText('dining-signature-english', content.signatureEnglish);
    setText('dining-signature-description-1', content.signatureDescription1);
    setText('dining-signature-description-2', content.signatureDescription2);
    setText('dining-highlight-1-title', content.highlight1Title);
    setText('dining-highlight-1-description', content.highlight1Description);
    setText('dining-highlight-2-title', content.highlight2Title);
    setText('dining-highlight-2-description', content.highlight2Description);
    setText('dining-group-notice', content.groupNotice);

    // === 用餐方案 ===
    var diningContainer = document.getElementById('render-dining-options');
    if (diningContainer && window.DATA.diningOptions) {
        diningContainer.innerHTML = window.DATA.diningOptions.map(function(opt, optionIndex) {
            var isRec = opt.modal === 'modal-set-meal';
            var modalAttr = opt.modal ? ' data-modal-id="' + escapeHtml(opt.modal) + '"' : '';
            return '<div class="bg-white rounded-3xl overflow-hidden border ' + (isRec ? 'border-[#d06765]/30 ring-1 ring-[#d06765]/10' : 'border-gray-100') + ' flex flex-col cursor-pointer group transition-all hover:shadow-2xl relative"' + modalAttr + '>'
                + '<div class="h-80 overflow-hidden relative"><img src="' + escapeHtml(opt.img) + '" data-content-key="diningOptions.' + optionIndex + '.img" class="!absolute !inset-0 !w-full !h-full !object-cover !block transition-transform duration-700 group-hover:scale-110" alt="' + escapeHtml(opt.title) + '｜大花農場玫瑰餐廳"><div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>'
                + (isRec ? '<div class="absolute top-6 right-6 bg-[#d06765] text-white text-base font-bold px-6 py-2 rounded-full shadow-lg z-10 animate-pulse">人氣推薦</div>' : '')
                + '<div class="absolute bottom-8 left-10"><h4 class="text-white text-5xl font-serif font-bold drop-shadow-md">' + escapeHtml(opt.title) + '</h4></div></div>'
                + '<div class="p-12 flex flex-col items-center text-center flex-grow">'
                + '<span class="text-[#3a5a40] text-lg font-bold tracking-[0.3em] uppercase mb-8 opacity-70">Natural Farming Rose Cuisine</span>'
                + '<p class="text-gray-600 text-2xl mb-10 leading-relaxed font-light line-clamp-3">' + escapeHtml(opt.desc) + '</p>'
                + '<div class="mt-auto w-full"><div class="w-20 h-0.5 bg-[#d06765]/20 mx-auto mb-8"></div>'
                + '<div class="text-[#d06765] font-serif font-bold text-5xl mb-8 flex items-baseline justify-center gap-2">' + escapeHtml(opt.price) + ' <span class="text-xl text-gray-400 font-sans font-normal tracking-wider">' + escapeHtml(opt.subPrice || '') + '</span></div>'
                + (opt.modal ? '<div class="text-[#3a5a40] font-bold text-xl flex items-center justify-center gap-2 group-hover:gap-4 transition-all tracking-widest border border-[#3a5a40]/20 rounded-full py-4 px-10 hover:bg-[#3a5a40] hover:text-white">VIEW DETAILS <span class="text-2xl">→</span></div>' : '<div class="text-gray-400 font-bold text-lg uppercase tracking-tighter">現場選位</div>')
                + '</div></div></div>';
        }).join('');
        bindModalCards(diningContainer);
    }

    // === 更多料理 ===
    var foodContainer = document.getElementById('render-food-grid');
    if (foodContainer && window.DATA.food) {
        foodContainer.innerHTML = window.DATA.food.map(function(food, foodIndex) {
            var modalAttr = food.modal ? ' data-modal-id="' + escapeHtml(food.modal) + '"' : '';
            return '<div class="bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer hover:shadow-xl transition-all"' + modalAttr + '><div class="h-72 overflow-hidden"><img src="' + escapeHtml(food.image) + '" data-content-key="food.' + foodIndex + '.image" class="!w-full !h-full !object-cover !block" alt="' + escapeHtml(food.name) + '｜大花農場玫瑰料理"></div><div class="p-10 text-center"><h4 class="text-3xl font-bold mb-4">' + escapeHtml(food.name) + '</h4><p class="text-gray-500 text-2xl">' + escapeHtml(food.desc) + '</p></div></div>';
        }).join('');
        bindModalCards(foodContainer);
    }
})();
