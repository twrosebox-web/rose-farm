/* ============================================
   gallery.js｜相簿 Gallery
   ★ 改圖片 → 去 data.js 的 gallery
   ============================================ */
(function() {
    if (!window.DATA || !window.DATA.gallery) return;

    window.currentGalleryIndex = 0;

    // 更新大圖
    window.upG = function(i) {
        var item = window.DATA.gallery[i];
        if (!item) return;
        window.currentGalleryIndex = i;
        var mainImg = document.getElementById('main-gallery-img');
        var titleEl = document.getElementById('main-gallery-title');
        var thumbContainer = document.getElementById('render-gallery-thumbs');
        if (!mainImg || !titleEl) return;

        mainImg.style.opacity = "0.7";
        setTimeout(function() {
            mainImg.src = item.image;
            titleEl.innerText = item.title;
            mainImg.style.opacity = "1";
        }, 150);

        if (thumbContainer && thumbContainer.children.length > 0) {
            Array.from(thumbContainer.children).forEach(function(el, idx) {
                el.style.opacity = (idx === i ? '1' : '0.4');
                el.style.borderColor = (idx === i ? '#3a5a40' : 'transparent');
                el.style.transform = (idx === i ? 'scale(1.05)' : 'scale(1)');
            });
        }
    };

    window.changeG = function(offset) {
        var total = window.DATA.gallery.length;
        var newIndex = (window.currentGalleryIndex + offset + total) % total;
        window.upG(newIndex);
    };

    window.handleImageClick = function() {
        var item = window.DATA.gallery[window.currentGalleryIndex];
        window.openLightbox(item.image, item.title);
    };

    // 渲染縮圖列
    var thumbContainer = document.getElementById('render-gallery-thumbs');
    if (thumbContainer) {
        thumbContainer.innerHTML = window.DATA.gallery.map(function(it, i) {
            return '<div class="aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-500 border-2 border-transparent" onclick="window.upG(' + i + ')"><img src="' + it.image + '" class="!w-full !h-full !object-cover !block"></div>';
        }).join('');
    }
    window.upG(0);
})();
