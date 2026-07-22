/* ============================================
   image-tasks.js：圖片修改任務清單資料層
   僅保存非機密的欄位 key、顯示資訊與處理狀態。
   ============================================ */
(function (root) {
    'use strict';

    var STORAGE_KEY = 'roseFarmImageTaskList';
    var VERSION = 1;
    var STALE_AFTER_MS = 24 * 60 * 60 * 1000;
    var VALID_STATUSES = { pending: true, done: true, skipped: true };

    function isoNow(now) {
        return new Date(now()).toISOString();
    }

    function emptyList(now) {
        return { version: VERSION, createdAt: isoNow(now), items: [] };
    }

    function cleanText(value, fallback) {
        var text = String(value == null ? '' : value).trim();
        return text || fallback || '';
    }

    function normalizeItem(item, index, now) {
        if (!item || !cleanText(item.key)) return null;
        return {
            key: cleanText(item.key),
            label: cleanText(item.label, '網站圖片'),
            locationHint: cleanText(item.locationHint, '網站圖片'),
            addedAt: isFinite(Date.parse(item.addedAt)) ? new Date(item.addedAt).toISOString() : isoNow(now),
            order: index,
            status: VALID_STATUSES[item.status] ? item.status : 'pending'
        };
    }

    function normalizeList(value, now) {
        if (!value || Number(value.version) !== VERSION || !Array.isArray(value.items)) return emptyList(now);
        var seen = Object.create(null);
        var source = value.items.slice().sort(function (left, right) {
            var leftOrder = Number.isFinite(Number(left && left.order)) ? Number(left.order) : Number.MAX_SAFE_INTEGER;
            var rightOrder = Number.isFinite(Number(right && right.order)) ? Number(right.order) : Number.MAX_SAFE_INTEGER;
            return leftOrder - rightOrder;
        });
        var items = [];
        source.forEach(function (item) {
            var normalized = normalizeItem(item, items.length, now);
            if (!normalized || seen[normalized.key]) return;
            seen[normalized.key] = true;
            normalized.order = items.length;
            items.push(normalized);
        });
        return {
            version: VERSION,
            createdAt: isFinite(Date.parse(value.createdAt)) ? new Date(value.createdAt).toISOString() : isoNow(now),
            items: items
        };
    }

    function createStore(storage, nowOverride) {
        var now = typeof nowOverride === 'function' ? nowOverride : Date.now;
        var availability;

        function available() {
            if (availability != null) return availability;
            if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function') {
                availability = false;
                return availability;
            }
            try {
                var probe = STORAGE_KEY + ':probe';
                storage.setItem(probe, '1');
                storage.removeItem(probe);
                availability = true;
            } catch (error) {
                availability = false;
            }
            return availability;
        }

        function load() {
            if (!available()) return emptyList(now);
            try {
                var raw = storage.getItem(STORAGE_KEY);
                return raw ? normalizeList(JSON.parse(raw), now) : emptyList(now);
            } catch (error) {
                return emptyList(now);
            }
        }

        function save(list) {
            var normalized = normalizeList(list, now);
            if (!available()) return { ok: false, list: normalized };
            try {
                storage.setItem(STORAGE_KEY, JSON.stringify(normalized));
                return { ok: true, list: normalized };
            } catch (error) {
                availability = false;
                return { ok: false, list: normalized };
            }
        }

        function add(item) {
            var list = load();
            var key = cleanText(item && item.key);
            if (!key) return { ok: false, added: false, list: list };
            if (list.items.some(function (candidate) { return candidate.key === key; })) {
                return { ok: available(), added: false, list: list };
            }
            var normalized = normalizeItem(item, list.items.length, now);
            list.items.push(normalized);
            var result = save(list);
            return { ok: result.ok, added: result.ok, list: result.list };
        }

        function remove(key) {
            var list = load();
            var nextItems = list.items.filter(function (item) { return item.key !== key; });
            if (nextItems.length === list.items.length) return { ok: available(), removed: false, list: list };
            list.items = nextItems;
            var result = save(list);
            return { ok: result.ok, removed: result.ok, list: result.list };
        }

        function toggle(item) {
            var key = cleanText(item && item.key);
            var list = load();
            var exists = list.items.some(function (candidate) { return candidate.key === key; });
            if (exists) {
                var removed = remove(key);
                return { ok: removed.ok, added: false, removed: removed.removed, list: removed.list };
            }
            return add(item);
        }

        function setStatus(key, status) {
            var list = load();
            var item = list.items.find(function (candidate) { return candidate.key === key; });
            if (!item) return { ok: available(), changed: false, list: list };
            var nextStatus = VALID_STATUSES[status] ? status : 'pending';
            if (item.status === nextStatus) return { ok: available(), changed: false, list: list };
            item.status = nextStatus;
            var result = save(list);
            return { ok: result.ok, changed: result.ok, list: result.list };
        }

        function clear() {
            if (!available()) return false;
            try {
                storage.removeItem(STORAGE_KEY);
                return true;
            } catch (error) {
                availability = false;
                return false;
            }
        }

        function isStale(list) {
            var createdAt = Date.parse((list || load()).createdAt);
            return isFinite(createdAt) && now() - createdAt > STALE_AFTER_MS;
        }

        function summary(list) {
            var counts = { total: 0, pending: 0, done: 0, skipped: 0 };
            (list || load()).items.forEach(function (item) {
                counts.total += 1;
                counts[VALID_STATUSES[item.status] ? item.status : 'pending'] += 1;
            });
            return counts;
        }

        function nextPendingIndex(list, startIndex) {
            var items = (list || load()).items;
            if (!items.length) return -1;
            var start = Math.max(0, Number(startIndex) || 0);
            for (var offset = 0; offset < items.length; offset += 1) {
                var index = (start + offset) % items.length;
                if (items[index].status === 'pending') return index;
            }
            return -1;
        }

        return {
            available: available,
            load: load,
            save: save,
            add: add,
            remove: remove,
            toggle: toggle,
            setStatus: setStatus,
            clear: clear,
            isStale: isStale,
            summary: summary,
            nextPendingIndex: nextPendingIndex
        };
    }

    function browserStorage() {
        try { return root.localStorage; } catch (error) { return null; }
    }

    var store = createStore(browserStorage());
    root.RoseFarmImageTasks = Object.assign(store, {
        STORAGE_KEY: STORAGE_KEY,
        VERSION: VERSION,
        STALE_AFTER_MS: STALE_AFTER_MS,
        createStore: createStore,
        normalizeList: function (value) { return normalizeList(value, Date.now); }
    });
}(window));
