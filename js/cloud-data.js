/* ============================================
   cloud-data.js：Google Sheet JSONP 載入與 data.js 回退
   ============================================ */
(function() {
    var config = window.CLOUD_CONFIG || {};
    var endpoint = String(config.endpoint || '').trim();
    var pendingRender = false;
    var requestFinished = false;
    var timeoutId = null;
    var jsonpScript = null;
    var renderScripts = [
        'js/elevator.js',
        'js/bento.js',
        'js/eco-services.js',
        'js/dining.js',
        'js/products-diy.js',
        'js/info-faq.js'
    ];

    function setByPath(root, path, value) {
        var parts = String(path || '').split('.');
        if (!parts.length || !parts[0]) return false;
        var blocked = { '__proto__': true, 'prototype': true, 'constructor': true };
        var target = root;

        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            if (blocked[part]) return false;
            if (i === parts.length - 1) {
                target[part] = value;
                return true;
            }
            if (target[part] == null) {
                target[part] = /^\d+$/.test(parts[i + 1]) ? [] : {};
            }
            if (typeof target[part] !== 'object') return false;
            target = target[part];
        }
        return false;
    }

    function isUserBusy() {
        var selection = window.getSelection && window.getSelection();
        if (selection && selection.toString().length > 0) return true;

        var active = document.activeElement;
        if (!active || active === document.body) return false;
        if (active.matches && active.matches('input, textarea, select, [contenteditable="true"]')) return true;
        return false;
    }

    function loadRenderScript(src) {
        return new Promise(function(resolve) {
            var script = document.createElement('script');
            script.src = src + '?cloud=' + Date.now();
            script.onload = function() {
                script.remove();
                resolve();
            };
            script.onerror = function() {
                script.remove();
                resolve();
            };
            document.head.appendChild(script);
        });
    }

    function renderSiteConfig() {
        var configData = window.DATA && window.DATA.siteConfig;
        if (!configData) return;
        var ticket = configData.ticket;
        var element;

        if (ticket) {
            element = document.getElementById('price-full');
            if (element) element.textContent = '$' + ticket.full;
            element = document.getElementById('price-full-discount');
            if (element) element.textContent = '可折 $' + ticket.fullDiscount + ' 園區消費';
            element = document.getElementById('price-half');
            if (element) element.textContent = '$' + ticket.half;
            element = document.getElementById('price-half-discount');
            if (element) element.textContent = '可折 $' + ticket.halfDiscount + ' 園區消費';
            element = document.getElementById('price-free');
            if (element) element.textContent = ticket.freeRule;
        }

        if (configData.phone) {
            element = document.getElementById('phone-dining');
            if (element) {
                element.textContent = configData.phone;
                element.href = 'tel:' + configData.phone.replace(/-/g, '');
            }
            element = document.getElementById('contact-phone');
            if (element) {
                element.textContent = configData.phone;
                if (element.closest('a')) element.closest('a').href = 'tel:' + configData.phone.replace(/-/g, '');
            }
        }

        if (configData.shopPhone) {
            element = document.getElementById('phone-shop');
            if (element) {
                element.textContent = configData.shopPhone;
                element.href = 'tel:' + configData.shopPhone.replace(/-/g, '');
            }
            element = document.getElementById('contact-shop');
            if (element) {
                element.textContent = configData.shopPhone;
                if (element.closest('a')) element.closest('a').href = 'tel:' + configData.shopPhone.replace(/-/g, '');
            }
        }

        if (configData.diningImages) {
            configData.diningImages.forEach(function(src, index) {
                element = document.getElementById('dining-img-' + index);
                if (element) element.src = src;
            });
        }
    }

    function renderStaticImages() {
        if (!window.DATA) return;
        var index;
        var images;

        images = document.querySelectorAll('#render-hero-slider .hero-slide img');
        (window.DATA.heroSlides || []).forEach(function(slide, slideIndex) {
            if (images[slideIndex]) images[slideIndex].src = slide.image;
        });

        (window.DATA.features || []).forEach(function(feature, featureIndex) {
            images = document.querySelectorAll('.feature-slide-' + featureIndex);
            (feature.images || []).forEach(function(src, imageIndex) {
                if (images[imageIndex]) images[imageIndex].src = src;
            });
        });

        images = document.querySelectorAll('#render-seasons-grid > div > img');
        (window.DATA.seasons || []).forEach(function(season, seasonIndex) {
            if (images[seasonIndex]) images[seasonIndex].src = season.image;
        });

        images = document.querySelectorAll('#render-gallery-thumbs img');
        (window.DATA.gallery || []).forEach(function(item, galleryIndex) {
            if (images[galleryIndex]) images[galleryIndex].src = item.image;
        });
        index = Number(window.currentGalleryIndex || 0);
        if (typeof window.upG === 'function') window.upG(index);
    }

    window.renderAll = function() {
        return renderScripts.reduce(function(chain, src) {
            return chain.then(function() { return loadRenderScript(src); });
        }, Promise.resolve()).then(function() {
            renderSiteConfig();
            renderStaticImages();
        });
    };

    function renderWhenSafe() {
        if (isUserBusy()) {
            pendingRender = true;
            return;
        }
        pendingRender = false;
        window.renderAll();
    }

    function retryPendingRender() {
        if (!pendingRender || isUserBusy()) return;
        pendingRender = false;
        window.renderAll();
    }

    document.addEventListener('focusout', function() {
        window.setTimeout(retryPendingRender, 0);
    });
    document.addEventListener('selectionchange', function() {
        window.setTimeout(retryPendingRender, 120);
    });

    window.roseFarmCloudCallback = function(payload) {
        if (requestFinished) return;
        requestFinished = true;
        if (timeoutId) window.clearTimeout(timeoutId);
        if (jsonpScript) jsonpScript.remove();

        if (!payload || payload.ok !== true || !payload.values || !window.DATA) {
            document.documentElement.dataset.cloudData = 'fallback';
            return;
        }

        Object.keys(payload.values).forEach(function(key) {
            setByPath(window.DATA, key, payload.values[key]);
        });
        window.CLOUD_DATA_META = {
            updatedAt: payload.updatedAt || {},
            generatedAt: payload.generatedAt || ''
        };
        document.documentElement.dataset.cloudData = 'loaded';
        renderWhenSafe();
    };

    if (!endpoint) {
        document.documentElement.dataset.cloudData = 'disabled';
        return;
    }

    jsonpScript = document.createElement('script');
    jsonpScript.src = endpoint
        + (endpoint.indexOf('?') === -1 ? '?' : '&')
        + 'callback=roseFarmCloudCallback&_=' + Date.now();
    jsonpScript.onerror = function() {
        if (requestFinished) return;
        requestFinished = true;
        document.documentElement.dataset.cloudData = 'fallback';
        jsonpScript.remove();
    };
    document.head.appendChild(jsonpScript);

    timeoutId = window.setTimeout(function() {
        if (requestFinished) return;
        requestFinished = true;
        document.documentElement.dataset.cloudData = 'fallback';
        if (jsonpScript) jsonpScript.remove();
    }, 8000);
})();
