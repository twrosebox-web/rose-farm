/* ============================================
   features.js｜三大特色介紹
   ★ 改文案/圖片 → 去 data.js 的 features
   ★ 改輪播速度 → 改下面的 3000（毫秒）
   ============================================ */
(function() {
    var container = document.getElementById('render-intro-features');
    if (!container || !window.DATA || !window.DATA.features) return;

    container.innerHTML = window.DATA.features.map(function(f, fi) {
        var slidesHTML = f.images.map(function(src, si) {
            return '<img src="' + src + '" data-content-key="features.' + fi + '.images.' + si + '" class="feature-slide-' + fi + ' !absolute !inset-0 !w-full !h-full !object-cover !block transition-opacity duration-1000 ' + (si === 0 ? 'opacity-100' : 'opacity-0') + '" style="z-index:' + (10 - si) + ';" alt="' + f.title + '">';
        }).join('');

        return '<div class="flex flex-col md:flex-row items-center gap-16 md:gap-24 mb-32 last:mb-0 ' + (f.reverse ? 'md:flex-row-reverse' : '') + '">'
            + '<div class="w-full md:w-1/2 relative group cursor-pointer"><div class="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xl bg-gray-100">' + slidesHTML + '<div class="absolute inset-0 border-[1px] border-white/20 rounded-2xl pointer-events-none z-20"></div></div><div class="absolute -bottom-8 -right-8 w-32 h-32 bg-white rounded-full flex items-center justify-center text-7xl font-serif text-accent/20 font-bold -z-10">' + f.id + '</div></div>'
            + '<div class="w-full md:w-1/2 text-left"><span class="text-accent text-lg font-bold tracking-[0.2em] uppercase mb-6 block">' + f.titleEn + '</span><h3 class="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-10 leading-tight">' + f.title + '</h3><p class="text-gray-600 text-3xl leading-loose font-light border-l-8 border-primary/20 pl-10">' + f.desc + '</p></div>'
            + '</div>';
    }).join('');

    // 啟動每組輪播
    window.DATA.features.forEach(function(f, fi) {
        var slides = document.querySelectorAll('.feature-slide-' + fi);
        if (slides.length <= 1) return;
        var current = 0;
        setInterval(function() {
            slides[current].classList.remove('opacity-100');
            slides[current].classList.add('opacity-0');
            current = (current + 1) % slides.length;
            slides[current].classList.remove('opacity-0');
            slides[current].classList.add('opacity-100');
        }, 3000);
    });
})();
