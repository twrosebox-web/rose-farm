/* ============================================
   elevator.js｜電梯導覽列
   ★ 改按鈕項目 → 去 data.js 的 navItems
   ★ 改官網網址 → 去 data.js 的 homeUrl
   ============================================ */
(function() {
    // === 電梯開關 ===
    window.toggleElevator = function() {
        var c = document.getElementById('elevator-container');
        var btn = document.getElementById('elevator-toggle');
        if (c.classList.contains('nav-open')) {
            c.classList.remove('nav-open');
            btn.innerHTML = '☰';
        } else {
            c.classList.add('nav-open');
            btn.innerHTML = '✕';
        }
    };

    // === 渲染按鈕 ===
    var wrapper = document.getElementById('nav-items-wrapper');
    if (!wrapper || !window.DATA || !window.DATA.navItems) return;

    var homeUrl = window.DATA.homeUrl || '#';

    wrapper.innerHTML = window.DATA.navItems.map(function(n) {
        var icon = n.icon || '';
        var color = n.color || '#3a5a40';
        // 圖示色圈
        var iconCircle = '<span class="shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-lg md:text-xl shadow-sm" style="background:' + color + '22;">' + icon + '</span>';

        // 「回官網首頁」特殊處理：填色按鈕，跳轉到 Mshop
        if (n.id === '_home_') {
            return '<a href="' + homeUrl + '" class="nav-item flex items-center gap-3 h-12 md:h-16 pl-2 pr-5 md:pr-7 rounded-full text-base md:text-xl font-bold shadow-md hover:-translate-x-1 origin-right transition-all no-underline text-white" style="background:' + color + ';opacity:0;transform:translateY(20px);pointer-events:none;">'
                + '<span class="shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-lg md:text-xl bg-white/20">' + icon + '</span>' + n.name + '</a>';
        }
        // 一般按鈕：白底 + 彩色圖示圈 + 左側色條
        return '<button onclick="window.scrollToSection(\'' + n.id + '\');window.toggleElevator()" class="nav-item flex items-center gap-3 h-12 md:h-16 pl-2 pr-5 md:pr-7 bg-white rounded-full text-base md:text-xl font-bold text-gray-700 shadow-md hover:-translate-x-1 hover:shadow-lg origin-right transition-all border-l-4" style="border-left-color:' + color + ';opacity:0;transform:translateY(20px);pointer-events:none;">'
            + iconCircle + '<span style="color:' + color + ';">' + n.name + '</span></button>';
    }).join('');
})();
