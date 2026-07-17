/* ============================================
   info-faq.js｜參觀資訊 + FAQ
   ★ 改服務圖示 → 去 data.js 的 qa.infoIcons
   ★ 改問答 → 去 data.js 的 qa.categories
   ============================================ */
(function() {
    if (!window.DATA || !window.DATA.qa) return;

    // === 園區服務與須知圖示 ===
    var infoContainer = document.getElementById('render-quick-info');
    if (infoContainer && window.DATA.qa.infoIcons) {
        infoContainer.innerHTML = window.DATA.qa.infoIcons.map(function(item) {
            return '<div class="flex flex-col items-center text-center group cursor-default">'
                + '<div class="text-5xl mb-4 opacity-90 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">' + item.icon + '</div>'
                + '<h5 class="font-bold text-[#3a5a40] text-xl mb-1 tracking-wide">' + item.title + '</h5>'
                + '<p class="text-gray-500 text-base font-medium">' + item.text + '</p>'
                + '</div>';
        }).join('');
    }

    // === FAQ 答案渲染（支援 4 種類型）===
    // 1. 文字（預設）：{ q, a: "文字" }
    // 2. 表格：{ q, type:'table', rows:[{label,value,note}] }
    // 3. 圖文：{ q, type:'image', img:"網址", a:"說明" }
    // 4. 列表：{ q, type:'list', items:["重點1","重點2"] }
    function renderAnswer(item) {
        var type = item.type || 'text';

        if (type === 'table' && item.rows) {
            var rows = item.rows.map(function(r) {
                return '<div class="grid grid-cols-[72px_1fr] gap-2 py-2 border-b border-gray-100 last:border-0 items-baseline">'
                    + '<span class="font-bold text-[#3a5a40]">' + (r.label || '') + '</span>'
                    + '<div><span class="text-gray-800 font-bold text-lg">' + (r.value || '') + '</span>'
                    + (r.note ? '<span class="text-sm text-[#d06765] ml-2">' + r.note + '</span>' : '')
                    + '</div></div>';
            }).join('');
            return '<div class="w-full mt-1">' + rows + '</div>';
        }

        if (type === 'image') {
            return '<div class="mt-1">'
                + (item.img ? '<img src="' + item.img + '" class="!w-full !h-auto !rounded-xl !mb-3 !block" alt="' + (item.alt || item.q || '大花農場參觀資訊') + '">' : '')
                + (item.a ? '<p>' + item.a + '</p>' : '')
                + '</div>';
        }

        if (type === 'list' && item.items) {
            var lis = item.items.map(function(t) {
                return '<li class="flex items-start gap-2 mb-2"><span class="text-accent mt-1 shrink-0">✓</span><span>' + t + '</span></li>';
            }).join('');
            return '<ul class="mt-1">' + lis + '</ul>';
        }

        // 預設：純文字（支援 \n 換行）
        return '<p>' + String(item.a || '').replace(/\n/g, '<br>') + '</p>';
    }

    // === FAQ 分類切換 ===
    window.renderQA = function(catId) {
        var tabs = document.getElementById('qa-tabs');
        var grid = document.getElementById('render-qa-grid');
        var data = window.DATA.qa.categories;
        var activeCat = data.find(function(c) { return c.id === catId; });
        if (!activeCat) return;

        tabs.innerHTML = data.map(function(c) {
            return '<button onclick="window.renderQA(\'' + c.id + '\')" class="px-4 py-1.5 rounded-full text-sm md:text-base font-bold transition-all border '
                + (c.id === catId ? 'bg-primary text-white border-primary shadow-md transform scale-105' : 'bg-white text-gray-500 border-gray-200 hover:border-primary hover:text-primary')
                + '">' + c.name + '</button>';
        }).join('');

        grid.innerHTML = activeCat.list.map(function(item, index) {
            return '<details class="qa-accordion bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:border-primary/30"' + (index === 0 ? ' open' : '') + '>'
                + '<summary class="cursor-pointer px-5 py-3.5 md:px-6 md:py-4 flex items-center justify-between gap-4 select-none">'
                + '<span class="font-bold text-gray-900 text-lg md:text-xl flex items-center gap-3 leading-snug"><span class="text-accent shrink-0 font-serif">Q.</span><span>' + item.q + '</span></span>'
                + '<span class="qa-toggle shrink-0 w-8 h-8 rounded-full bg-[#3a5a40]/5 text-[#3a5a40] flex items-center justify-center text-xl font-light transition-all duration-300">＋</span>'
                + '</summary>'
                + '<div class="px-5 pb-4 md:px-6 md:pb-5"><div class="text-gray-600 text-base md:text-lg leading-7 pl-8 md:pl-10 pr-2">' + renderAnswer(item) + '</div></div>'
                + '</details>';
        }).join('');
    };

    // 預設顯示第一個分類
    window.renderQA('park');
})();
