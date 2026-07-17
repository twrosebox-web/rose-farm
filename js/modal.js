/* ============================================
   modal.js｜Modal / Lightbox 共用系統
   ★ 這個檔案通常不需要改
   ============================================ */
(function() {

    // === scrollToSection ===
    window.scrollToSection = function(id) {
        var el = document.getElementById(id);
        if(el) el.scrollIntoView({behavior: 'smooth'});
    };

    // === Lightbox ===
    window.openLightbox = function(src, title, desc) {
        var lb = document.getElementById('lightbox');
        if (!lb) return;
        document.getElementById('lightbox-img').src = src;
        document.getElementById('lightbox-img').alt = title ? title + '｜大花玫瑰休閒農場' : '大花農場園區相簿大圖';
        document.getElementById('lightbox-title').innerText = title || '';
        document.getElementById('lightbox-desc').innerText = desc || '';
        lb.classList.remove('hidden');
    };
    window.closeLightbox = function() {
        document.getElementById('lightbox').classList.add('hidden');
    };

    // === Modal 系統 ===
    window.richCarousel = { images: [], index: 0, timer: null, alt: '' };

    window.closeModal = function() {
        var bd = document.getElementById('modal-backdrop');
        if (!bd) return;
        if (window.richCarousel.timer) { clearInterval(window.richCarousel.timer); window.richCarousel.timer = null; }
        bd.classList.add('hidden');
        document.body.style.overflow = '';
    };

    window.changeModalImage = function(dir) {
        var t = window.richCarousel.images.length;
        if (t === 0) return;
        var n = window.richCarousel.index + dir;
        if (n < 0) n = t - 1;
        if (n >= t) n = 0;
        window.switchModalImage(n);
    };

    window.switchModalImage = function(idx) {
        var imgs = window.richCarousel.images;
        if (!imgs || idx < 0 || idx >= imgs.length) return;
        window.richCarousel.index = idx;
        var main = document.getElementById('modal-main-img');
        if (main) {
            var item = imgs[idx];
            main.style.opacity = '0.5';
            main.src = typeof item === 'string' ? item : item.src;
            main.alt = (typeof item === 'object' && item.caption) ? item.caption : window.richCarousel.alt;
            setTimeout(function() { main.style.opacity = '1'; }, 50);
        }
        var cap = document.getElementById('modal-caption-box');
        if (cap) {
            var item2 = imgs[idx];
            var txt = (typeof item2 === 'object' && item2.caption) ? item2.caption : "";
            cap.textContent = txt;
            if (txt) { cap.classList.remove('-translate-x-4','opacity-0'); cap.classList.add('translate-x-0','opacity-100'); }
            else { cap.classList.add('-translate-x-4','opacity-0'); cap.classList.remove('translate-x-0','opacity-100'); }
        }
        document.querySelectorAll('.modal-thumb').forEach(function(th, i) {
            th.style.opacity = i === idx ? '1' : '0.5';
            th.style.borderColor = i === idx ? '#3a5a40' : 'transparent';
            th.style.transform = i === idx ? 'scale(1.05)' : 'scale(1)';
        });
    };

    // === openModal（三種 layout：teaser / simple / rich）===
    window.openModal = function(key) {
        var d = window.DATA && window.DATA.modalContent ? window.DATA.modalContent[key] : null;
        var bd = document.getElementById('modal-backdrop');
        if (!bd) return;
        var ct = bd.querySelector('div');
        if (!ct) return;
        if (window.richCarousel.timer) { clearInterval(window.richCarousel.timer); window.richCarousel.timer = null; }

        // 地圖
        if (key === 'modal-map') {
            ct.className = "bg-white p-0 w-[95vw] h-[95vh] overflow-auto relative shadow-2xl animate-fadeIn";
            ct.innerHTML = '<div class="relative md:min-w-[1200px] md:min-h-[800px] w-full h-full bg-gray-100 flex items-center justify-center"><button onclick="window.closeModal()" class="fixed top-4 right-4 md:top-8 md:right-8 z-[100] w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-black/80 text-white shadow-xl text-2xl md:text-4xl cursor-pointer">✕</button><img src="https://res.cloudinary.com/daypc93hn/image/upload/v1760079811/park-map-original_in4u4q.jpg" class="!w-full !h-auto md:!h-full !object-contain md:!object-cover" alt="園區地圖"><p class="absolute bottom-4 left-0 right-0 text-center text-gray-400 text-sm md:hidden">雙指縮放查看細節</p></div>';
        } else if (d) {

            // Teaser
            if (d.layout === 'teaser') {
                ct.className = "bg-transparent p-0 max-w-4xl w-full animate-fadeIn shadow-2xl m-4 relative overflow-hidden rounded-2xl";
                ct.innerHTML = '<div class="relative w-full h-[600px] md:h-[700px] group"><img src="'+d.image+'" class="absolute inset-0 w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110" alt="'+d.title+'預告"><div class="absolute inset-0 bg-black/70"></div><div class="absolute inset-0 flex flex-col items-center justify-center text-center p-10 text-white pointer-events-none"><span class="text-[#d06765] font-bold tracking-[0.4em] uppercase mb-6 text-sm animate-pulse">'+(d.sub||'COMING SOON')+'</span><h2 class="text-5xl md:text-7xl font-serif font-bold mb-10 drop-shadow-lg leading-tight">'+d.title+'</h2><div class="w-20 h-1 bg-[#d06765] mb-10 rounded-full"></div><div class="text-xl md:text-2xl font-light leading-loose tracking-wider opacity-90 font-serif mb-12">'+d.desc+'</div></div><button onclick="window.closeModal()" class="absolute top-6 right-6 z-[100] w-12 h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur text-white hover:bg-white hover:text-black transition-all text-2xl cursor-pointer pointer-events-auto">✕</button></div>';

            // Simple
            } else if (d.layout === 'simple') {
                ct.className = "bg-white p-0 rounded-2xl max-w-5xl w-full animate-fadeIn shadow-2xl overflow-hidden m-4";
                var sImgs = d.images || [d.image];
                var sSlides = sImgs.map(function(src,i){ return '<img id="simple-slide-'+i+'" src="'+src+'" class="!absolute !inset-0 !w-full !h-full !object-cover !block transition-opacity duration-1000" style="opacity:'+(i===0?1:0)+'" alt="'+d.title+'">'; }).join('');
                ct.innerHTML = '<div class="relative bg-[#fffcf8] flex flex-col md:flex-row h-[80vh] md:h-[70vh]"><div class="relative w-full md:w-3/5 h-1/2 md:h-full bg-gray-200 overflow-hidden">'+sSlides+'</div><div class="w-full md:w-2/5 p-10 md:p-12 text-left flex flex-col justify-center bg-white overflow-y-auto"><span class="text-accent font-bold tracking-[0.3em] text-xs mb-3 block uppercase">Signature Choice</span><h2 class="text-3xl md:text-4xl font-serif font-bold text-primary mb-6">'+d.title+'</h2><div class="w-10 h-1 bg-accent/30 mb-6 rounded-full"></div><p class="text-gray-600 text-lg leading-relaxed font-light">'+(d.desc||'')+'</p></div><button onclick="window.closeModal()" class="absolute top-4 right-4 z-[100] w-12 h-12 flex items-center justify-center rounded-full bg-black/20 backdrop-blur text-white text-2xl cursor-pointer">✕</button></div>';
                if (sImgs.length > 1) { var cur = 0; window.richCarousel.timer = setInterval(function(){ var bd2=document.getElementById('modal-backdrop'); if(bd2&&bd2.classList.contains('hidden')){clearInterval(window.richCarousel.timer);return;} var c1=document.getElementById('simple-slide-'+cur); var nx=(cur+1)%sImgs.length; var c2=document.getElementById('simple-slide-'+nx); if(c1&&c2){c1.style.opacity='0';c2.style.opacity='1';cur=nx;} }, 3000); }

            // Rich
            } else if (d.layout === 'rich') {
                ct.className = "bg-transparent p-0 max-w-6xl w-full animate-fadeIn shadow-2xl m-4";
                var rImgs = d.images || ["https://via.placeholder.com/800"];
                window.richCarousel.images = rImgs;
                window.richCarousel.index = 0;
                window.richCarousel.alt = d.title;
                var hasMultiple = rImgs.length > 1;
                var thumbs = hasMultiple ? rImgs.map(function(it,i){ var s=typeof it==='string'?it:it.src; var a=(typeof it==='object'&&it.caption)?it.caption:d.title; return '<div class="modal-thumb w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden cursor-pointer border-2 transition-all shrink-0 bg-gray-200 hover:scale-105 relative z-30" style="opacity:'+(i===0?'1':'0.5')+';border-color:'+(i===0?'#3a5a40':'transparent')+'" onclick="event.stopPropagation();window.switchModalImage('+i+')"><img src="'+s+'" class="!w-full !h-full !object-cover !block" draggable="false" alt="'+a+'縮圖"></div>'; }).join('') : '';
                var stats = (d.stats||[]).map(function(s){ return '<div class="text-center"><div class="text-3xl mb-1">'+s.icon+'</div><div class="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">'+s.label+'</div><div class="text-xl font-bold text-gray-800">'+s.value+'</div></div>'; }).join('');
                var hls = (d.highlights||[]).map(function(h){ return '<li class="text-lg text-gray-600 flex items-start gap-2"><span class="text-accent mt-1">✓</span> '+h+'</li>'; }).join('');
                var tags = (d.tags||[]).map(function(t){ return '<span class="inline-block w-fit px-3 py-1 bg-primary/10 text-primary text-sm font-bold rounded-full border border-primary/20">'+t+'</span>'; }).join('');
                var f1 = rImgs[0]; var fCap = (typeof f1==='object'&&f1.caption)?f1.caption:""; var fSrc = typeof f1==='string'?f1:f1.src;
                // 根據內容量決定高度
                var modalH = hasMultiple ? 'h-[85vh] max-h-[900px]' : 'h-auto max-h-[85vh]';
                // CTA：使用 siteConfig 的電話
                var ctaPhone = (window.DATA.siteConfig && window.DATA.siteConfig.phone) || '08-810-1858';
                var ctaPhoneClean = ctaPhone.replace(/-/g, '');

                ct.innerHTML = '<div class="flex flex-col lg:flex-row relative bg-[#fdfbf7] w-full '+modalH+' overflow-hidden rounded-xl text-left">'
                    +'<div class="lg:w-1/2 bg-gray-200 h-[300px] lg:h-full relative shrink-0 group">'
                    +'<img id="modal-main-img" src="'+fSrc+'" class="!absolute !inset-0 !w-full !h-full !object-cover !block transition-opacity duration-300 z-0" draggable="false" alt="'+(fCap||d.title)+'">'
                    +'<div id="modal-caption-box" class="absolute bottom-24 left-0 bg-black/60 backdrop-blur-sm text-white px-5 py-2 rounded-r-full text-base tracking-wider transition-all duration-500 transform z-20 '+(fCap?'translate-x-0 opacity-100':'-translate-x-4 opacity-0')+'">'+fCap+'</div>'
                    +(hasMultiple ? '<div class="absolute inset-y-0 left-0 flex items-center pl-2 opacity-0 group-hover:opacity-100 transition-opacity z-[100] pointer-events-none"><button onclick="event.stopPropagation();window.changeModalImage(-1)" class="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white hover:text-[#3a5a40] shadow-lg flex items-center justify-center cursor-pointer pointer-events-auto">←</button></div>' : '')
                    +(hasMultiple ? '<div class="absolute inset-y-0 right-0 flex items-center pr-2 opacity-0 group-hover:opacity-100 transition-opacity z-[100] pointer-events-none"><button onclick="event.stopPropagation();window.changeModalImage(1)" class="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white hover:text-[#3a5a40] shadow-lg flex items-center justify-center cursor-pointer pointer-events-auto">→</button></div>' : '')
                    +(hasMultiple ? '<div id="modal-thumbs-container" class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-start gap-3 overflow-x-auto z-30 no-scrollbar scroll-smooth">'+thumbs+'</div>' : '')
                    +'</div>'
                    +'<div class="lg:w-1/2 p-8 lg:p-10 flex flex-col overflow-y-auto bg-[#fdfbf7] relative z-10">'
                    +'<div class="flex flex-wrap items-center gap-2 mb-4">'+tags+'</div>'
                    +'<h2 class="text-3xl lg:text-4xl font-serif font-bold text-gray-900 mb-2 leading-tight">'+d.title+'</h2>'
                    +'<p class="text-gray-400 text-sm mb-6 font-bold uppercase tracking-[0.2em]">'+(d.sub||'')+'</p>'
                    +(stats?'<div class="grid grid-cols-3 gap-4 py-4 border-y border-gray-200/60 mb-6">'+stats+'</div>':'')
                    +'<div class="text-base text-gray-700 leading-loose mb-8 font-medium font-serif text-justify">'+d.desc+'</div>'
                    +(hls?'<div class="bg-white p-5 rounded-2xl mb-6 border border-gray-100 shadow-sm"><h4 class="text-base font-bold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-widest"><span class="text-accent text-xl">★</span> Experience Highlights</h4><ul class="space-y-2">'+hls+'</ul></div>':'')
                    +(d.cta ? '<div class="mt-auto pt-6 border-t border-gray-200/60 text-center"><a href="'+(d.cta.link||'tel:'+ctaPhoneClean)+'" class="inline-flex items-center gap-3 text-primary font-bold hover:text-accent transition-colors text-xl">'+(d.cta.icon||'📞')+' '+d.cta.text+'</a></div>' : '')
                    +'</div>'
                    +'<button onclick="event.stopPropagation();window.closeModal()" class="absolute top-4 right-4 z-[200] w-12 h-12 flex items-center justify-center rounded-full bg-white/80 backdrop-blur shadow-md text-gray-800 hover:bg-primary hover:text-white transition-all text-2xl cursor-pointer pointer-events-auto">✕</button>'
                    +'</div>';
            }
        }
        bd.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    };

    // 鍵盤：ESC / 左右鍵
    document.addEventListener('keydown', function(e) {
        var bd = document.getElementById('modal-backdrop');
        if (!bd || bd.classList.contains('hidden')) return;
        if (e.key === 'Escape') window.closeModal();
        else if (e.key === 'ArrowLeft') window.changeModalImage(-1);
        else if (e.key === 'ArrowRight') window.changeModalImage(1);
    });

})();
