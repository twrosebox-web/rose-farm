/* ============================================
   seasons.js｜四季花園 + 花曆系統
   ★ 改四季 → 去 data.js 的 seasons
   ★ 改花曆植物 → 改下面的 FLOWERS 陣列
   ★ 第二階段會改成從 Google 試算表讀取
   ============================================ */
(function() {
    if (!window.DATA) return;

    // ========== 花曆植物資料（未來會移到 Google 試算表）==========
    var FLOWERS = [
        { name: "大花玫瑰", month: "全年", type: "花卉", desc: "農場招牌品種，花瓣厚實、香氣濃郁。", img: "https://i.meee.com.tw/JbbqbHa.webp" },
        { name: "天使花", month: "全年", type: "花卉", desc: "色彩淡雅的小花，花期長。", img: "https://i.meee.com.tw/b44RbA3.webp" },
        { name: "月季", month: "全年", type: "花卉", desc: "四季開花，園區內最忠實的綻放者。", img: "https://i.meee.com.tw/OV55iLG.webp" },
        { name: "荷花", month: "06-09月", type: "花卉", desc: "夏季水池中的優雅風景。", img: "https://i.meee.com.tw/5aFulB5.webp" },
        { name: "法國薔薇", month: "04-06月", type: "花卉", desc: "古老玫瑰品種，帶有濃郁的古典氣息。", img: "https://i.meee.com.tw/EIyoxyR.webp" },
        { name: "天堂鳥", month: "全年", type: "花卉", desc: "花型奇特如鶴鳥昂首，極具熱帶風情。", img: "https://i.meee.com.tw/2FB1oTT.webp" },
        { name: "山芙蓉", month: "09-12月", type: "花卉", desc: "千面美人，一日三變色。", img: "https://i.meee.com.tw/iXDU2JX.webp" },
        { name: "羊蹄甲", month: "03-05月", type: "花卉", desc: "粉色花朵盛開如櫻花般浪漫。", img: "https://i.meee.com.tw/PGNog2x.webp" },
        { name: "九重葛", month: "10-03月", type: "花卉", desc: "熱情的紫色瀑布。", img: "https://i.meee.com.tw/4BPJUhl.webp" },
        { name: "藍花藤", month: "03-05月", type: "花卉", desc: "夢幻紫色花廊必拍景點。", img: "https://i.meee.com.tw/W9AD2uH.webp" },
        { name: "向日葵", month: "01-04月", type: "花卉", desc: "追逐陽光的金黃花海。", img: "https://i.meee.com.tw/V3MZoJ0.webp" },
        { name: "雞蛋花", month: "04-11月", type: "花卉", desc: "充滿南洋風情。", img: "https://i.meee.com.tw/zLUyj0m.webp" },
        { name: "百香果花", month: "05-11月", type: "果樹", desc: "奇特的時鐘花型。", img: "https://i.meee.com.tw/3LQdzGS.webp" },
        { name: "酪梨", month: "07-09月", type: "果樹", desc: "森林中的奶油。", img: "https://i.meee.com.tw/2Jeyn6I.webp" },
        { name: "紫夢香蕉", month: "全年", type: "果樹", desc: "夢幻的紫紅色香蕉。", img: "https://i.meee.com.tw/3Vq7hD2.webp" },
        { name: "香葉萬壽菊", month: "12-05月", type: "香草", desc: "葉片帶有百香果香氣。", img: "https://i.meee.com.tw/hZtNXnj.webp" },
        { name: "野薑花", month: "06-11月", type: "香草", desc: "香氣濃郁，夏日味道。", img: "https://i.meee.com.tw/NdRG0g4.webp" },
        { name: "金銀花", month: "04-06月", type: "香草", desc: "花色由白轉黃，傳統藥用植物。", img: "https://i.meee.com.tw/gkiDdpB.webp" },
        { name: "赤道櫻草", month: "全年", type: "蔬菜", desc: "活力菜，富含營養。", img: "https://i.meee.com.tw/9RCLxnJ.webp" },
        { name: "胡瓜", month: "04-09月", type: "蔬菜", desc: "清脆爽口的夏季瓜果。", img: "https://i.meee.com.tw/PKAryoM.webp" },
        { name: "象耳澤瀉", month: "全年", type: "觀葉", desc: "水生植物，葉片巨大如象耳。", img: "https://i.meee.com.tw/Ggm8oMv.webp" },
        { name: "旅人蕉", month: "全年", type: "觀葉", desc: "葉片排列如孔雀開屏。", img: "https://i.meee.com.tw/rZarOWq.webp" },
        { name: "龍舌蘭", month: "全年", type: "觀葉", desc: "充滿沙漠風情的王者。", img: "https://i.meee.com.tw/T0XcPVd.webp" },
        { name: "彩葉草", month: "全年", type: "觀葉", desc: "葉色變化多端，比花更豔。", img: "https://i.meee.com.tw/b0oHIA9.webp" }
    ];
    // 注意：以上只放了代表性的 24 筆，完整 90+ 筆請自行補齊
    // 第二階段會改成從 Google 試算表讀取，届時這個陣列會被取代

    // ========== 四季手風琴 ==========
    var seasonContainer = document.getElementById('render-seasons-grid');
    if (seasonContainer && window.DATA.seasons) {
        var enSeasons = ["SPRING", "SUMMER", "AUTUMN", "WINTER"];
        seasonContainer.className = "flex flex-col md:flex-row h-auto md:h-[600px] w-full gap-2 md:gap-1";
        seasonContainer.innerHTML = window.DATA.seasons.map(function(s, i) {
            var num = '0' + (i + 1);
            return '<div class="group relative flex-1 h-[300px] md:h-full overflow-hidden transition-all duration-700 ease-out hover:flex-[3] cursor-default border-b md:border-b-0 md:border-r border-white/20 last:border-0 rounded-2xl md:rounded-none first:rounded-t-2xl md:first:rounded-l-2xl last:rounded-b-2xl md:last:rounded-r-2xl z-0">'
                + '<img src="' + s.image + '" class="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110 filter brightness-[0.85] group-hover:brightness-100 -z-20">'
                + '<div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity -z-10"></div>'
                + '<div class="absolute top-6 left-8 z-20 pointer-events-none"><span class="text-white/50 group-hover:text-white/70 text-6xl md:text-8xl font-serif font-bold transition-all duration-500 select-none drop-shadow-xl">' + num + '</span></div>'
                + '<div class="absolute bottom-0 left-0 p-8 md:p-12 z-30"><div class="w-full md:w-[360px] relative">'
                + '<div class="mb-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 relative inline-block">'
                + '<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-gradient-to-r from-[#d06765]/60 via-[#d06765]/30 to-transparent blur-[60px] rounded-full -z-10 pointer-events-none mix-blend-screen opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>'
                + '<span class="text-white text-lg md:text-xl font-bold tracking-[0.25em] uppercase inline-block relative z-10 drop-shadow-[0_0_15px_rgba(208,103,101,0.9)]">' + enSeasons[i] + ' / ' + s.period + '</span></div>'
                + '<h3 class="text-3xl md:text-5xl font-bold text-white font-serif mb-6 leading-tight drop-shadow-lg relative z-10">' + s.name + '</h3>'
                + '<p class="text-gray-100 text-lg leading-relaxed font-light opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 drop-shadow-md relative z-10">' + s.desc + '</p>'
                + '</div></div></div>';
        }).join('');
    }

    // ========== 花曆系統 ==========
    var ITEMS_PER_PAGE = 12;
    window.currentFlowerCategory = '花卉';
    window.currentFlowerPage = 1;

    // 篩選
    window.filterFlowers = function(target) {
        window.currentFlowerCategory = target;
        window.currentFlowerPage = 1;
        if (typeof window.renderGanttChart === 'function') window.renderGanttChart(target);

        document.querySelectorAll('.flower-filter-btn').forEach(function(btn) {
            if (btn.innerText.includes(target)) {
                btn.className = "flower-filter-btn px-8 py-4 rounded-full text-lg md:text-xl font-bold transition-all duration-300 bg-primary text-white shadow-lg hover:shadow-xl hover:scale-105";
            } else {
                btn.className = "flower-filter-btn px-8 py-4 rounded-full text-lg md:text-xl font-bold transition-all duration-300 bg-white text-gray-600 border-2 border-gray-200 hover:border-primary hover:text-primary hover:shadow-lg";
            }
        });
        window.renderFlowerPage();

        var drawer = document.getElementById('flower-calendar-drawer');
        if (drawer && drawer.style.maxHeight !== '0px') {
            setTimeout(function() { drawer.style.maxHeight = drawer.scrollHeight + "px"; }, 100);
        }
    };

    window.changeFlowerPage = function(offset) {
        window.currentFlowerPage += offset;
        window.renderFlowerPage();
    };

    // 渲染花曆卡片
    window.renderFlowerPage = function() {
        var grid = document.getElementById('render-flower-calendar');
        var pagTop = document.getElementById('flower-pagination-top');
        var pagBot = document.getElementById('flower-pagination-bottom');
        if (!grid) return;

        var filtered = (window.currentFlowerCategory === '全部')
            ? FLOWERS
            : FLOWERS.filter(function(f) { return f.type === window.currentFlowerCategory; });

        var totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
        if (window.currentFlowerPage < 1) window.currentFlowerPage = 1;
        if (window.currentFlowerPage > totalPages) window.currentFlowerPage = totalPages;

        var start = (window.currentFlowerPage - 1) * ITEMS_PER_PAGE;
        var pageData = filtered.slice(start, start + ITEMS_PER_PAGE);

        grid.className = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 px-4 animate-fadeIn";

        if (pageData.length === 0) {
            grid.innerHTML = '<div class="col-span-full text-center text-gray-400 text-xl py-20">此分類暫無資料</div>';
        } else {
            grid.innerHTML = pageData.map(function(f) {
                return '<div class="group perspective-1000 w-full aspect-[3/4] cursor-pointer" onclick="this.querySelector(\'.flip-inner\').classList.toggle(\'is-flipped\')"><div class="flip-inner relative w-full h-full transition-all duration-700 transform-style-3d group-hover:rotate-y-180 shadow-lg hover:shadow-2xl rounded-2xl">'
                    + '<div class="absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden bg-gray-100"><img src="' + f.img + '" class="!w-full !h-full !object-cover !block"><div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3 md:opacity-0 md:group-hover:opacity-0"><span class="text-white text-sm font-bold drop-shadow">' + f.name + '</span></div></div>'
                    + '<div class="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl bg-[#3a5a40] text-white p-5 flex flex-col shadow-xl text-left">'
                    + '<div class="flex justify-end mb-1 shrink-0"><span class="text-[10px] bg-white/20 px-3 py-1 rounded-full tracking-wider">' + f.month + '</span></div>'
                    + '<div class="flex-grow flex flex-col justify-center"><h4 class="text-xl md:text-2xl font-serif font-bold mb-3 leading-snug shrink-0">' + f.name + '</h4><div class="w-10 h-[2px] bg-accent mb-3 shrink-0"></div><p class="text-sm md:text-base leading-relaxed opacity-90 font-light line-clamp-4 md:line-clamp-5">' + (f.desc || '') + '</p></div>'
                    + '<div class="mt-auto pt-3 border-t border-white/20 flex items-center justify-between shrink-0"><span class="text-[10px] tracking-[0.2em] uppercase opacity-50">Grand Blossom</span><span class="text-accent text-lg">✦</span></div>'
                    + '</div></div></div>';
            }).join('');
        }

        // 分頁按鈕
        var pagHTML = '';
        if (totalPages > 1) {
            pagHTML = '<div class="flex items-center gap-6 bg-gray-50 px-6 py-2 rounded-full border border-gray-100 shadow-sm animate-fadeIn">'
                + '<button onclick="window.changeFlowerPage(-1)" class="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:text-[#3a5a40] hover:bg-white hover:shadow-md transition-all disabled:opacity-20 disabled:cursor-not-allowed"' + (window.currentFlowerPage === 1 ? ' disabled' : '') + '>←</button>'
                + '<span class="text-lg font-serif font-bold text-[#3a5a40] tracking-widest min-w-[80px] text-center select-none">' + window.currentFlowerPage + ' <span class="text-sm text-gray-400 mx-1 font-sans">/</span> ' + totalPages + '</span>'
                + '<button onclick="window.changeFlowerPage(1)" class="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:text-[#3a5a40] hover:bg-white hover:shadow-md transition-all disabled:opacity-20 disabled:cursor-not-allowed"' + (window.currentFlowerPage === totalPages ? ' disabled' : '') + '>→</button>'
                + '</div>';
        }
        if (pagTop) pagTop.innerHTML = pagHTML;
        if (pagBot) pagBot.innerHTML = pagHTML;
    };

    // 甘特圖
    window.renderGanttChart = function(category) {
        var container = document.getElementById('gantt-rows-container');
        if (!container) return;
        var data = (category === '全部') ? FLOWERS : FLOWERS.filter(function(f) { return f.type === category; });
        if (data.length === 0) { container.innerHTML = '<div class="p-8 text-center text-gray-400">目前沒有資料</div>'; return; }

        var oneMonth = 100 / 12;
        container.innerHTML = data.map(function(f) {
            var barsHTML = '';
            var s = String(f.month).trim();
            var colorClass = 'from-primary/60 to-primary/30';
            if (f.type === '果樹') colorClass = 'from-amber-500/60 to-amber-400/30';
            if (f.type === '香草') colorClass = 'from-emerald-500/60 to-emerald-400/30';
            if (f.type === '蔬菜') colorClass = 'from-lime-600/60 to-lime-500/30';
            if (f.type === '觀葉') colorClass = 'from-teal-600/60 to-teal-500/30';
            var barStyle = 'class="absolute h-3 rounded-full shadow-sm bg-gradient-to-r ' + colorClass + ' z-10 top-1/2 -translate-y-1/2"';

            if (s.includes('全年')) {
                barsHTML = '<div ' + barStyle + ' style="left:0;right:0;"></div>';
            } else {
                var m = s.match(/\d+/g);
                if (m) {
                    var st = parseInt(m[0]), en = m.length > 1 ? parseInt(m[1]) : st;
                    if (st <= en) {
                        barsHTML = '<div ' + barStyle + ' style="left:' + ((st-1)*oneMonth) + '%;right:' + ((12-en)*oneMonth) + '%;"></div>';
                    } else {
                        barsHTML = '<div ' + barStyle + ' style="left:' + ((st-1)*oneMonth) + '%;right:0;"></div>'
                            + '<div ' + barStyle + ' style="left:0;right:' + ((12-en)*oneMonth) + '%;"></div>';
                    }
                }
            }

            return '<div class="flex items-center border-b border-gray-100/50 py-3 hover:bg-primary/5 transition-colors rounded-lg cursor-default">'
                + '<div class="w-[220px] shrink-0 pl-4 flex items-center gap-3"><span class="w-2 h-2 rounded-full ' + (f.type==='花卉'?'bg-primary':f.type==='果樹'?'bg-amber-500':'bg-gray-400') + '"></span><span class="text-sm font-bold text-gray-600 tracking-wide truncate pr-2">' + f.name + '</span></div>'
                + '<div class="flex-1 relative h-6 mr-4 overflow-visible"><div class="absolute inset-0 grid grid-cols-12 pointer-events-none opacity-10">' + '<div class="border-l border-gray-400"></div>'.repeat(12) + '</div>' + barsHTML + '</div>'
                + '</div>';
        }).join('');
    };

    // 花曆抽屜開關
    window.toggleFlowerCalendar = function() {
        var drawer = document.getElementById('flower-calendar-drawer');
        var anchor = document.getElementById('calendar-anchor');
        if (!drawer) return;
        var isClosed = !drawer.style.maxHeight || drawer.style.maxHeight === '0px' || drawer.style.opacity === '0';
        if (isClosed) {
            var grid = document.getElementById('render-flower-calendar');
            if (grid && grid.innerHTML.trim() === "") {
                if (typeof window.filterFlowers === 'function') window.filterFlowers('花卉');
                if (typeof window.renderGanttChart === 'function') window.renderGanttChart('花卉');
            }
            drawer.style.opacity = '1';
            drawer.style.maxHeight = drawer.scrollHeight + "px";
        } else {
            drawer.style.opacity = '0';
            drawer.style.maxHeight = '0px';
            setTimeout(function() { anchor.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 300);
        }
    };

    // 初始化（預先渲染花曆內容，避免第一次打開閃白）
    setTimeout(function() {
        if (typeof window.filterFlowers === 'function') window.filterFlowers('花卉');
        if (typeof window.renderGanttChart === 'function') window.renderGanttChart('花卉');
    }, 500);

})();
