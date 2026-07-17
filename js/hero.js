/* ============================================
   hero.js｜Hero 輪播
   ★ 改圖片 → 去 data.js 的 heroSlides
   ★ 改輪播速度 → 改下面的 5000（毫秒）
   ============================================ */
(function() {
    var slider = document.getElementById('render-hero-slider');
    if (!slider || !window.DATA || !window.DATA.heroSlides) return;

    var slides = window.DATA.heroSlides;
    var idx = 0;

    slider.innerHTML = slides.map(function(s, i) {
        return '<div class="hero-slide absolute inset-0 transition-opacity duration-1000 ' + (i === 0 ? 'opacity-100' : 'opacity-0') + '">'
            + '<img src="' + s.image + '" class="!w-full !h-full !object-cover !block animate-zoom">'
            + '<div class="absolute inset-0 bg-black/30"></div>'
            + '</div>';
    }).join('');

    setInterval(function() {
        idx = (idx + 1) % slides.length;
        document.querySelectorAll('.hero-slide').forEach(function(el, i) {
            el.style.opacity = (i === idx ? '1' : '0');
        });
    }, 5000);
})();
