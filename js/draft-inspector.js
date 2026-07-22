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
    var taskStore;
    var selectionMode = false;
    var taskModeButton;
    var taskCounterButton;
    var taskPanel;

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
                '#draft-task-mode-toggle{position:fixed;z-index:10040;right:18px;bottom:18px;border:0;border-radius:999px;background:#173f2a;color:#fff;padding:13px 18px;font:800 15px/1.2 system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.24);cursor:pointer;}',
                '#draft-task-mode-toggle[aria-pressed="true"]{background:#b45309;}',
                '#draft-task-counter{position:fixed;z-index:10041;right:18px;bottom:76px;display:none;border:2px solid #f59e0b;border-radius:999px;background:#fff;color:#7c3f00;padding:10px 15px;font:800 14px/1.2 system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.2);cursor:pointer;}',
                'html[data-draft-task-mode="true"] #draft-task-counter{display:block;}',
                '#draft-task-panel{position:fixed;z-index:10070;right:18px;bottom:126px;width:min(430px,calc(100vw - 36px));max-height:min(620px,calc(100vh - 160px));display:none;overflow:hidden;background:#fff;color:#183528;border:2px solid #3a5a40;border-radius:18px;box-shadow:0 18px 60px rgba(0,0,0,.3);font-family:system-ui,sans-serif;}',
                '#draft-task-panel.is-open{display:flex;flex-direction:column;}',
                '.draft-task-panel-head{display:flex;align-items:center;justify-content:space-between;padding:17px 18px 12px;border-bottom:1px solid #d9e4da;}',
                '.draft-task-panel-head h2{margin:0;font-size:20px;font-weight:900;color:#264b35;}',
                '#draft-task-panel-close{width:34px;height:34px;border:0;border-radius:50%;background:#edf4ee;color:#264b35;font-size:20px;font-weight:800;cursor:pointer;}',
                '#draft-task-list{list-style:none;margin:0;padding:10px 14px;overflow:auto;}',
                '.draft-task-item{display:grid;grid-template-columns:54px 1fr auto;gap:11px;align-items:center;padding:10px 0;border-bottom:1px solid #edf2ed;}',
                '.draft-task-item img,.draft-task-thumb-placeholder{width:54px;height:44px;border-radius:8px;object-fit:cover;background:#edf2ed;}',
                '.draft-task-item strong,.draft-task-item small{display:block;overflow-wrap:anywhere;}',
                '.draft-task-item strong{font-size:14px;}.draft-task-item small{margin-top:3px;color:#64748b;font-size:12px;}',
                '.draft-task-remove{border:0;border-radius:8px;background:#fff1ed;color:#a33b22;padding:8px 9px;font-weight:800;cursor:pointer;}',
                '.draft-task-empty{margin:0;padding:28px 18px;text-align:center;color:#64748b;line-height:1.6;}',
                '.draft-task-panel-foot{padding:13px 14px 15px;border-top:1px solid #d9e4da;background:#f7faf7;}',
                '#draft-task-start{display:block;border-radius:10px;background:#3a5a40;color:#fff!important;padding:12px 14px;text-align:center;text-decoration:none;font-weight:900;}',
                '#draft-task-start[aria-disabled="true"]{opacity:.45;pointer-events:none;}',
                'html[data-draft-task-mode="true"] img[data-content-key]{cursor:crosshair!important;}',
                'html[data-draft-task-mode="true"] img[data-content-key].draft-task-selected{outline:5px solid #f59e0b!important;outline-offset:-5px;filter:brightness(.88);}',
                '.draft-task-badge-host{position:relative!important;}',
                '.draft-task-badge{position:absolute;z-index:30;display:grid;place-items:center;width:30px;height:30px;border:3px solid #fff;border-radius:50%;background:#b45309;color:#fff;font:900 14px/1 system-ui,sans-serif;box-shadow:0 3px 12px rgba(0,0,0,.35);pointer-events:none;}',
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

        taskModeButton = document.getElementById('draft-task-mode-toggle');
        if (!taskModeButton) {
            taskModeButton = document.createElement('button');
            taskModeButton.id = 'draft-task-mode-toggle';
            taskModeButton.type = 'button';
            taskModeButton.setAttribute('aria-pressed', 'false');
            taskModeButton.addEventListener('click', function() {
                setSelectionMode(!selectionMode);
            });
            document.body.appendChild(taskModeButton);
        }
        renderTaskModeButton();

        taskCounterButton = document.getElementById('draft-task-counter');
        if (!taskCounterButton) {
            taskCounterButton = document.createElement('button');
            taskCounterButton.id = 'draft-task-counter';
            taskCounterButton.type = 'button';
            taskCounterButton.addEventListener('click', function() {
                renderTaskPanel();
                taskPanel.classList.add('is-open');
            });
            document.body.appendChild(taskCounterButton);
        }

        taskPanel = document.getElementById('draft-task-panel');
        if (!taskPanel) {
            taskPanel = document.createElement('aside');
            taskPanel.id = 'draft-task-panel';
            taskPanel.setAttribute('aria-label', '圖片修改清單');

            var head = document.createElement('div');
            head.className = 'draft-task-panel-head';
            var taskHeading = document.createElement('h2');
            taskHeading.textContent = '圖片修改清單';
            head.appendChild(taskHeading);
            var taskClose = document.createElement('button');
            taskClose.id = 'draft-task-panel-close';
            taskClose.type = 'button';
            taskClose.textContent = '×';
            taskClose.setAttribute('aria-label', '關閉修改清單');
            taskClose.addEventListener('click', function() { taskPanel.classList.remove('is-open'); });
            head.appendChild(taskClose);
            taskPanel.appendChild(head);

            var taskListElement = document.createElement('ol');
            taskListElement.id = 'draft-task-list';
            taskPanel.appendChild(taskListElement);

            var foot = document.createElement('div');
            foot.className = 'draft-task-panel-foot';
            var startLink = document.createElement('a');
            startLink.id = 'draft-task-start';
            startLink.href = 'admin.html?tour=1';
            startLink.target = '_blank';
            startLink.rel = 'noopener noreferrer';
            startLink.addEventListener('click', function(event) {
                if (taskList().items.length) return;
                event.preventDefault();
            });
            foot.appendChild(startLink);
            taskPanel.appendChild(foot);
            document.body.appendChild(taskPanel);
        }
        renderTaskPanel();
    }

    function taskList() {
        return taskStore && typeof taskStore.load === 'function' ? taskStore.load() : { items: [] };
    }

    function renderTaskModeButton() {
        if (!taskModeButton) return;
        var available = taskStore && typeof taskStore.available === 'function' && taskStore.available();
        taskModeButton.disabled = !available;
        if (!available) {
            selectionMode = false;
            document.documentElement.dataset.draftTaskMode = 'false';
            taskModeButton.textContent = '清單功能不可用｜仍可單張修改';
            taskModeButton.setAttribute('aria-pressed', 'false');
            taskModeButton.setAttribute('title', '瀏覽器未開放本機儲存，點圖片仍可使用單張後台定位。');
            if (taskCounterButton) taskCounterButton.textContent = '已選 0 張';
            return;
        }
        var count = taskList().items.length;
        taskModeButton.textContent = selectionMode
            ? '✓ 清單模式中（已選 ' + count + ' 張）'
            : '🗂 建立修改清單' + (count ? '（' + count + '）' : '');
        taskModeButton.setAttribute('aria-pressed', selectionMode ? 'true' : 'false');
        if (taskCounterButton) taskCounterButton.textContent = '已選 ' + count + ' 張';
    }

    function imageForTaskKey(key) {
        var images = document.querySelectorAll('img[data-content-key]');
        for (var index = 0; index < images.length; index += 1) {
            if (images[index].dataset.contentKey === key) return images[index];
        }
        return null;
    }

    function renderTaskPanel() {
        if (!taskPanel) return;
        var list = taskList();
        var container = document.getElementById('draft-task-list');
        if (!container) return;
        container.textContent = '';
        if (!list.items.length) {
            var empty = document.createElement('p');
            empty.className = 'draft-task-empty';
            empty.textContent = '還沒選圖片。點網頁上的圖片把它加進清單。';
            container.appendChild(empty);
        } else {
            list.items.forEach(function(item, index) {
                var row = document.createElement('li');
                row.className = 'draft-task-item';
                var sourceImage = imageForTaskKey(item.key);
                var source = sourceImage && (sourceImage.currentSrc || sourceImage.src || sourceImage.getAttribute('src'));
                if (source) {
                    var thumbnail = document.createElement('img');
                    thumbnail.src = source;
                    thumbnail.alt = '';
                    thumbnail.loading = 'lazy';
                    row.appendChild(thumbnail);
                } else {
                    var placeholder = document.createElement('span');
                    placeholder.className = 'draft-task-thumb-placeholder';
                    row.appendChild(placeholder);
                }
                var copy = document.createElement('div');
                var title = document.createElement('strong');
                title.textContent = (index + 1) + '．' + item.label;
                copy.appendChild(title);
                var hint = document.createElement('small');
                hint.textContent = item.locationHint;
                copy.appendChild(hint);
                row.appendChild(copy);
                var remove = document.createElement('button');
                remove.type = 'button';
                remove.className = 'draft-task-remove';
                remove.textContent = '移除';
                remove.addEventListener('click', function() {
                    taskStore.remove(item.key);
                    syncSelectedImages();
                    renderTaskPanel();
                });
                row.appendChild(remove);
                container.appendChild(row);
            });
        }
        var start = document.getElementById('draft-task-start');
        if (start) {
            start.textContent = '前往後台開始修改（' + list.items.length + '）';
            start.setAttribute('aria-disabled', list.items.length ? 'false' : 'true');
        }
    }

    function imageTask(image) {
        var key = image && image.dataset ? image.dataset.contentKey : '';
        var label = ((image && image.getAttribute('alt')) || '網站圖片').replace(/｜大花.*$/, '').trim() || '網站圖片';
        var section = image && image.closest ? image.closest('section[id]') : null;
        var heading = section && section.querySelector ? section.querySelector('h1,h2,h3') : null;
        var locationHint = heading && heading.textContent ? heading.textContent.trim() : label;
        return { key: key, label: label, locationHint: locationHint };
    }

    function removeTaskBadges() {
        if (!document.querySelectorAll) return;
        Array.prototype.forEach.call(document.querySelectorAll('.draft-task-badge'), function(badge) {
            var parent = badge.parentElement;
            if (badge.remove) badge.remove();
            else if (parent && parent.removeChild) parent.removeChild(badge);
            if (parent && parent.querySelector && !parent.querySelector('.draft-task-badge')) {
                parent.classList.remove('draft-task-badge-host');
                if (parent.dataset && parent.dataset.draftTaskPositionAdded === 'true') {
                    parent.style.position = '';
                    delete parent.dataset.draftTaskPositionAdded;
                }
            }
        });
    }

    function addTaskBadge(image, number) {
        var parent = image && image.parentElement;
        if (!parent || !document.createElement) return;
        var badge = document.createElement('span');
        badge.className = 'draft-task-badge';
        badge.textContent = String(number);
        badge.setAttribute('aria-hidden', 'true');
        if (rootComputedStyle(parent) === 'static') {
            parent.style.position = 'relative';
            parent.dataset.draftTaskPositionAdded = 'true';
        }
        parent.classList.add('draft-task-badge-host');
        parent.appendChild(badge);
        if (image.getBoundingClientRect && parent.getBoundingClientRect) {
            var imageRect = image.getBoundingClientRect();
            var parentRect = parent.getBoundingClientRect();
            badge.style.left = Math.max(4, imageRect.right - parentRect.left - 34) + 'px';
            badge.style.top = Math.max(4, imageRect.top - parentRect.top + 6) + 'px';
        } else {
            badge.style.right = '6px';
            badge.style.top = '6px';
        }
    }

    function rootComputedStyle(element) {
        if (window.getComputedStyle) return window.getComputedStyle(element).position;
        return (element.style && element.style.position) || 'static';
    }

    function syncSelectedImages() {
        var items = taskList().items;
        var orderByKey = {};
        items.forEach(function(item, index) { orderByKey[item.key] = index + 1; });
        removeTaskBadges();
        var images = document.querySelectorAll('img[data-content-key]');
        Array.prototype.forEach.call(images, function(image) {
            var number = orderByKey[image.dataset.contentKey];
            image.classList.toggle('draft-task-selected', !!number);
            if (number) {
                image.dataset.draftTaskNumber = String(number);
                image.setAttribute('title', '已加入第 ' + number + ' 項，再點一次移除');
                addTaskBadge(image, number);
            } else {
                delete image.dataset.draftTaskNumber;
                image.setAttribute('title', selectionMode ? '點一下加入修改清單' : '草稿預覽：點一下直接前往後台修改');
            }
        });
        renderTaskModeButton();
        renderTaskPanel();
    }

    function setSelectionMode(enabled) {
        if (!taskStore || typeof taskStore.available !== 'function' || !taskStore.available()) {
            selectionMode = false;
            renderTaskModeButton();
            return false;
        }
        selectionMode = !!enabled;
        document.documentElement.dataset.draftTaskMode = selectionMode ? 'true' : 'false';
        if (panel) panel.classList.remove('is-open');
        if (tooltip) tooltip.style.display = 'none';
        syncSelectedImages();
        return true;
    }

    function toggleTaskForImage(image) {
        if (!taskStore || typeof taskStore.toggle !== 'function') return false;
        var result = taskStore.toggle(imageTask(image));
        if (!result.ok) {
            setSelectionMode(false);
            openPanel(image);
            return false;
        }
        syncSelectedImages();
        return true;
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
        var number = image.dataset.draftTaskNumber;
        tooltip.textContent = selectionMode
            ? (number ? '已加入第 ' + number + ' 項，再點一次移除' : '點一下加入修改清單')
            : '點一下 → 前往後台修改這張圖片';
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
            if (selectionMode) toggleTaskForImage(image);
            else openPanel(image);
        }, true);
        document.addEventListener('keydown', function(event) {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            var image = editableImage(event.target);
            if (!image || !sheetRowFor(image)) return;
            event.preventDefault();
            event.stopPropagation();
            if (selectionMode) toggleTaskForImage(image);
            else openPanel(image);
        }, true);
    }

    window.installDraftInspector = function(payload) {
        if (!isPreviewMode() || !payload || payload.mode !== 'draft') return;
        editorRows = payload.editorRows || {};
        editorSheetId = Number(payload.editorSheetId) || DEFAULT_EDITOR_SHEET_ID;
        taskStore = window.RoseFarmImageTasks || null;
        ensureUi();
        bindEventsOnce();
        prepareImages();
        syncSelectedImages();
        document.documentElement.dataset.draftInspector = 'ready';
    };

    window.DRAFT_INSPECTOR_TESTING = {
        imageTask: imageTask,
        setSelectionMode: setSelectionMode,
        syncSelectedImages: syncSelectedImages,
        renderTaskPanel: renderTaskPanel
    };
})();
