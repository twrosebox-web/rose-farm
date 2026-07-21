/* ============================================
   products-diy.js｜伴手禮 + DIY 體驗
   ★ 改伴手禮 → 去 data.js 的 products
   ★ 改 DIY → 去 data.js 的 diy
   ============================================ */
(function() {
    if (!window.DATA) return;

    function escapeHtml(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, function(char) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
        });
    }

    // === 伴手禮 ===
    var prodGrid = document.getElementById('render-products-grid');
    if (prodGrid && window.DATA.products) {
        prodGrid.innerHTML = window.DATA.products.map(function(p) {
            return '<div class="text-center"><div class="w-full aspect-square rounded-full overflow-hidden border-8 border-[#fffcf5] shadow-lg mb-10 mx-auto max-w-[320px]"><img src="' + escapeHtml(p.image) + '" class="!w-full !h-full !object-cover !block" alt="' + escapeHtml(p.name) + '｜大花農場玫瑰伴手禮"></div><h3 class="text-3xl font-serif text-primary font-bold mb-4">' + escapeHtml(p.name) + '</h3><p class="text-gray-500 text-2xl line-clamp-2">' + escapeHtml(p.desc) + '</p></div>';
        }).join('');
    }

    // === DIY ===
    var diyGrid = document.getElementById('render-diy-grid');
    if (diyGrid && window.DATA.diy) {
        var diyItems = window.DATA.diy.filter(function(d) {
            return d
                && d.enabled === true
                && String(d.name || '').trim()
                && String(d.price || '').trim()
                && String(d.tag || '').trim()
                && String(d.group || '').trim()
                && /^https:\/\//i.test(String(d.image || '').trim());
        });
        var phone = String((window.DATA.siteConfig && window.DATA.siteConfig.phone) || '08-810-1858');
        var phoneHref = phone.replace(/[^0-9+]/g, '');
        diyGrid.innerHTML = diyItems.map(function(d) {
            var modalKey = String(d.modal || '');
            var hasModal = !!(modalKey && window.DATA.modalContent
                && Object.prototype.hasOwnProperty.call(window.DATA.modalContent, modalKey));
            var modalAttr = hasModal
                ? ' data-diy-modal="' + escapeHtml(modalKey) + '" role="button" tabindex="0"'
                : '';
            var cardClass = 'bg-white rounded-2xl overflow-hidden shadow-sm transition-all group'
                + (hasModal ? ' hover:shadow-xl hover:-translate-y-2 cursor-pointer' : '');
            var action = hasModal
                ? '<div class="text-primary font-bold text-lg border-t border-gray-100 pt-6 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">了解詳情 →</div>'
                : '<a class="inline-block text-primary font-bold text-lg border-t border-gray-100 pt-6" href="tel:' + escapeHtml(phoneHref) + '">電話洽詢 ' + escapeHtml(phone) + '</a>';
            return '<div class="' + cardClass + '"' + modalAttr + '>'
                + '<div class="h-96 relative overflow-hidden"><img src="' + escapeHtml(d.image) + '" class="!absolute !inset-0 !w-full !h-full !object-cover !block transition-transform duration-500 group-hover:scale-110" alt="' + escapeHtml(d.name) + '｜大花農場手作體驗">'
                + '<div class="absolute top-5 left-5 flex flex-col gap-3 z-10"><span class="bg-white/90 backdrop-blur-sm text-primary px-4 py-2 rounded-lg text-sm font-bold shadow-sm border border-primary/10">⏱️ ' + escapeHtml(d.tag) + '</span><span class="bg-accent/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">👥 ' + escapeHtml(d.group) + '</span></div></div>'
                + '<div class="p-10 text-center"><h4 class="text-3xl font-bold text-gray-800 mb-4">' + escapeHtml(d.name) + '</h4><p class="text-primary font-serif font-bold text-3xl mb-6">' + escapeHtml(d.price) + '</p>' + action + '</div></div>';
        }).join('');
        if (!diyItems.length) {
            diyGrid.innerHTML = '<p class="col-span-full text-center text-gray-500 text-xl py-10">目前沒有開放中的 DIY 活動。</p>';
        }
        Array.prototype.forEach.call(diyGrid.querySelectorAll('[data-diy-modal]'), function(card) {
            function openCardModal() {
                window.openModal(card.getAttribute('data-diy-modal'));
            }
            card.addEventListener('click', openCardModal);
            card.addEventListener('keydown', function(event) {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                openCardModal();
            });
        });
    }
})();
