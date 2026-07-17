/* global CacheService, ContentService, LockService, PropertiesService, SpreadsheetApp */

const BACKEND = Object.freeze({
  sheetName: '內容資料',
  headerRow: 3,
  dataStartRow: 4,
  columns: Object.freeze({
    section: 1,
    item: 2,
    key: 3,
    value: 4,
    type: 5,
    required: 6,
    guidance: 7,
    updatedAt: 8,
    active: 9,
  }),
  cacheKey: 'rose-farm-public-content-v1',
  cacheSeconds: 60,
});

/**
 * 公開讀取端。前端以 <script src="...?callback=函式名"> 載入 JSONP。
 */
function doGet(e) {
  const callback = String((e && e.parameter && e.parameter.callback) || 'roseFarmCloudCallback');
  if (!isValidCallback_(callback)) {
    return jsonpOutput_('roseFarmCloudCallback', {
      ok: false,
      error: 'callback 名稱不合法。',
    });
  }

  try {
    const cache = CacheService.getScriptCache();
    const cached = cache.get(BACKEND.cacheKey);
    const payload = cached ? JSON.parse(cached) : buildPublicPayload_();
    if (!cached) {
      cache.put(BACKEND.cacheKey, JSON.stringify(payload), BACKEND.cacheSeconds);
    }
    return jsonpOutput_(callback, payload);
  } catch (error) {
    return jsonpOutput_(callback, {
      ok: false,
      error: safeErrorMessage_(error),
    });
  }
}

/**
 * 寫入端。fetch 請使用 Content-Type: text/plain 避免跨網域預檢。
 * 支援 { passcode, key, value } 或 { passcode, updates: [{ key, value }] }。
 */
function doPost(e) {
  try {
    const payload = parsePostBody_(e);
    assertPasscode_(payload.passcode);
    const updates = normalizeUpdates_(payload);
    const result = updateRows_(updates);
    return jsonOutput_({ ok: true, updated: result });
  } catch (error) {
    return jsonOutput_({ ok: false, error: safeErrorMessage_(error) });
  }
}

/**
 * 首次安裝時執行一次，把目前試算表 ID 寫入 Script Properties。
 */
function setupBackend() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    throw new Error('請從「大花農場內容後台」試算表開啟 Apps Script 後再執行。');
  }
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', spreadsheet.getId());
  return { ok: true, spreadsheetId: spreadsheet.getId() };
}

function buildPublicPayload_() {
  const sheet = getContentSheet_();
  const lastRow = sheet.getLastRow();
  const values = {};
  const updatedAt = {};
  const types = {};

  if (lastRow >= BACKEND.dataStartRow) {
    const rowCount = lastRow - BACKEND.dataStartRow + 1;
    const rows = sheet
      .getRange(BACKEND.dataStartRow, 1, rowCount, BACKEND.columns.active)
      .getValues();

    rows.forEach((row) => {
      const key = String(row[BACKEND.columns.key - 1] || '').trim();
      const active = row[BACKEND.columns.active - 1] !== false;
      if (!key || !active) return;
      values[key] = coerceValue_(row[BACKEND.columns.value - 1], row[BACKEND.columns.type - 1]);
      updatedAt[key] = normalizeTimestamp_(row[BACKEND.columns.updatedAt - 1]);
      types[key] = String(row[BACKEND.columns.type - 1] || 'string');
    });
  }

  return {
    ok: true,
    values,
    updatedAt,
    types,
    generatedAt: new Date().toISOString(),
  };
}

function updateRows_(updates) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const sheet = getContentSheet_();
    const lastRow = sheet.getLastRow();
    if (lastRow < BACKEND.dataStartRow) {
      throw new Error('內容資料分頁沒有可更新的資料。');
    }

    const rowCount = lastRow - BACKEND.dataStartRow + 1;
    const rows = sheet
      .getRange(BACKEND.dataStartRow, 1, rowCount, BACKEND.columns.active)
      .getValues();
    const rowByKey = new Map();

    rows.forEach((row, index) => {
      const key = String(row[BACKEND.columns.key - 1] || '').trim();
      if (key) rowByKey.set(key, { row, sheetRow: BACKEND.dataStartRow + index });
    });

    const prepared = updates.map((update) => {
      const key = String(update.key || '').trim();
      if (!isValidKey_(key)) throw new Error(`key 格式不合法：${key}`);
      const found = rowByKey.get(key);
      if (!found) throw new Error(`找不到 key：${key}`);
      if (found.row[BACKEND.columns.active - 1] === false) {
        throw new Error(`此欄位已停用：${key}`);
      }

      const type = String(found.row[BACKEND.columns.type - 1] || 'string');
      const required = String(found.row[BACKEND.columns.required - 1] || '') === '是';
      const value = coerceValue_(update.value, type);
      if (required && isEmptyValue_(value)) {
        throw new Error(`必填欄位不可留空：${key}`);
      }
      return { key, value, sheetRow: found.sheetRow };
    });

    const results = prepared.map((entry) => {
      const timestamp = new Date().toISOString();
      sheet.getRange(entry.sheetRow, BACKEND.columns.value).setValue(entry.value);
      sheet.getRange(entry.sheetRow, BACKEND.columns.updatedAt).setValue(timestamp).setNumberFormat('@');
      return { key: entry.key, updatedAt: timestamp };
    });

    SpreadsheetApp.flush();
    CacheService.getScriptCache().remove(BACKEND.cacheKey);
    return results;
  } finally {
    lock.releaseLock();
  }
}

function getContentSheet_() {
  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = properties.getProperty('SPREADSHEET_ID');
  const spreadsheet = spreadsheetId
    ? SpreadsheetApp.openById(spreadsheetId)
    : SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error('找不到後台試算表，請先執行 setupBackend。');
  const sheet = spreadsheet.getSheetByName(BACKEND.sheetName);
  if (!sheet) throw new Error(`找不到「${BACKEND.sheetName}」分頁。`);
  return sheet;
}

function parsePostBody_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('沒有收到 POST 資料。');
  }
  try {
    return JSON.parse(e.postData.contents);
  } catch (error) {
    throw new Error('POST 內容不是有效的 JSON。');
  }
}

function normalizeUpdates_(payload) {
  const raw = Array.isArray(payload.updates)
    ? payload.updates
    : [{ key: payload.key, value: payload.value }];
  if (!raw.length) throw new Error('沒有可更新的欄位。');
  if (raw.length > 50) throw new Error('單次最多更新 50 個欄位。');
  return raw;
}

function assertPasscode_(provided) {
  const expected = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSCODE');
  if (!expected) throw new Error('尚未設定後台通行碼。');
  if (String(provided || '') !== expected) throw new Error('後台通行碼錯誤。');
}

function coerceValue_(value, type) {
  if (type === 'number') {
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) throw new Error(`不是有效數字：${value}`);
    return numberValue;
  }
  if (type === 'boolean') {
    if (value === true || value === 'true' || value === 1 || value === '1') return true;
    if (value === false || value === 'false' || value === 0 || value === '0') return false;
    throw new Error(`不是有效布林值：${value}`);
  }
  return value == null ? '' : String(value);
}

function normalizeTimestamp_(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString();
  return String(value || '');
}

function isEmptyValue_(value) {
  return value == null || (typeof value === 'string' && value.trim() === '');
}

function isValidKey_(key) {
  return /^[A-Za-z][A-Za-z0-9]*(?:\.[A-Za-z0-9_-]+)*$/.test(key);
}

function isValidCallback_(callback) {
  return /^[A-Za-z_$][0-9A-Za-z_$]*(?:\.[A-Za-z_$][0-9A-Za-z_$]*)*$/.test(callback);
}

function jsonpOutput_(callback, payload) {
  return ContentService
    .createTextOutput(`${callback}(${JSON.stringify(payload)});`)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function jsonOutput_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function safeErrorMessage_(error) {
  return error && error.message ? String(error.message) : '發生未知錯誤。';
}
