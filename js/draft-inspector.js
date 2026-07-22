/* ============================================
   draft-inspector.js：草稿預覽圖片 → 專屬後台／Sheet 欄位定位
   只在 Apps Script 草稿預覽模式啟用，不影響正式網站訪客。
   ============================================ */
(function() {
    var SPREADSHEET_ID = '1yQM7xcbUMuT4B78wNBVDCu15-_nqNn9bXOmU3chREz8';
    var DEFAULT_EDITOR_SHEET_ID = 2026072101;
    var editorRows = {};
    var editorSheetId = DEFAULT_EDITOR_SHEET_ID;
    var tooltip;
    var panel;
    var currentImage;

    function isPreviewMode() {
        return !!(window.location && /(?:^|[?&])preview=draft(?:&|$)/.test(window.location.search || ''));
    }

    function editableImage(target) {
        if (!target) return null;
        if (target.matches && target.matches('img[data-content-key]')) return target;
        return target.closest ? target.closest('img[data-content-key]') : null;
    }

    function sheetRowFor(image) {
        var key = image && image.dataset ? image.dataset.contentKey : '';
        var row = Number(editorRows[key]);
        return row > 0 ? row : 0;
    }

    function sheetUrl(row) {
        return 'https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID
            + '/edit#gid=' + encodeURIComponent(editorSheetId)
            + '&range=B' + encodeURIComponent(row);
    }

    function ensureUi() {
        if (!document.getElementById('draft-inspector-style')) {
            var style = document.createElement('style');
            style.id = 'draft-inspector-style';
            style.textContent = [
                'html[data-draft-inspector="ready"] img[data-content-key]{cursor:help!important;}',
                'html[data-draft-inspector="ready"] img[data-content-key].draft-inspector-hover{outline:5px solid #22c55e!important;outline-offset:-5px;filter:brightness(.88);}',
                '#draft-inspector-tooltip{position:fixed;z-index:10050;display:none;pointer-events:none;background:#173f2a;color:#fff;padding:9px 13px;border-radius:9px;font:700 14px/1.35 system-ui,sans-serif;box-shadow:0 8px 25px rgba(0,0,0,.28);max-width:260px;}',
                '#draft-inspector-panel{position:fixed;z-index:10060;right:18px;bottom:18px;width:min(390px,calc(100vw - 36px));display:none;background:#fff;color:#183528;border:2px solid #3a5a40;border-radius:18px;padding:20px;box-shadow:0 18px 60px rgba(0,0,0,.28);font-family:system-ui,sans-serif;}',
                '#draft-inspector-panel.is-open{display:block;}',
                '#draft-inspector-panel h2{font-size:22px;font-weight:800;margin:0 34px 8px 0;color:#264b35;}',
                '#draft-inspector-panel p{font-size:15px;line-height:1.55;margin:6px 0;}',
                '#draft-inspector-panel .draft-cell{display:inline-block;background:#fff1ad;border:1px solid #d5ad32;border-radius:8px;padding:5px 9px;font-size:18px;font-weight:800;color:#734c00;}',
                '#draft-inspector-panel .draft-key{font:12px/1.45 ui-monospace,monospace;color:#64748b;overflow-wrap:anywhere;}',
                '#draft-inspector-panel a{display:block;margin-top:15px;background:#3a5a40;color:#fff!important;text-align:center;text-decoration:none;border-radius:10px;padding:12px 15px;font-size:16px;font-weight:800;}',
                '#draft-inspector-panel a.draft-sheet-link{margin-top:8px;background:#edf4ee;color:#264b35!important;font-size:13px;}',
                '#draft-inspector-close{position:absolute;right:12px;top:10px;width:34px;height:34px;border:0;border-radius:50%;background:#edf4ee;color:#264b35;font-size:20px;font-weight:800;cursor:pointer;}',
                '@media(max-width:640px){#draft-inspector-panel{right:10px;bottom:10px;width:calc(100vw - 20px);}}'
            ].join('');
            document.head.appendChild(style);
        }

        tooltip = document.getElementById('draft-inspector-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'draft-inspector-tooltip';
            tooltip.setAttribute('aria-hidden', 'true');
            document.body.appendChild(tooltip);
        }

        panel = document.getElementById('draft-inspector-panel');
        if (!panel) {
            panel = document.createElement('aside');
            panel.id = 'draft-inspector-panel';
            panel.setAttribute('aria-live', 'polite');

            var closeButton = document.createElement('button');
            closeButton.id = 'draft-inspector-close';
            closeButton.type = 'button';
            closeButton.textContent = '×';
            closeButton.setAttribute('aria-label', '關閉圖片位置提示');
            closeButton.addEventListener('click', function() {
                panel.classList.remove('is-open');
            });
            panel.appendChild(closeButton);

            var heading = document.createElement('h2');
            heading.textContent = '這張圖片要去哪裡改？';
            panel.appendChild(heading);

            var name = document.createElement('p');
            name.id = 'draft-inspector-name';
            panel.appendChild(name);

            var location = document.createElement('p');
            location.appendChild(document.createTextNode('後台欄位位置（Sheet 備援：批次編輯 '));
            var cell = document.createElement('span');
            cell.id = 'draft-inspector-cell';
            cell.className = 'draft-cell';
            location.appendChild(cell);
            location.appendChild(document.createTextNode('）'));
            panel.appendChild(location);

            var key = document.createElement('p');
            key.id = 'draft-inspector-key';
            key.className = 'draft-key';
            panel.appendChild(key);

            var link = document.createElement('a');
            link.id = 'draft-inspector-link';
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            panel.appendChild(link);

            var sheetLink = document.createElement('a');
            sheetLink.id = 'draft-inspector-sheet-link';
            sheetLink.className = 'draft-sheet-link';
            sheetLink.target = '_blank';
            sheetLink.rel = 'noopener noreferrer';
            panel.appendChild(sheetLink);
            document.body.appendChild(panel);
        }
    }

    function prepareImages() {
        var images = document.querySelectorAll('img[data-content-key]');
        Array.prototype.forEach.call(images, function(image) {
            if (!sheetRowFor(image)) return;
            image.setAttribute('role', 'button');
            image.setAttribute('tabindex', '0');
            image.setAttribute('title', '草稿預覽：點一下直接前往後台修改');
        });
    }

    function showTooltip(image, event) {
        var row = sheetRowFor(image);
        if (!row) return;
        if (currentImage && currentImage !== image) currentImage.classList.remove('draft-inspector-hover');
        currentImage = image;
        image.classList.add('draft-inspector-hover');
        tooltip.textContent = '點一下 → 前往後台修改這張圖片';
        tooltip.style.display = 'block';
        var left = Math.min((event.clientX || 0) + 14, window.innerWidth - 275);
        var top = Math.max(10, (event.clientY || 0) + 14);
        tooltip.style.left = Math.max(10, left) + 'px';
        tooltip.style.top = top + 'px';
    }

    function hideTooltip(image) {
        if (image) image.classList.remove('draft-inspector-hover');
        if (tooltip) tooltip.style.display = 'none';
        if (currentImage === image) currentImage = null;
    }

    function openPanel(image) {
        var key = image.dataset.contentKey;
        var row = sheetRowFor(image);
        if (!row) return;
        var name = (image.getAttribute('alt') || '網站圖片').replace(/｜大花.*$/, '');
        document.getElementById('draft-inspector-name').textContent = name;
        document.getElementById('draft-inspector-cell').textContent = 'B' + row;
        document.getElementById('draft-inspector-key').textContent = '欄位代碼：' + key;
        var link = document.getElementById('draft-inspector-link');
        link.href = 'admin.html?field=' + encodeURIComponent(key);
        link.textContent = '在專屬後台開啟這個欄位 →';
        var sheetLink = document.getElementById('draft-inspector-sheet-link');
        sheetLink.href = sheetUrl(row);
        sheetLink.textContent = '改用 Google Sheet 開啟 B' + row;
        panel.classList.add('is-open');
    }

    function bindEventsOnce() {
        if (document.documentElement.dataset.draftInspectorBound === 'true') return;
        document.documentElement.dataset.draftInspectorBound = 'true';

        document.addEventListener('pointerover', function(event) {
            var image = editableImage(event.target);
            if (image) showTooltip(image, event);
        });
        document.addEventListener('pointermove', function(event) {
            var image = editableImage(event.target);
            if (image) showTooltip(image, event);
        });
        document.addEventListener('pointerout', function(event) {
            var image = editableImage(event.target);
            if (image && (!event.relatedTarget || !image.contains(event.relatedTarget))) hideTooltip(image);
        });
        document.addEventListener('click', function(event) {
            var image = editableImage(event.target);
            if (!image || !sheetRowFor(image)) return;
            event.preventDefault();
            event.stopPropagation();
            openPanel(image);
        }, true);
        document.addEventListener('keydown', function(event) {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            var image = editableImage(event.target);
            if (!image || !sheetRowFor(image)) return;
            event.preventDefault();
            event.stopPropagation();
            openPanel(image);
        }, true);
    }

    window.installDraftInspector = function(payload) {
        if (!isPreviewMode() || !payload || payload.mode !== 'draft') return;
        editorRows = payload.editorRows || {};
        editorSheetId = Number(payload.editorSheetId) || DEFAULT_EDITOR_SHEET_ID;
        ensureUi();
        bindEventsOnce();
        prepareImages();
        document.documentElement.dataset.draftInspector = 'ready';
    };
})();
