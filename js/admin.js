(function () {
    'use strict';

    var NAV_ITEMS = [
        { id: 'all', icon: '⌂', label: '全部內容', kicker: 'ALL CONTENT', description: '所有可管理內容都展開在同一頁，不必反覆切換選單。' },
        { id: 'ticket', icon: '🎫', label: '票價資訊', kicker: 'TICKET', description: '修改全票、半票、折抵金額與免費入園規則。' },
        { id: 'dining', icon: '🍽️', label: '玫瑰餐廳', kicker: 'DINING', description: '修改餐廳主文案、料理、套餐、團體提醒與餐廳圖片。' },
        { id: 'diy', icon: '🎨', label: 'DIY 體驗', kicker: 'DIY WORKSHOP', description: '一次查看全部 DIY，可直接新增、修改或下架項目。' },
        { id: 'faq', icon: '❓', label: '常見問題', kicker: 'FAQ', description: '題目與答案分開顯示，避免編輯時看錯欄位。' },
        { id: 'copy', icon: '✍️', label: '頁面文案', kicker: 'PAGE COPY', description: '修改首頁各區標題、品牌故事、交通說明與聯繫文案。' },
        { id: 'modals', icon: '▣', label: '彈窗內容', kicker: 'DETAIL WINDOWS', description: '修改導覽、場租、餐飲與 DIY 詳情彈窗的文字及圖片。' },
        { id: 'images', icon: '🖼️', label: '全站圖片', kicker: 'IMAGES', description: '集中查看圖片縮圖與網址，換圖時可以立即確認。' },
        { id: 'services', icon: '🌿', label: '導覽與場租', kicker: 'SERVICES', description: '修改導覽、婚禮、採摘與場地租借的價格及重點資訊。' },
        { id: 'announcement', icon: '📣', label: '公告花況', kicker: 'ANNOUNCEMENT', description: '控制公告是否顯示，並修改最新公告內容。' },
        { id: 'basic', icon: '⚙️', label: '基本資訊', kicker: 'BASIC INFO', description: '修改電話、營業時間與官網網址等基本資料。' }
    ];

    var FIELD_LABELS = {
        homeUrl: '官網網址', phone: '聯絡電話', shopPhone: '展售室手機',
        full: '全票', fullDiscount: '全票折抵', half: '半票', halfDiscount: '半票折抵', freeRule: '免費入園規則',
        enabled: '顯示此項目', name: '名稱', title: '標題', price: '價格', tag: '時長', group: '成團人數',
        image: '圖片網址', img: '圖片網址', q: '問題', a: '答案', text: '文字內容', note: '補充說明',
        value: '內容', label: '項目', desc: '簡短描述', period: '期間', titleEn: '英文標題', sub: '英文副標',
        rarity: '出現時節', caption: '圖片說明', address: '農場地址', mapUrl: 'Google Map 網址',
        facebookUrl: 'Facebook 網址', mapImage: '園區地圖圖片', halfTicketRule: '半票適用對象',
        badge: '主視覺標籤', subtitle: '副標題', tagline1: '主視覺標語第一行', tagline2: '主視覺標語第二行',
        paragraph1: '第一段', paragraph2: '第二段', paragraph3: '第三段', paragraph4: '第四段',
        title1: '標題第一行', title2: '標題第二行', english: '英文標題', lead: '服務項目摘要',
        calendarEnglish: '花曆英文標題', calendarTitle: '花曆標題', calendarHint: '花曆操作提示',
        cuisineEnglish: '料理區英文標題', cuisineTitle1: '料理區標題第一行', cuisineTitle2: '料理區標題第二行',
        cuisineParagraph1: '料理介紹第一段', cuisineParagraph2: '料理介紹第二段', cuisineEmphasis: '料理介紹強調句',
        signatureLabel: '招牌料理圖片標籤', signatureChoice: '招牌料理推薦標籤', optionsTitle: '用餐方案標題',
        moreEnglish: '更多料理英文標題', moreTitle: '更多料理標題', mapButton: '地圖按鈕文字',
        intro1: '導言第一段', intro2: '導言第二段', driveTitle: '開車標題', driveDescription: '開車說明',
        transportTitle: '大眾運輸標題', transportOptionA: '交通方案 A 標題', transportOptionADescription: '交通方案 A 說明',
        transportOptionB: '交通方案 B 標題', transportOptionBDescription: '交通方案 B 說明',
        rulesEnglish: '園區須知英文標題', rulesTitle: '園區須知標題', copyright: '版權文字',
        diningLabel: '餐廳卡片標題', diningNote: '餐廳卡片提醒', shopLabel: '展售卡片標題', shopNote: '展售卡片提醒',
        facebookLabel: 'Facebook 卡片標題', facebookName: 'Facebook 名稱', facebookNote: 'Facebook 卡片提醒',
        ticketNotice: '門票折抵提示', signatureTitle: '招牌料理名稱', signatureEnglish: '招牌料理英文名稱',
        signatureDescription1: '招牌料理描述（第一段）', signatureDescription2: '招牌料理描述（第二段）',
        highlight1Title: '特色一標題', highlight1Description: '特色一描述',
        highlight2Title: '特色二標題', highlight2Description: '特色二描述', groupNotice: '團體用餐提醒'
    };

    var SECTION_NAMES = {
        '基本資訊': '基本資訊', '票價': '票價資訊', '餐廳': '玫瑰餐廳', 'DIY': 'DIY 體驗',
        '常見問題': '常見問題', '圖片': '全站圖片', '服務': '導覽與場租', '公告': '公告花況'
    };

    var state = {
        entries: [], entryByKey: new Map(), official: {}, originalDraft: {}, current: {}, dirty: new Set(),
        passcode: '', connected: false, demo: false, activeSection: 'all', query: '', dirtyOnly: false,
        faqCategory: '0', imageCategory: 'hero', pendingConfirm: null, pendingCancel: null, toastTimer: null,
        taskTourActive: false, taskTourIndex: 0
    };
    var lastFocusedElement = null;

    function byId(id) { return document.getElementById(id); }
    function endpoint() { return String((window.CLOUD_CONFIG && window.CLOUD_CONFIG.endpoint) || '').trim(); }
    function imageTaskStore() { return window.RoseFarmImageTasks || null; }
    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }
    function escapeAttr(value) { return escapeHtml(value).replace(/`/g, '&#096;'); }
    function containsBrandTerm(value) { return /有機|organic/i.test(String(value == null ? '' : value)); }
    function isImageKey(key) {
        return key === 'siteConfig.mapImage'
            || /(^|\.)(image|img)(\.|$)/.test(key)
            || /^siteConfig\.diningImages\.\d+$/.test(key)
            || /^features\.\d+\.images\.\d+$/.test(key)
            || /^modalContent\.[^.]+\.images\.\d+(?:\.src)?$/.test(key);
    }

    function imageCategoryForKey(key) {
        if (/^heroSlides\./.test(key)) return 'hero';
        if (/^features\./.test(key)) return 'features';
        if (/^bentoItems\./.test(key)) return 'bento';
        if (/^gallery\./.test(key)) return 'gallery';
        if (/^seasons\./.test(key)) return 'seasons';
        if (/^eco\./.test(key)) return 'eco';
        if (/^(siteConfig\.diningImages|diningOptions|food)\./.test(key)) return 'dining';
        if (/^diy\./.test(key)) return 'diy';
        if (/^services\./.test(key)) return 'services';
        if (/^products\./.test(key)) return 'products';
        if (/^modalContent\./.test(key)) return 'modals';
        return 'other';
    }

    function imageLocationHint(key) {
        var firstIndex = key.match(/\.(\d+)/);
        var number = firstIndex ? Number(firstIndex[1]) + 1 : 1;
        if (key === 'siteConfig.mapImage') return '參觀資訊區的園區地圖；點開後的大圖也會同步更換。';
        if (/^heroSlides\./.test(key)) return '首頁最上方主視覺輪播，第 ' + number + ' 張。';
        if (/^features\.(\d+)\.images\.(\d+)$/.test(key)) {
            var match = key.match(/^features\.(\d+)\.images\.(\d+)$/);
            return '首頁「三大特色」第 ' + (Number(match[1]) + 1) + ' 區，第 ' + (Number(match[2]) + 1) + ' 張輪播圖。';
        }
        if (/^bentoItems\./.test(key)) return '首頁體驗拼貼卡片，第 ' + number + ' 張。';
        if (/^gallery\./.test(key)) return '園區相簿區，第 ' + number + ' 張。';
        if (/^seasons\./.test(key)) return '四季花況區，第 ' + number + ' 張。';
        if (/^eco\./.test(key)) return '生態觀察區，第 ' + number + ' 張。';
        if (/^siteConfig\.diningImages\./.test(key)) {
            var diningHints = ['餐廳介紹的大圓形主圖。', '餐廳介紹右下方圖片。', '餐廳介紹左上方浮動圖片。', '招牌玫瑰白玉鍋主圖。'];
            return diningHints[number - 1] || ('餐廳介紹圖片，第 ' + number + ' 張。');
        }
        if (/^diningOptions\./.test(key)) return '餐廳方案卡片，第 ' + number + ' 張。';
        if (/^food\./.test(key)) return '特色料理卡片，第 ' + number + ' 張。';
        if (/^diy\./.test(key)) return 'DIY 體驗方案卡片，第 ' + number + ' 張。';
        if (/^services\./.test(key)) return '導覽、婚禮或場地服務卡片，第 ' + number + ' 張。';
        if (/^products\./.test(key)) return '伴手禮商品卡片，第 ' + number + ' 張。';
        if (/^modalContent\./.test(key)) return '服務、餐飲或 DIY 的詳情彈窗圖片。';
        return '網站內容圖片；可從草稿預覽點圖確認實際位置。';
    }

    function isSafeImageUrl(value) {
        return /^https:\/\//i.test(String(value || '').trim());
    }
    function normalizeValue(value, type) {
        if (type === 'boolean') return value === true || value === 'true' || value === 'TRUE';
        if (type === 'number') {
            if (value === '' || value == null) return '';
            var numberValue = Number(value);
            return Number.isFinite(numberValue) ? numberValue : value;
        }
        return value == null ? '' : String(value);
    }
    function valuesEqual(a, b, type) { return normalizeValue(a, type) === normalizeValue(b, type); }
    function lastSegment(key) { return String(key).split('.').pop(); }
    function navItem(id) { return NAV_ITEMS.find(function (item) { return item.id === id; }) || NAV_ITEMS[0]; }

    function categoryForEntry(entry) {
        var key = entry.key || '';
        if (key.indexOf('diy.') === 0) return 'diy';
        if (key.indexOf('qa.') === 0) return 'faq';
        if (key.indexOf('diningContent.') === 0 || key.indexOf('diningOptions.') === 0 || key.indexOf('food.') === 0 || key.indexOf('siteConfig.diningImages.') === 0) return 'dining';
        if (key.indexOf('siteConfig.ticket.') === 0) return 'ticket';
        if (key.indexOf('siteConfig.announcement.') === 0) return 'announcement';
        if (/^bentoItems\.\d+\.(time|note)$/.test(key)) return 'basic';
        if (key.indexOf('pageContent.') === 0) return 'copy';
        if (key.indexOf('modalContent.') === 0) return 'modals';
        if (key.indexOf('services.') === 0) return 'services';
        if (/^(features|bentoItems|gallery|seasons|eco|products|navItems)\./.test(key) && !isImageKey(key)) return 'copy';
        if (isImageKey(key)) return 'images';
        return 'basic';
    }

    function matchesCategory(entry, category) {
        if (category === 'all') return true;
        if (category === 'images') return isImageKey(entry.key);
        return categoryForEntry(entry) === category;
    }

    function searchableText(entry) {
        return [entry.section, entry.item, entry.label, entry.key, state.current[entry.key]].join(' ').toLowerCase();
    }

    function filterEntries(entries, category, query, dirtyOnly, dirtyKeys) {
        var normalizedQuery = String(query || '').trim().toLowerCase();
        return entries.filter(function (entry) {
            if (!matchesCategory(entry, category || 'all')) return false;
            if (dirtyOnly && !(dirtyKeys || new Set()).has(entry.key)) return false;
            return !normalizedQuery || searchableText(entry).indexOf(normalizedQuery) !== -1;
        });
    }

    function allowedDemoKey(key) {
        return key === 'homeUrl'
            || /^siteConfig\.(phone|shopPhone|address|mapUrl|facebookUrl|mapImage|halfTicketRule)$/.test(key)
            || /^siteConfig\.(ticket|announcement|diningImages)\./.test(key)
            || /^pageContent\./.test(key)
            || /^features\.\d+\.(titleEn|title|desc)$/.test(key)
            || /^bentoItems\.\d+\.(title|desc|time|note|img)$/.test(key)
            || /^bentoItems\.\d+\.tags\.\d+$/.test(key)
            || /^services\.\d+\.(title|price|desc|img)$/.test(key)
            || /^services\.\d+\.tags\.\d+$/.test(key)
            || /^services\.\d+\.facts\.\d+$/.test(key)
            || /^diningContent\./.test(key)
            || /^diningOptions\.\d+\.(title|desc|price|subPrice|img)$/.test(key)
            || /^food\.\d+\.(name|desc|image)$/.test(key)
            || /^gallery\.\d+\.(title|image)$/.test(key)
            || /^seasons\.\d+\.(name|period|desc|image)$/.test(key)
            || /^eco\.\d+\.(name|desc|rarity|image)$/.test(key)
            || /^products\.\d+\.(name|desc|image)$/.test(key)
            || /^heroSlides\.\d+\.image$/.test(key)
            || /^features\.\d+\.images\.\d+$/.test(key)
            || /^diy\.\d+\.(enabled|name|price|tag|group|image)$/.test(key)
            || /^navItems\.\d+\.name$/.test(key)
            || /^modalContent\.[^.]+\.(title|sub|desc|image)$/.test(key)
            || /^modalContent\.[^.]+\.(tags|highlights)\.\d+$/.test(key)
            || /^modalContent\.[^.]+\.stats\.\d+\.(icon|label|value)$/.test(key)
            || /^modalContent\.[^.]+\.images\.\d+(?:\.(src|caption))?$/.test(key)
            || /^qa\.infoIcons\.\d+\.(title|text)$/.test(key)
            || /^qa\.categories\.\d+\.name$/.test(key)
            || /^qa\.categories\.\d+\.list\.\d+\.(q|a)$/.test(key)
            || /^qa\.categories\.\d+\.list\.\d+\.rows\.\d+\.(label|value|note)$/.test(key);
    }

    function findParentLabel(root, parts) {
        var cursor = root;
        for (var i = 0; i < parts.length - 1; i += 1) {
            if (cursor == null) break;
            cursor = cursor[parts[i]];
        }
        if (cursor && typeof cursor === 'object') return cursor.name || cursor.title || cursor.q || '';
        return '';
    }

    function demoFieldLabel(key, field) {
        var match = key.match(/\.(tags|highlights|facts)\.(\d+)$/);
        if (match) {
            var names = { tags: '標籤', highlights: '特色重點', facts: '卡片重點' };
            return names[match[1]] + ' ' + (Number(match[2]) + 1);
        }
        match = key.match(/\.stats\.(\d+)\.(icon|label|value)$/);
        if (match) {
            var statNames = { icon: '圖示', label: '名稱', value: '內容' };
            return '數字資訊 ' + (Number(match[1]) + 1) + '・' + statNames[match[2]];
        }
        match = key.match(/\.images\.(\d+)(?:\.(src|caption))?$/);
        if (match) return '彈窗圖片 ' + (Number(match[1]) + 1) + (match[2] === 'caption' ? '・說明' : '・網址');
        return FIELD_LABELS[field] || field;
    }

    function demoSectionForKey(key) {
        var pageMatch = key.match(/^pageContent\.([^.]+)\./);
        if (pageMatch) {
            var pageNames = {
                hero: '首頁主視覺', story: '品牌故事', overview: '體驗總覽', gallery: '園區相簿',
                seasons: '四季花園', ecology: '生態觀察', services: '導覽與場租', dining: '玫瑰餐廳',
                products: '伴手禮', diy: 'DIY 體驗', visitor: '參觀資訊', faq: '常見問題',
                contact: '聯繫區', footer: '頁尾'
            };
            return '頁面文案｜' + (pageNames[pageMatch[1]] || pageMatch[1]);
        }
        var category = categoryForEntry({ key: key });
        return navItem(category).label;
    }

    function buildDemoEntries(data) {
        var result = [];
        function visit(value, path) {
            if (value && typeof value === 'object') {
                Object.keys(value).forEach(function (key) { visit(value[key], path.concat(key)); });
                return;
            }
            var keyPath = path.join('.');
            if (!allowedDemoKey(keyPath)) return;
            var type = typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? 'number' : 'string';
            var parentLabel = findParentLabel(data, path);
            var field = lastSegment(keyPath);
            var indexMatch = keyPath.match(/\.(\d+)\./);
            var item = parentLabel || (indexMatch ? '第 ' + (Number(indexMatch[1]) + 1) + ' 項' : demoSectionForKey(keyPath));
            if (keyPath.indexOf('modalContent.') === 0) {
                var modalKey = path[1];
                var modal = data.modalContent && data.modalContent[modalKey];
                item = modal && modal.title ? modal.title : modalKey;
            }
            result.push({
                section: demoSectionForKey(keyPath), item: String(item), key: keyPath,
                label: demoFieldLabel(keyPath, field), value: value, draftValue: value, type: type,
                required: field !== 'note' && field !== 'subPrice' && !(/^diy\.\d+\./.test(keyPath) && value === ''),
                guidance: isImageKey(keyPath) ? '貼上 https:// 開頭的圖片網址，縮圖會立即更新。' : '', updatedAt: '', editorRow: null
            });
        }
        visit(data || {}, []);
        return result;
    }

    function setEntries(entries) {
        state.entries = (entries || []).map(function (entry) {
            var normalized = Object.assign({}, entry);
            normalized.type = normalized.type || (typeof normalized.value === 'boolean' ? 'boolean' : typeof normalized.value === 'number' ? 'number' : 'string');
            normalized.label = normalized.label || FIELD_LABELS[lastSegment(normalized.key)] || lastSegment(normalized.key);
            normalized.item = normalized.item || normalized.section || '網站內容';
            return normalized;
        });
        state.entryByKey = new Map();
        state.official = {};
        state.originalDraft = {};
        state.current = {};
        state.dirty = new Set();
        state.entries.forEach(function (entry) {
            var official = normalizeValue(entry.value, entry.type);
            var draft = normalizeValue(entry.draftValue == null ? entry.value : entry.draftValue, entry.type);
            state.entryByKey.set(entry.key, entry);
            state.official[entry.key] = official;
            state.originalDraft[entry.key] = draft;
            state.current[entry.key] = draft;
        });
    }

    function postAction(action, extra) {
        if (!endpoint()) return Promise.reject(new Error('尚未連接 Apps Script。'));
        var body = Object.assign({ action: action, passcode: state.passcode }, extra || {});
        return fetch(endpoint(), {
            method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body)
        }).then(function (response) {
            if (!response.ok) throw new Error('後台連線失敗（' + response.status + '）。');
            return response.json();
        }).then(function (payload) {
            if (!payload || payload.ok !== true) throw new Error((payload && payload.error) || '後台回傳格式不正確。');
            return payload;
        });
    }

    function renderNav() {
        var html = NAV_ITEMS.map(function (item) {
            var count = state.entries.filter(function (entry) { return matchesCategory(entry, item.id); }).length;
            return '<button class="nav-button' + (state.activeSection === item.id ? ' active' : '') + '" type="button" data-section="' + item.id + '" aria-label="' + escapeAttr(item.label) + '" title="' + escapeAttr(item.label) + '"' + (state.activeSection === item.id ? ' aria-current="page"' : '') + '>' +
                '<span>' + item.icon + '</span><span>' + escapeHtml(item.label) + '</span><span class="nav-count">' + count + '</span></button>';
        }).join('');
        byId('admin-nav').innerHTML = html;
        byId('mobile-nav').innerHTML = '<span class="mobile-nav-hint">左右滑動</span>' + html;
    }

    function sidebarPreference() {
        try { return window.localStorage.getItem('roseFarmAdminSidebarCollapsed') === 'true'; }
        catch (error) { return false; }
    }

    function setSidebarCollapsed(collapsed, persist) {
        var app = byId('admin-app');
        var button = byId('sidebar-toggle');
        if (!app || !button) return;
        app.classList.toggle('sidebar-collapsed', !!collapsed);
        button.textContent = collapsed ? '›' : '‹';
        button.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        button.setAttribute('aria-label', collapsed ? '展開側邊欄' : '收合側邊欄');
        button.title = collapsed ? '展開側邊欄' : '收合側邊欄';
        if (persist) {
            try { window.localStorage.setItem('roseFarmAdminSidebarCollapsed', collapsed ? 'true' : 'false'); }
            catch (error) { /* 私密模式下無法儲存時，仍保留本次畫面狀態。 */ }
        }
    }

    function displayValue(value, type) {
        if (type === 'boolean') return value ? '顯示' : '隱藏';
        var text = String(value == null ? '' : value).replace(/<br\s*\/?>/gi, '／').replace(/<[^>]+>/g, '');
        return text || '（空白）';
    }

    function fieldWarning(entry) {
        return containsBrandTerm(state.current[entry.key])
            ? '<p class="field-warning">⚠ 內容出現「有機／Organic」，儲存前需要再次確認已由 Shao 核決。</p>' : '';
    }

    function fieldControl(entry, compact) {
        var key = entry.key;
        var value = state.current[key];
        var required = entry.required ? ' required' : '';
        var className = compact ? '' : ' data-field-control="true"';
        if (entry.type === 'boolean') {
            return '<div class="switch-row"><label class="switch"><input type="checkbox" data-key="' + escapeAttr(key) + '" data-type="boolean" aria-label="' + escapeAttr(entry.label) + '"' + (value ? ' checked' : '') + '><span></span></label><strong>' + (value ? '目前顯示' : '目前隱藏') + '</strong></div>';
        }
        if (isImageKey(key)) {
            var image = String(value || '');
            return '<div class="image-field"><div class="image-preview" data-preview-for="' + escapeAttr(key) + '">' +
                (isSafeImageUrl(image) ? '<img src="' + escapeAttr(image) + '" alt="圖片預覽" loading="lazy">' : '<span>' + (image ? '圖片網址格式錯誤' : '尚未設定圖片') + '</span>') +
                '</div><div><input type="url" data-key="' + escapeAttr(key) + '" data-type="string" aria-label="' + escapeAttr(entry.label) + '" value="' + escapeAttr(image) + '" placeholder="https://..."' + required + className + '>' +
                '<p class="field-help">' + escapeHtml(entry.guidance || '貼上 https:// 開頭的圖片網址，左側縮圖會立即更新。') + '</p></div></div>';
        }
        var text = String(value == null ? '' : value);
        var longField = text.length > 70 || /description|notice|\.a$|\.q$|\.text$|freeRule/i.test(key);
        if (longField) return '<textarea data-key="' + escapeAttr(key) + '" data-type="' + escapeAttr(entry.type) + '" aria-label="' + escapeAttr(entry.label) + '"' + required + className + '>' + escapeHtml(text) + '</textarea>';
        return '<input type="' + (entry.type === 'number' ? 'number' : 'text') + '" data-key="' + escapeAttr(key) + '" data-type="' + escapeAttr(entry.type) + '" aria-label="' + escapeAttr(entry.label) + '" value="' + escapeAttr(text) + '"' + required + className + '>';
    }

    function renderFieldCard(entry) {
        var changed = state.dirty.has(entry.key);
        var warning = containsBrandTerm(state.current[entry.key]);
        return '<article class="field-card' + (changed ? ' changed' : '') + (warning ? ' brand-warning' : '') + '" data-field-key="' + escapeAttr(entry.key) + '">' +
            '<div class="field-meta"><h4>' + escapeHtml(entry.label) + (entry.required ? ' <span class="required-dot">＊</span>' : '') + '</h4>' +
            '<p class="item-name">' + escapeHtml(entry.item) + '</p><span class="official-value">' + escapeHtml(displayValue(state.official[entry.key], entry.type)) + '</span></div>' +
            '<div class="field-control">' + fieldControl(entry, false) + fieldWarning(entry) + '</div></article>';
    }

    function groupEntries(entries, selector) {
        var groups = new Map();
        entries.forEach(function (entry) {
            var key = selector(entry);
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(entry);
        });
        return groups;
    }

    function renderGeneric(entries) {
        var groups = groupEntries(entries, function (entry) { return entry.section || navItem(categoryForEntry(entry)).label; });
        var html = '';
        groups.forEach(function (items, name) {
            html += '<section class="section-block"><h4 class="subsection-title">' + escapeHtml(SECTION_NAMES[name] || name) + '</h4>' +
                items.map(renderFieldCard).join('') + '</section>';
        });
        return html;
    }

    function getEntry(entries, key) { return entries.find(function (entry) { return entry.key === key; }); }
    function compactField(entry, label) {
        if (!entry) return '';
        return '<div class="compact-field" data-field-key="' + escapeAttr(entry.key) + '"><label>' + escapeHtml(label || entry.label) + (entry.required ? ' <span class="required-dot">＊</span>' : '') + '</label>' + fieldControl(entry, true) + fieldWarning(entry) + '</div>';
    }

    function renderDiy(entries) {
        var groups = groupEntries(entries, function (entry) { var match = entry.key.match(/^diy\.(\d+)\./); return match ? match[1] : 'other'; });
        var html = '<div class="diy-grid">';
        groups.forEach(function (items, index) {
            if (index === 'other') return;
            var prefix = 'diy.' + index + '.';
            var enabled = getEntry(items, prefix + 'enabled');
            var name = getEntry(items, prefix + 'name');
            var isEnabled = enabled ? !!state.current[enabled.key] : true;
            var isChanged = items.some(function (entry) { return state.dirty.has(entry.key); });
            var hasBrandWarning = items.some(function (entry) { return containsBrandTerm(state.current[entry.key]); });
            var title = name && state.current[name.key] ? state.current[name.key] : '尚未使用的 DIY 欄位';
            html += '<article class="diy-card' + (isEnabled ? '' : ' disabled-card') + (isChanged ? ' changed' : '') + (hasBrandWarning ? ' brand-warning' : '') + '" data-diy-index="' + index + '">' +
                '<header class="diy-card-header"><div><small>DIY ' + (Number(index) + 1) + '</small><h4>' + escapeHtml(title) + '</h4></div>' + (enabled ? fieldControl(enabled, true) : '') + '</header>' +
                '<div class="diy-card-body">' + compactField(name, '體驗名稱') +
                '<div class="two-column-fields">' + compactField(getEntry(items, prefix + 'price'), '價格') + compactField(getEntry(items, prefix + 'tag'), '所需時間') + '</div>' +
                compactField(getEntry(items, prefix + 'group'), '成團人數') + compactField(getEntry(items, prefix + 'image'), '圖片') + '</div>' +
                '<footer class="card-footer"><span>' + (isEnabled ? '目前會顯示在網站' : '目前不會顯示') + '</span>' +
                (enabled && isEnabled ? '<button class="danger-link" type="button" data-disable-diy="' + index + '">下架此項目</button>' : '') + '</footer></article>';
        });
        html += '<button class="add-card-button" id="add-diy-button" type="button">＋ 新增一個 DIY 項目<small>目前最多可顯示 8 項</small></button></div>';
        return html;
    }

    function faqPrefix(entry) {
        var match = entry.key.match(/^(qa\.categories\.\d+\.list\.\d+)/);
        return match ? match[1] : entry.key;
    }

    function faqCategoryIndex(entry) {
        var key = entry && entry.key ? entry.key : '';
        if (key.indexOf('qa.infoIcons.') === 0) return 'info';
        var match = key.match(/^qa\.categories\.(\d+)\./);
        return match ? match[1] : '';
    }

    function faqCategoryOptions() {
        var options = [{ id: 'all', label: '全部', count: 0 }];
        var questionCount = state.entries.filter(function (entry) { return /^qa\.categories\.\d+\.list\.\d+\.q$/.test(entry.key); }).length;
        options[0].count = questionCount;
        state.entries.filter(function (entry) { return /^qa\.categories\.\d+\.name$/.test(entry.key); }).forEach(function (entry) {
            var id = entry.key.match(/^qa\.categories\.(\d+)\./)[1];
            var count = state.entries.filter(function (candidate) { return new RegExp('^qa\\.categories\\.' + id + '\\.list\\.\\d+\\.q$').test(candidate.key); }).length;
            options.push({ id: id, label: String(state.current[entry.key] || entry.item || '未命名分類'), count: count });
        });
        var infoCount = state.entries.filter(function (entry) { return /^qa\.infoIcons\.\d+\.title$/.test(entry.key); }).length;
        if (infoCount) options.push({ id: 'info', label: '入口資訊圖示', count: infoCount });
        return options;
    }

    function renderFaqCategoryBar() {
        var active = state.query || state.dirtyOnly ? 'all' : state.faqCategory;
        return '<div class="faq-category-wrap"><div class="faq-category-heading"><strong>先選問題分類</strong><span>' +
            (state.query ? '搜尋時會比對所有分類' : '一次只看一類，比較好找') + '</span></div><div class="faq-category-bar">' +
            faqCategoryOptions().map(function (option) {
                return '<button class="faq-category-button' + (active === option.id ? ' active' : '') + '" type="button" data-faq-category="' + escapeAttr(option.id) + '" aria-pressed="' + (active === option.id ? 'true' : 'false') + '">' +
                    '<span>' + escapeHtml(option.label) + '</span><small>' + option.count + ' 題</small></button>';
            }).join('') + '</div></div>';
    }

    function visibleFaqEntries() {
        var all = state.entries.filter(function (entry) { return matchesCategory(entry, 'faq'); });
        if (!state.query && !state.dirtyOnly && state.faqCategory !== 'all') {
            return all.filter(function (entry) { return faqCategoryIndex(entry) === state.faqCategory; });
        }
        if (!state.query && !state.dirtyOnly) return all;
        var matched = filterEntries(all, 'faq', state.query, state.dirtyOnly, state.dirty);
        var matchedKeys = new Set(matched.map(function (entry) { return entry.key; }));
        var matchedPrefixes = new Set(matched.map(faqPrefix));
        return all.filter(function (entry) {
            var prefix = faqPrefix(entry);
            return matchedKeys.has(entry.key) || (/^qa\.categories\.\d+\.list\.\d+/.test(prefix) && matchedPrefixes.has(prefix));
        });
    }

    function renderFaq(entries) {
        var questionEntries = entries.filter(function (entry) { return /^qa\.categories\.\d+\.list\.\d+\./.test(entry.key); });
        var groups = groupEntries(questionEntries, faqPrefix);
        var html = renderFaqCategoryBar() + '<div class="section-block">';
        groups.forEach(function (items, prefix) {
            var q = getEntry(items, prefix + '.q');
            var a = getEntry(items, prefix + '.a');
            var match = prefix.match(/^qa\.categories\.(\d+)\.list\.(\d+)$/);
            var categoryIndex = match ? Number(match[1]) : 0;
            var questionIndex = match ? Number(match[2]) : 0;
            var categoryEntry = state.entryByKey.get('qa.categories.' + categoryIndex + '.name');
            var categoryName = categoryEntry ? state.current[categoryEntry.key] : (q ? q.item.split('／')[0] : '常見問題');
            var title = q ? state.current[q.key] : '表格型答案';
            var isChanged = items.some(function (entry) { return state.dirty.has(entry.key); });
            var hasBrandWarning = items.some(function (entry) { return containsBrandTerm(state.current[entry.key]); });
            var rowEntries = items.filter(function (entry) { return new RegExp('^' + prefix.replace(/\./g, '\\.') + '\\.rows\\.\\d+\\.').test(entry.key); });
            var tableRows = groupEntries(rowEntries, function (entry) { var rowMatch = entry.key.match(/\.rows\.(\d+)\./); return rowMatch ? rowMatch[1] : '0'; });
            var answerHtml = '';
            if (a) answerHtml = '<div class="faq-answer-field">' + compactField(a, '💬 答案') + '</div>';
            else if (rowEntries.length) {
                answerHtml = '<div class="faq-answer-field"><div class="faq-table-label">💬 表格答案</div><div class="faq-table-editor">';
                tableRows.forEach(function (rowItems, rowIndex) {
                    answerHtml += '<div class="faq-table-row"><strong>第 ' + (Number(rowIndex) + 1) + ' 列</strong>' +
                        compactField(rowItems.find(function (entry) { return /\.label$/.test(entry.key); }), '項目') +
                        compactField(rowItems.find(function (entry) { return /\.value$/.test(entry.key); }), '內容') +
                        compactField(rowItems.find(function (entry) { return /\.note$/.test(entry.key); }), '補充') + '</div>';
                });
                answerHtml += '</div></div>';
            }
            html += '<article class="faq-card' + (isChanged ? ' changed' : '') + (hasBrandWarning ? ' brand-warning' : '') + '" data-faq-prefix="' + escapeAttr(prefix) + '"><header class="faq-card-header"><span class="faq-number">' + (questionIndex + 1) + '</span>' +
                '<div class="faq-title-wrap"><small>' + escapeHtml(categoryName) + '</small><h4>' + escapeHtml(title || '尚未填寫題目') + '</h4></div></header>' +
                '<div class="faq-card-body">' + (q ? '<div class="faq-question-field">' + compactField(q, '❓ 問題') + '</div>' : '') +
                answerHtml + '</div></article>';
        });
        var remaining = entries.filter(function (entry) { return questionEntries.indexOf(entry) === -1; });
        if (remaining.length) html += '<h4 class="subsection-title">分類名稱與入口資訊</h4>' + remaining.map(renderFieldCard).join('');
        return html + '</div>';
    }

    function imageCategoryOptions() {
        var definitions = [
            { id: 'all', label: '全部圖片' }, { id: 'hero', label: '首頁主視覺' },
            { id: 'features', label: '三大特色' }, { id: 'bento', label: '體驗拼貼卡' },
            { id: 'gallery', label: '園區相簿' }, { id: 'seasons', label: '四季花況' },
            { id: 'eco', label: '生態觀察' }, { id: 'dining', label: '玫瑰餐廳' },
            { id: 'diy', label: 'DIY 體驗' }, { id: 'services', label: '導覽與場租' },
            { id: 'products', label: '伴手禮' }, { id: 'modals', label: '詳情彈窗' },
            { id: 'other', label: '其他圖片' }
        ];
        var images = state.entries.filter(function (entry) { return isImageKey(entry.key); });
        return definitions.map(function (definition) {
            var count = definition.id === 'all' ? images.length : images.filter(function (entry) { return imageCategoryForKey(entry.key) === definition.id; }).length;
            return Object.assign({}, definition, { count: count });
        }).filter(function (definition) { return definition.id === 'all' || definition.count > 0; });
    }

    function renderImageCategoryBar() {
        var active = state.query || state.dirtyOnly ? 'all' : state.imageCategory;
        return '<div class="image-category-wrap"><div class="image-category-heading"><div><strong>先選圖片出現的位置</strong><span>每張卡片都有實際縮圖與網站位置提示</span></div>' +
            '<span class="image-preview-legend">🖼️ 換網址後，預覽會立即更新</span></div><div class="image-category-bar">' +
            imageCategoryOptions().map(function (option) {
                return '<button class="image-category-button' + (active === option.id ? ' active' : '') + '" type="button" data-image-category="' + escapeAttr(option.id) + '" aria-pressed="' + (active === option.id ? 'true' : 'false') + '">' +
                    '<span>' + escapeHtml(option.label) + '</span><small>' + option.count + ' 張</small></button>';
            }).join('') + '</div></div>';
    }

    function visibleImageEntries() {
        var all = state.entries.filter(function (entry) { return isImageKey(entry.key); });
        if (state.query || state.dirtyOnly) return filterEntries(all, 'images', state.query, state.dirtyOnly, state.dirty);
        if (state.imageCategory === 'all') return all;
        return all.filter(function (entry) { return imageCategoryForKey(entry.key) === state.imageCategory; });
    }

    function imageCategoryLabel(key) {
        var id = imageCategoryForKey(key);
        var option = imageCategoryOptions().find(function (item) { return item.id === id; });
        return option ? option.label : '網站圖片';
    }

    function renderImagePreview(value, key) {
        if (!value) return '<div class="image-manager-preview empty" data-preview-for="' + escapeAttr(key) + '"><span>尚未設定圖片</span></div>';
        if (!isSafeImageUrl(value)) return '<div class="image-manager-preview empty invalid" data-preview-for="' + escapeAttr(key) + '"><span>⚠ 圖片網址必須以 https:// 開頭</span></div>';
        return '<div class="image-manager-preview" data-preview-for="' + escapeAttr(key) + '"><a href="' + escapeAttr(value) + '" target="_blank" rel="noopener noreferrer" title="開啟原圖">' +
            '<img src="' + escapeAttr(value) + '" alt="' + escapeAttr(imageLocationHint(key)) + '" loading="lazy"></a></div>';
    }

    function renderImageCard(entry) {
        var key = entry.key;
        var value = String(state.current[key] || '');
        return '<article class="image-manager-card' + (state.dirty.has(key) ? ' changed' : '') + '" data-field-key="' + escapeAttr(key) + '">' +
            renderImagePreview(value, key) + '<div class="image-manager-body"><div class="image-card-meta"><span>' + escapeHtml(imageCategoryLabel(key)) + '</span>' +
            (state.dirty.has(key) ? '<strong>尚未儲存</strong>' : '') + '</div><h4>' + escapeHtml(entry.item || entry.label) + '</h4>' +
            '<p class="image-location-hint"><b>出現位置：</b>' + escapeHtml(imageLocationHint(key)) + '</p>' +
            '<label class="image-url-field"><span>圖片網址' + (entry.required ? ' <i>＊</i>' : '') + '</span><input type="url" data-key="' + escapeAttr(key) + '" data-type="string" aria-label="' + escapeAttr((entry.item || entry.label) + '圖片網址') + '" value="' + escapeAttr(value) + '" placeholder="https://..."' + (entry.required ? ' required' : '') + '></label>' +
            '<p class="image-current-value">目前正式網址：' + escapeHtml(String(state.official[key] || '（空白）')) + '</p></div></article>';
    }

    function renderImages(entries) {
        return renderImageCategoryBar() + '<div class="image-grid image-manager-grid">' + entries.map(renderImageCard).join('') + '</div>';
    }

    function renderContent() {
        var item = navItem(state.activeSection);
        byId('breadcrumb').textContent = '管理中心／' + item.label;
        byId('page-title').textContent = item.label;
        byId('section-kicker').textContent = item.kicker;
        byId('section-title').textContent = item.label;
        byId('section-description').textContent = item.description;
        var entries = state.activeSection === 'faq'
            ? visibleFaqEntries()
            : state.activeSection === 'images'
                ? visibleImageEntries()
                : filterEntries(state.entries, state.activeSection, state.query, state.dirtyOnly, state.dirty);
        var html;
        if (state.activeSection === 'diy' && !state.query && !state.dirtyOnly) html = renderDiy(entries);
        else if (state.activeSection === 'faq') html = renderFaq(entries);
        else if (state.activeSection === 'images') html = renderImages(entries);
        else html = renderGeneric(entries);
        byId('editor-content').innerHTML = html;
        byId('empty-state').classList.toggle('hidden', entries.length > 0);
        renderNav();
        updateSummary();
        focusDeepLink();
    }

    function updateSummary() {
        byId('summary-fields').textContent = state.entries.length;
        byId('summary-dirty').textContent = state.dirty.size;
        byId('summary-images').textContent = state.entries.filter(function (entry) { return isImageKey(entry.key); }).length;
        byId('save-count').textContent = state.dirty.size ? '已修改 ' + state.dirty.size + ' 個欄位' : '尚未修改';
        byId('save-hint').textContent = state.dirty.size ? '先儲存草稿，正式網站不會立刻改變。' : '修改後先儲存草稿，再預覽確認。';
        byId('save-button').disabled = state.dirty.size === 0;
        byId('show-dirty-button').classList.toggle('active', state.dirtyOnly);
    }

    function relatedEntriesForKey(key) {
        var diyMatch = key.match(/^(diy\.\d+)\./);
        if (diyMatch) return state.entries.filter(function (entry) { return entry.key.indexOf(diyMatch[1] + '.') === 0; });
        var faqMatch = key.match(/^(qa\.categories\.\d+\.list\.\d+)/);
        if (faqMatch) return state.entries.filter(function (entry) { return entry.key.indexOf(faqMatch[1] + '.') === 0; });
        var single = state.entryByKey.get(key);
        return single ? [single] : [];
    }

    function updateValue(key, rawValue) {
        var entry = state.entryByKey.get(key);
        if (!entry) return;
        var value = normalizeValue(rawValue, entry.type);
        state.current[key] = value;
        if (valuesEqual(value, state.originalDraft[key], entry.type)) state.dirty.delete(key);
        else state.dirty.add(key);
        updateSummary();
        var card = document.querySelector('[data-field-key="' + cssEscape(key) + '"]');
        if (card) {
            var targetCard = card.closest('.field-card, .diy-card, .faq-card, .image-manager-card') || card;
            var related = relatedEntriesForKey(key);
            targetCard.classList.toggle('changed', related.some(function (candidate) { return state.dirty.has(candidate.key); }));
            targetCard.classList.toggle('brand-warning', related.some(function (candidate) { return containsBrandTerm(state.current[candidate.key]); }));
        }
        updateLiveDetails(key, value);
    }

    function cssEscape(value) {
        if (window.CSS && window.CSS.escape) return window.CSS.escape(value);
        return String(value).replace(/(["\\])/g, '\\$1');
    }

    function updateLiveDetails(key, value) {
        var preview = document.querySelector('[data-preview-for="' + cssEscape(key) + '"]');
        if (preview) {
            var safeImage = isSafeImageUrl(value);
            preview.classList.toggle('empty', !safeImage);
            preview.classList.toggle('invalid', !!value && !safeImage);
            preview.innerHTML = safeImage
                ? (preview.classList.contains('image-manager-preview')
                    ? '<a href="' + escapeAttr(value) + '" target="_blank" rel="noopener noreferrer" title="開啟原圖"><img src="' + escapeAttr(value) + '" alt="圖片預覽" loading="lazy"></a>'
                    : '<img src="' + escapeAttr(value) + '" alt="圖片預覽" loading="lazy">')
                : '<span>' + (value ? '⚠ 圖片網址必須以 https:// 開頭' : '尚未設定圖片') + '</span>';
        }
        var field = document.querySelector('[data-key="' + cssEscape(key) + '"]');
        if (field && field.type === 'checkbox') {
            var switchText = field.closest('.switch-row');
            var statusText = switchText && switchText.querySelector('strong');
            if (statusText) statusText.textContent = value ? '目前顯示' : '目前隱藏';
        }
        var card = field && (field.closest('.field-card, .compact-field'));
        if (card) {
            var oldWarning = card.querySelector('.field-warning');
            if (oldWarning) oldWarning.remove();
            if (containsBrandTerm(value)) {
                var warning = document.createElement('p');
                warning.className = 'field-warning';
                warning.textContent = '⚠ 內容出現「有機／Organic」，儲存前需要再次確認已由 Shao 核決。';
                (field.closest('.field-control') || field.parentElement).appendChild(warning);
            }
        }
    }

    function addDiy() {
        var enabledEntries = state.entries.filter(function (entry) { return /^diy\.\d+\.enabled$/.test(entry.key); });
        var disabled = enabledEntries.filter(function (entry) { return !state.current[entry.key]; });
        if (!disabled.length) { showToast('目前 8 個 DIY 欄位已全部使用，請先下架一項。', true); return; }
        var fields = ['name', 'price', 'tag', 'group', 'image'];
        var available = disabled.find(function (entry) {
            var prefix = entry.key.replace(/enabled$/, '');
            return fields.every(function (field) { return !String(state.current[prefix + field] || '').trim(); });
        });
        if (!available) {
            available = disabled[0];
            openConfirm({ icon: '🧹', title: '建立新的空白 DIY？', message: '預留欄位中只有已下架的舊項目。繼續會清除其中一項舊內容，再建立空白 DIY。', confirmLabel: '清除並新增', onConfirm: function () { activateBlankDiy(available, true); } });
            return;
        }
        activateBlankDiy(available, false);
    }

    function activateBlankDiy(available, clearOldContent) {
        var prefix = available.key.replace(/enabled$/, '');
        if (clearOldContent) ['name', 'price', 'tag', 'group', 'image'].forEach(function (field) { updateValue(prefix + field, ''); });
        updateValue(available.key, true);
        renderContent();
        var index = available.key.match(/^diy\.(\d+)/)[1];
        var card = document.querySelector('[data-diy-index="' + index + '"]');
        if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        showToast('已新增空白 DIY，請填寫內容後儲存草稿。');
    }

    function disableDiy(index) {
        updateValue('diy.' + index + '.enabled', false);
        renderContent();
        showToast('此 DIY 已標記為下架，儲存草稿後才會生效。');
    }

    function validateDirty() {
        var problems = [];
        state.dirty.forEach(function (key) {
            var entry = state.entryByKey.get(key);
            var value = state.current[key];
            if (entry.required && (value === '' || value == null)) problems.push(entry.label + '不可留空');
            if (isImageKey(key) && value && !/^https:\/\//i.test(String(value))) problems.push(entry.label + '必須使用 https:// 圖片網址');
        });
        var enabledDiy = state.entries.filter(function (entry) { return /^diy\.\d+\.enabled$/.test(entry.key) && state.current[entry.key]; });
        enabledDiy.forEach(function (entry) {
            var prefix = entry.key.replace(/enabled$/, '');
            ['name', 'price', 'tag', 'group', 'image'].forEach(function (field) {
                if (!String(state.current[prefix + field] || '').trim()) problems.push('已顯示的 DIY 必須填寫' + (FIELD_LABELS[field] || field));
            });
        });
        return Array.from(new Set(problems));
    }

    function dirtyUpdates() {
        return Array.from(state.dirty).map(function (key) { return { key: key, value: state.current[key] }; });
    }

    function dirtyHasBrandTerm() {
        return Array.from(state.dirty).some(function (key) { return containsBrandTerm(state.current[key]); });
    }

    function saveDraft(brandConfirmed) {
        var problems = validateDirty();
        if (problems.length) { showToast(problems[0] + (problems.length > 1 ? '（另有 ' + (problems.length - 1) + ' 項）' : ''), true); return Promise.resolve(false); }
        if (!state.dirty.size) { showToast('目前沒有需要儲存的修改。'); return Promise.resolve(true); }
        if (dirtyHasBrandTerm() && !brandConfirmed) {
            openConfirm({ icon: '⚠️', title: '品牌用語需要核決', message: '草稿包含「有機／Organic」。依品牌規則，請先確認已由 Shao 核決後才能儲存。', brand: true, confirmLabel: '確認並儲存', onConfirm: function () { saveDraft(true); } });
            return Promise.resolve(false);
        }
        var updates = dirtyUpdates();
        setBusy(byId('save-button'), true, '儲存中…');
        var request = state.demo ? Promise.resolve({ ok: true, savedCount: updates.length }) : postAction('draft_save', { updates: updates, brandConfirmed: !!brandConfirmed });
        return request.then(function (payload) {
            updates.forEach(function (update) { state.originalDraft[update.key] = state.current[update.key]; });
            state.dirty.clear();
            renderContent();
            showToast(state.demo ? '展示模式：草稿只暫存在這個頁面，尚未寫入 Sheet。' : '草稿已儲存，共 ' + payload.savedCount + ' 項；正式網站尚未改變。');
            return true;
        }).catch(function (error) { showToast(error.message, true); return false; })
            .finally(function () { setBusy(byId('save-button'), false, '儲存草稿'); updateSummary(); });
    }

    function discardChanges() {
        if (!state.dirty.size) { showToast('目前沒有需要放棄的修改。'); return; }
        openConfirm({ icon: '↩️', title: '放棄本次修改？', message: '本次尚未儲存的內容會恢復成上一次草稿。', confirmLabel: '放棄修改', onConfirm: function () {
            state.dirty.forEach(function (key) { state.current[key] = state.originalDraft[key]; });
            state.dirty.clear(); renderContent(); showToast('已放棄本次修改。');
        } });
    }

    function previewDraft() {
        if (state.dirty.size) { showToast('請先按「儲存草稿」，預覽才會包含本次修改。', true); return; }
        if (state.demo) { showToast('展示模式尚未連接 Apps Script，無法產生草稿預覽。', true); return; }
        var previewWindow = window.open('', '_blank');
        if (previewWindow) previewWindow.document.write('<p style="font-family:sans-serif;padding:30px">正在產生草稿預覽…</p>');
        setBusy(byId('preview-button'), true, '產生中…');
        postAction('preview_url').then(function (payload) {
            if (previewWindow) previewWindow.location.href = payload.url;
            else window.open(payload.url, '_blank');
        }).catch(function (error) { if (previewWindow) previewWindow.close(); showToast(error.message, true); })
            .finally(function () { setBusy(byId('preview-button'), false, '👁 草稿預覽'); });
    }

    function publishDraft(brandConfirmed) {
        if (state.dirty.size) { showToast('還有未儲存的修改，請先儲存草稿。', true); return; }
        if (state.demo) { showToast('展示模式不會發布到正式網站。', true); return; }
        var hasBrand = state.entries.some(function (entry) { return containsBrandTerm(state.current[entry.key]) && !valuesEqual(state.current[entry.key], state.official[entry.key], entry.type); });
        if (!brandConfirmed) {
            openConfirm({ icon: '✅', title: '確定發布全部草稿？', message: '發布後，正式網站會改成目前草稿內容。建議先開啟「草稿預覽」確認。', brand: hasBrand, confirmLabel: '發布到正式網站', onConfirm: function () { publishDraft(true); } });
            return;
        }
        setBusy(byId('publish-button'), true, '發布中…');
        postAction('publish_draft', { brandConfirmed: !!brandConfirmed }).then(function (payload) {
            state.entries.forEach(function (entry) { state.official[entry.key] = state.current[entry.key]; entry.value = state.current[entry.key]; });
            renderContent(); showToast(payload.message || ('已發布 ' + payload.publishedCount + ' 項內容。'));
            offerTaskListClearAfterPublish();
        }).catch(function (error) { showToast(error.message, true); })
            .finally(function () { setBusy(byId('publish-button'), false, '✅ 發布全部'); });
    }

    function setBusy(button, busy, label) {
        if (!button) return;
        button.disabled = busy;
        button.textContent = label;
    }

    function openConfirm(options) {
        lastFocusedElement = document.activeElement;
        state.pendingConfirm = options.onConfirm;
        state.pendingCancel = options.onCancel || null;
        byId('confirm-icon').textContent = options.icon || '⚠️';
        byId('confirm-title').textContent = options.title || '請再次確認';
        byId('confirm-message').textContent = options.message || '';
        byId('confirm-action').textContent = options.confirmLabel || '確定';
        byId('confirm-cancel').textContent = options.cancelLabel || '取消';
        byId('brand-confirm-row').classList.toggle('hidden', !options.brand);
        byId('brand-confirm-checkbox').checked = false;
        byId('confirm-modal').classList.remove('hidden');
        byId('admin-app').inert = true;
        setTimeout(function () { byId('confirm-action').focus(); }, 0);
    }

    function closeConfirm() {
        state.pendingConfirm = null;
        state.pendingCancel = null;
        byId('confirm-modal').classList.add('hidden');
        byId('admin-app').inert = false;
        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') lastFocusedElement.focus();
        lastFocusedElement = null;
    }

    function trapConfirmFocus(event) {
        if (event.key !== 'Tab' || byId('confirm-modal').classList.contains('hidden')) return;
        var controls = Array.prototype.filter.call(
            byId('confirm-modal').querySelectorAll('button:not([disabled]), input:not([disabled])'),
            function (element) { return !element.closest('.hidden'); },
        );
        if (!controls.length) return;
        var first = controls[0];
        var last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    function confirmAction() {
        var requiresBrand = !byId('brand-confirm-row').classList.contains('hidden');
        if (requiresBrand && !byId('brand-confirm-checkbox').checked) { showToast('請先勾選已完成品牌用語核決。', true); return; }
        var action = state.pendingConfirm; closeConfirm(); if (action) action();
    }

    function cancelConfirm() {
        var action = state.pendingCancel;
        closeConfirm();
        if (action) action();
    }

    function showToast(message, error) {
        var toast = byId('toast');
        toast.textContent = message; toast.classList.toggle('error', !!error); toast.classList.add('show');
        clearTimeout(state.toastTimer); state.toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 3800);
    }

    function showApp() {
        byId('admin-login').classList.add('hidden'); byId('admin-app').classList.remove('hidden');
        var badge = byId('connection-badge');
        badge.className = 'status-badge ' + (state.demo ? 'demo' : 'connected');
        badge.textContent = state.demo ? '展示模式｜未連接' : '● 已連接 Sheet';
        activateDeepLinkContext();
        renderContent();
        maybeStartImageTaskTour();
    }

    function enterDemo() {
        state.demo = true; state.connected = false; state.passcode = '';
        setEntries(buildDemoEntries(window.DATA || {})); showApp(); showToast('這是展示模式，可試改內容，但不會寫入 Google Sheet。');
    }

    function login(event) {
        event.preventDefault();
        if (!endpoint()) { byId('login-message').textContent = '尚未連接 Apps Script；可先按下方按鈕查看展示介面。'; return; }
        var passcode = byId('admin-passcode').value.trim();
        if (!passcode) { byId('login-message').textContent = '請輸入後台通行碼。'; return; }
        state.passcode = passcode;
        setBusy(byId('login-button'), true, '驗證中…'); byId('login-message').textContent = '';
        postAction('admin_load').then(function (payload) {
            state.demo = false; state.connected = true; setEntries(payload.entries); showApp();
        }).catch(function (error) { state.passcode = ''; byId('login-message').textContent = error.message; })
            .finally(function () { setBusy(byId('login-button'), false, '登入管理中心'); });
    }

    function performLogout() {
        state.passcode = ''; state.connected = false; state.demo = false; state.entries = []; state.dirty.clear();
        deepLinkUsed = false;
        byId('admin-passcode').value = ''; byId('admin-app').classList.add('hidden'); byId('admin-login').classList.remove('hidden');
    }

    function logout() {
        if (!state.dirty.size) { performLogout(); return; }
        openConfirm({ icon: '⚠️', title: '尚有未儲存的修改', message: '現在登出會放棄本次尚未儲存的內容。確定要登出嗎？', confirmLabel: '放棄修改並登出', onConfirm: performLogout });
    }

    var deepLinkUsed = false;
    function deepLinkField() {
        return new URLSearchParams(window.location.search).get('field');
    }

    function activateFieldContext(field) {
        var entry = state.entryByKey.get(field);
        if (!entry) return false;
        if (isImageKey(field)) {
            state.activeSection = 'images';
            state.imageCategory = imageCategoryForKey(field);
        } else {
            state.activeSection = categoryForEntry(entry);
            if (state.activeSection === 'faq') state.faqCategory = faqCategoryIndex(entry) || 'all';
        }
        state.query = '';
        state.dirtyOnly = false;
        byId('admin-search').value = '';
        return true;
    }

    function activateDeepLinkContext() {
        if (deepLinkUsed) return;
        var field = deepLinkField();
        if (!field) return;
        if (!activateFieldContext(field)) {
            deepLinkUsed = true;
            setTimeout(function () { showToast('找不到這個後台欄位，可能已停用或更名。', true); }, 80);
        }
    }

    function focusRenderedField(field, markTourTarget) {
        var target = document.querySelector('[data-field-key="' + cssEscape(field) + '"]');
        if (!target) return false;
        setTimeout(function () {
            Array.prototype.forEach.call(document.querySelectorAll('.image-task-tour-target'), function (element) { element.classList.remove('image-task-tour-target'); });
            if (markTourTarget) target.classList.add('image-task-tour-target');
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            var input = target.querySelector('[data-key]');
            if (input) input.focus();
        }, 100);
        return true;
    }

    function focusField(field) {
        if (!activateFieldContext(field)) return false;
        renderContent();
        return focusRenderedField(field, true);
    }

    function focusDeepLink() {
        if (deepLinkUsed) return;
        var field = deepLinkField();
        if (!field) return;
        if (!focusRenderedField(field, false)) return;
        deepLinkUsed = true;
    }

    function tourRequested() {
        return new URLSearchParams(window.location.search).get('tour') === '1';
    }

    function currentTaskList() {
        var store = imageTaskStore();
        return store && store.available() ? store.load() : { items: [] };
    }

    function setTourVisible(visible) {
        byId('image-task-tour').classList.toggle('hidden', !visible);
    }

    function renderImageTaskTour() {
        var list = currentTaskList();
        if (!state.taskTourActive || !list.items.length) { setTourVisible(false); return; }
        state.taskTourIndex = Math.max(0, Math.min(state.taskTourIndex, list.items.length - 1));
        var item = list.items[state.taskTourIndex];
        var entry = state.entryByKey.get(item.key);
        var invalid = !entry || !isImageKey(item.key);
        byId('image-task-tour-progress').textContent = '修改清單導覽　第 ' + (state.taskTourIndex + 1) + ' / ' + list.items.length + ' 項';
        byId('image-task-tour-title').textContent = item.label;
        byId('image-task-tour-location').textContent = '網站位置：' + (entry ? imageLocationHint(item.key) : item.locationHint);
        byId('image-task-tour-hint').textContent = '貼上新的圖片網址（https:// 開頭），改完按「完成這項」。';
        var preview = byId('image-task-tour-preview');
        preview.classList.remove('summary');
        var value = entry ? state.current[item.key] : '';
        preview.innerHTML = isSafeImageUrl(value) ? '<img src="' + escapeAttr(value) + '" alt="目前圖片預覽">' : '<span>目前沒有可預覽的圖片</span>';
        byId('image-task-tour-error').textContent = invalid ? '此欄位已不存在，可能已改版。可「略過」或「從清單移除」。' : '';
        byId('image-task-tour-error').classList.toggle('hidden', !invalid);
        byId('image-task-tour-remove').classList.toggle('hidden', !invalid);
        ['image-task-tour-prev', 'image-task-tour-done', 'image-task-tour-skip', 'image-task-tour-next'].forEach(function (id) { byId(id).classList.remove('hidden'); });
        byId('image-task-tour-done').disabled = invalid;
        byId('image-task-tour-prev').disabled = state.taskTourIndex === 0;
        byId('image-task-tour-next').disabled = state.taskTourIndex === list.items.length - 1;
        setTourVisible(true);
    }

    function showImageTaskTourIndex(index) {
        var list = currentTaskList();
        if (!list.items.length) { leaveImageTaskTour(); return; }
        state.taskTourIndex = Math.max(0, Math.min(index, list.items.length - 1));
        var item = list.items[state.taskTourIndex];
        if (state.entryByKey.has(item.key)) focusField(item.key);
        renderImageTaskTour();
    }

    function startImageTaskTour() {
        var store = imageTaskStore();
        var list = currentTaskList();
        if (!store || !store.available() || !list.items.length) return false;
        state.taskTourActive = true;
        var pendingIndex = store.nextPendingIndex(list, 0);
        if (pendingIndex < 0) showImageTaskSummary();
        else showImageTaskTourIndex(pendingIndex);
        return true;
    }

    function leaveImageTaskTour() {
        state.taskTourActive = false;
        setTourVisible(false);
        Array.prototype.forEach.call(document.querySelectorAll('.image-task-tour-target'), function (element) { element.classList.remove('image-task-tour-target'); });
    }

    function moveImageTaskTour(delta) {
        showImageTaskTourIndex(state.taskTourIndex + delta);
    }

    function finishImageTask(status) {
        var store = imageTaskStore();
        var list = currentTaskList();
        var item = list.items[state.taskTourIndex];
        if (!store || !item) return;
        store.setStatus(item.key, status);
        list = currentTaskList();
        var next = store.nextPendingIndex(list, state.taskTourIndex + 1);
        if (next < 0) {
            showImageTaskSummary();
            return;
        }
        showImageTaskTourIndex(next);
    }

    function removeCurrentImageTask() {
        var store = imageTaskStore();
        var list = currentTaskList();
        var item = list.items[state.taskTourIndex];
        if (!store || !item) return;
        store.remove(item.key);
        var remaining = currentTaskList();
        if (!remaining.items.length) { leaveImageTaskTour(); return; }
        showImageTaskTourIndex(Math.min(state.taskTourIndex, remaining.items.length - 1));
    }

    function maybeStartImageTaskTour() {
        var store = imageTaskStore();
        if (!store || !store.available()) return;
        var list = store.load();
        if (!list.items.length) return;
        var summary = store.summary(list);
        if (store.isStale(list)) {
            openConfirm({
                icon: '🗂️',
                title: '這份修改清單已超過 24 小時',
                message: '你可以繼續使用，或清除舊清單後重新挑選圖片。',
                confirmLabel: '繼續使用',
                cancelLabel: '清除清單',
                onConfirm: startImageTaskTour,
                onCancel: function () { store.clear(); leaveImageTaskTour(); showToast('舊修改清單已清除。'); }
            });
            return;
        }
        if (tourRequested()) { startImageTaskTour(); return; }
        if (summary.pending > 0) {
            openConfirm({
                icon: '🗂️',
                title: '偵測到未完成的修改清單',
                message: '還有 ' + summary.pending + ' 項圖片待處理，要接著完成嗎？',
                confirmLabel: '繼續導覽',
                cancelLabel: '現在不要',
                onConfirm: startImageTaskTour
            });
        }
    }

    function showImageTaskSummary() {
        var store = imageTaskStore();
        var list = currentTaskList();
        if (!store || !list.items.length) { leaveImageTaskTour(); return; }
        var counts = store.summary(list);
        state.taskTourActive = true;
        byId('image-task-tour-progress').textContent = '修改清單導覽';
        byId('image-task-tour-title').textContent = '導覽完成';
        var preview = byId('image-task-tour-preview');
        preview.classList.add('summary');
        preview.innerHTML = '<span aria-hidden="true">✓</span>';
        byId('image-task-tour-location').textContent = '完成 ' + counts.done + ' 項、略過 ' + counts.skipped + ' 項（共 ' + counts.total + ' 項）。';
        byId('image-task-tour-hint').textContent = '接著可儲存草稿、開啟草稿預覽並發布；導覽不會自動寫入或發布。';
        byId('image-task-tour-error').classList.add('hidden');
        ['image-task-tour-prev', 'image-task-tour-done', 'image-task-tour-skip', 'image-task-tour-next', 'image-task-tour-remove'].forEach(function (id) { byId(id).classList.add('hidden'); });
        setTourVisible(true);
    }

    function offerTaskListClearAfterPublish() {
        var store = imageTaskStore();
        if (!store || !store.available()) return;
        var list = store.load();
        var counts = store.summary(list);
        if (!counts.total || counts.pending > 0) return;
        openConfirm({
            icon: '🧹',
            title: '清單已完成，要清除嗎？',
            message: '正式內容已發布。清除後，下次可以重新建立一份圖片修改清單。',
            confirmLabel: '清除清單',
            cancelLabel: '保留',
            onConfirm: function () { store.clear(); leaveImageTaskTour(); showToast('圖片修改清單已清除。'); }
        });
    }

    function bindEvents() {
        byId('login-form').addEventListener('submit', login);
        byId('demo-button').addEventListener('click', enterDemo);
        byId('toggle-passcode').addEventListener('click', function () {
            var input = byId('admin-passcode'); input.type = input.type === 'password' ? 'text' : 'password';
            byId('toggle-passcode').setAttribute('aria-label', input.type === 'password' ? '顯示通行碼' : '隱藏通行碼');
        });
        [byId('admin-nav'), byId('mobile-nav')].forEach(function (nav) {
            nav.addEventListener('click', function (event) {
                var button = event.target.closest('[data-section]'); if (!button) return;
                state.activeSection = button.dataset.section; state.dirtyOnly = false; renderContent(); window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
        byId('admin-search').addEventListener('input', function (event) { state.query = event.target.value; renderContent(); });
        byId('show-dirty-button').addEventListener('click', function () { state.dirtyOnly = !state.dirtyOnly; renderContent(); });
        byId('editor-content').addEventListener('input', function (event) {
            var input = event.target.closest('[data-key]'); if (!input || input.type === 'checkbox') return;
            updateValue(input.dataset.key, input.value);
        });
        byId('editor-content').addEventListener('change', function (event) {
            var input = event.target.closest('[data-key]'); if (!input) return;
            updateValue(input.dataset.key, input.type === 'checkbox' ? input.checked : input.value);
            if (input.type === 'checkbox' && /^diy\.\d+\.enabled$/.test(input.dataset.key)) renderContent();
        });
        byId('editor-content').addEventListener('click', function (event) {
            var imageCategory = event.target.closest('[data-image-category]');
            if (imageCategory) {
                state.imageCategory = imageCategory.dataset.imageCategory;
                state.query = '';
                byId('admin-search').value = '';
                renderContent();
                return;
            }
            var faqCategory = event.target.closest('[data-faq-category]');
            if (faqCategory) {
                state.faqCategory = faqCategory.dataset.faqCategory;
                state.query = '';
                byId('admin-search').value = '';
                renderContent();
                return;
            }
            var disable = event.target.closest('[data-disable-diy]');
            if (disable) disableDiy(disable.dataset.disableDiy);
            if (event.target.closest('#add-diy-button')) addDiy();
        });
        byId('save-button').addEventListener('click', function () { saveDraft(false); });
        byId('discard-button').addEventListener('click', discardChanges);
        byId('preview-button').addEventListener('click', previewDraft);
        byId('publish-button').addEventListener('click', function () { publishDraft(false); });
        byId('logout-button').addEventListener('click', logout);
        byId('image-task-tour-close').addEventListener('click', leaveImageTaskTour);
        byId('image-task-tour-prev').addEventListener('click', function () { moveImageTaskTour(-1); });
        byId('image-task-tour-next').addEventListener('click', function () { moveImageTaskTour(1); });
        byId('image-task-tour-done').addEventListener('click', function () { finishImageTask('done'); });
        byId('image-task-tour-skip').addEventListener('click', function () { finishImageTask('skipped'); });
        byId('image-task-tour-remove').addEventListener('click', removeCurrentImageTask);
        byId('sidebar-toggle').addEventListener('click', function () {
            setSidebarCollapsed(!byId('admin-app').classList.contains('sidebar-collapsed'), true);
        });
        byId('confirm-action').addEventListener('click', confirmAction);
        byId('confirm-close').addEventListener('click', closeConfirm);
        byId('confirm-cancel').addEventListener('click', cancelConfirm);
        byId('confirm-modal').addEventListener('mousedown', function (event) { event.currentTarget.dataset.downOnBackdrop = event.target === event.currentTarget ? '1' : '0'; });
        byId('confirm-modal').addEventListener('mouseup', function (event) { if (event.target === event.currentTarget && event.currentTarget.dataset.downOnBackdrop === '1') closeConfirm(); });
        document.addEventListener('keydown', function (event) {
            trapConfirmFocus(event);
            if (event.key === 'Escape' && !byId('confirm-modal').classList.contains('hidden')) closeConfirm();
        });
        window.addEventListener('beforeunload', function (event) { if (!state.dirty.size) return; event.preventDefault(); event.returnValue = ''; });
    }

    function init() {
        if (!byId('admin-login')) return;
        bindEvents();
        setSidebarCollapsed(sidebarPreference(), false);
        if (!endpoint()) {
            byId('demo-button').classList.remove('hidden');
            byId('login-message').textContent = '尚未連接 Apps Script，可先查看展示介面。';
        }
    }

    window.ADMIN_TESTING = {
        isImageKey: isImageKey, categoryForEntry: categoryForEntry, valuesEqual: valuesEqual,
        containsBrandTerm: containsBrandTerm, allowedDemoKey: allowedDemoKey, buildDemoEntries: buildDemoEntries,
        faqCategoryIndex: faqCategoryIndex, imageCategoryForKey: imageCategoryForKey, imageLocationHint: imageLocationHint,
        isSafeImageUrl: isSafeImageUrl,
        activateFieldContext: activateFieldContext,
        tourRequested: tourRequested,
        taskListResolved: function (list) {
            var store = imageTaskStore();
            var counts = store ? store.summary(list) : { total: 0, pending: 0 };
            return counts.total > 0 && counts.pending === 0;
        },
        filterEntries: function (entries, category, query, dirtyOnly, dirtyKeys, currentValues) {
            var oldCurrent = state.current; state.current = currentValues || {};
            var result = filterEntries(entries, category, query, dirtyOnly, dirtyKeys || new Set());
            state.current = oldCurrent; return result;
        }
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
}());
