/* global CacheService, ContentService, LockService, PropertiesService, ScriptApp, SpreadsheetApp */

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

const EDITOR = Object.freeze({
  sheetName: '後台編輯',
  categoryCell: 'B5',
  itemCell: 'B7',
  currentCell: 'B9',
  newValueCell: 'B13',
  guidanceCell: 'B18',
  updatedAtCell: 'B21',
  statusCell: 'D21',
  confirmCell: 'B23',
  publishCell: 'D23',
  keyCell: 'H2',
  rowCell: 'H3',
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
  installEditorTrigger_(spreadsheet);
  refreshEditorUi(spreadsheet);
  updateControlStatus_(spreadsheet, '已初始化\n待部署網站連線');
  return { ok: true, spreadsheetId: spreadsheet.getId() };
}

function installEditorTrigger_(spreadsheet) {
  const handler = 'handleEditorEdit';
  ScriptApp.getProjectTriggers()
    .filter((trigger) => trigger.getHandlerFunction() === handler)
    .forEach((trigger) => ScriptApp.deleteTrigger(trigger));
  ScriptApp.newTrigger(handler).forSpreadsheet(spreadsheet).onEdit().create();
}

/**
 * 開啟試算表時顯示簡單的後台選單。
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🌹 內容後台')
    .addItem('重新整理編輯面板', 'refreshEditorUi')
    .addItem('開啟編輯面板', 'openEditorSheet')
    .addToUi();
}

function openEditorSheet() {
  const spreadsheet = getBackendSpreadsheet_();
  const editor = spreadsheet.getSheetByName(EDITOR.sheetName);
  if (!editor) throw new Error(`找不到「${EDITOR.sheetName}」分頁。`);
  spreadsheet.setActiveSheet(editor);
}

/**
 * Sheet 編輯事件：處理單筆 UI 發布，也維護內容資料的 updatedAt 與快取。
 */
function handleEditorEdit(e) {
  if (!e || !e.range) return;
  const sheet = e.range.getSheet();
  const spreadsheet = e.source || sheet.getParent();
  const sheetName = sheet.getName();

  if (
    sheetName === BACKEND.sheetName
    && e.range.getColumn() <= BACKEND.columns.value
    && e.range.getLastColumn() >= BACKEND.columns.value
    && e.range.getLastRow() >= BACKEND.dataStartRow
  ) {
    const firstRow = Math.max(e.range.getRow(), BACKEND.dataStartRow);
    const rowCount = e.range.getLastRow() - firstRow + 1;
    const timestamp = new Date().toISOString();
    sheet.getRange(firstRow, BACKEND.columns.updatedAt, rowCount, 1)
      .setValues(Array.from({ length: rowCount }, () => [timestamp]))
      .setNumberFormat('@');
    CacheService.getScriptCache().remove(BACKEND.cacheKey);
    return;
  }

  if (sheetName !== EDITOR.sheetName) return;
  if (rangeContainsCell_(e.range, 5, 2)) {
    refreshEditorItems_(spreadsheet);
  } else if (rangeContainsCell_(e.range, 7, 2)) {
    loadEditorSelection_(spreadsheet);
  } else if (rangeContainsCell_(e.range, 13, 2)) {
    sheet.getRange(EDITOR.statusCell).setValue('尚未發布');
  } else if (rangeContainsCell_(e.range, 23, 4) && e.value === 'TRUE') {
    publishEditorValue_(spreadsheet);
  }
}

function rangeContainsCell_(range, row, column) {
  return range.getRow() <= row
    && range.getLastRow() >= row
    && range.getColumn() <= column
    && range.getLastColumn() >= column;
}

function refreshEditorUi(spreadsheetOverride) {
  const spreadsheet = spreadsheetOverride || getBackendSpreadsheet_();
  const editor = spreadsheet.getSheetByName(EDITOR.sheetName);
  if (!editor) throw new Error(`找不到「${EDITOR.sheetName}」分頁。`);
  const rows = getContentRows_(spreadsheet);
  const categories = [...new Set(rows.map((entry) => entry.section).filter(Boolean))];
  if (!categories.length) throw new Error('內容資料沒有可編輯的分類。');

  const categoryRange = editor.getRange(EDITOR.categoryCell);
  categoryRange.setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(categories, true)
      .setAllowInvalid(false)
      .build(),
  );
  if (!categories.includes(String(categoryRange.getValue() || ''))) {
    categoryRange.setValue(categories[0]);
  }
  refreshEditorItems_(spreadsheet);
}

function refreshEditorItems_(spreadsheetOverride) {
  const spreadsheet = spreadsheetOverride || getBackendSpreadsheet_();
  const editor = spreadsheet.getSheetByName(EDITOR.sheetName);
  const category = String(editor.getRange(EDITOR.categoryCell).getValue() || '');
  const items = getContentRows_(spreadsheet).filter((entry) => entry.section === category);
  if (!items.length) {
    editor.getRange(EDITOR.itemCell).clearContent().clearDataValidations();
    clearEditorFields_(editor, '此分類目前沒有資料');
    return;
  }

  const labels = items.map((entry) => entry.editorLabel);
  const itemRange = editor.getRange(EDITOR.itemCell);
  itemRange.setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(labels, true)
      .setAllowInvalid(false)
      .build(),
  );
  if (!labels.includes(String(itemRange.getValue() || ''))) {
    itemRange.setValue(labels[0]);
  }
  loadEditorSelection_(spreadsheet);
}

function loadEditorSelection_(spreadsheetOverride) {
  const spreadsheet = spreadsheetOverride || getBackendSpreadsheet_();
  const editor = spreadsheet.getSheetByName(EDITOR.sheetName);
  const category = String(editor.getRange(EDITOR.categoryCell).getValue() || '');
  const label = String(editor.getRange(EDITOR.itemCell).getValue() || '');
  const entry = getContentRows_(spreadsheet).find(
    (candidate) => candidate.section === category && candidate.editorLabel === label,
  );
  if (!entry) {
    clearEditorFields_(editor, '找不到所選項目');
    return;
  }

  editor.getRange(EDITOR.currentCell).setValue(entry.value);
  editor.getRange(EDITOR.newValueCell).setValue(entry.value);
  editor.getRange(EDITOR.guidanceCell).setValue(entry.guidance || '請依網站實際內容填寫。');
  editor.getRange(EDITOR.updatedAtCell).setValue(entry.updatedAt || '尚無紀錄');
  editor.getRange(EDITOR.statusCell).setValue('尚未修改');
  editor.getRange(EDITOR.confirmCell).setValue(false);
  editor.getRange(EDITOR.publishCell).setValue(false);
  editor.getRange(EDITOR.keyCell).setValue(entry.key);
  editor.getRange(EDITOR.rowCell).setValue(entry.sheetRow);
}

function publishEditorValue_(spreadsheetOverride) {
  let editor = null;
  let publishRange = null;
  const lock = LockService.getScriptLock();
  let locked = false;
  try {
    lock.waitLock(10000);
    locked = true;
    const spreadsheet = spreadsheetOverride || getBackendSpreadsheet_();
    editor = spreadsheet.getSheetByName(EDITOR.sheetName);
    if (!editor) throw new Error(`找不到「${EDITOR.sheetName}」分頁。`);
    publishRange = editor.getRange(EDITOR.publishCell);
    if (editor.getRange(EDITOR.confirmCell).getValue() !== true) {
      throw new Error('請先勾選「我已確認內容」。');
    }

    const key = String(editor.getRange(EDITOR.keyCell).getValue() || '').trim();
    const sheetRow = Number(editor.getRange(EDITOR.rowCell).getValue());
    if (!isValidKey_(key) || !Number.isInteger(sheetRow)) {
      throw new Error('編輯項目資料不完整，請重新整理編輯面板。');
    }

    const contentSheet = getContentSheet_(spreadsheet);
    const row = contentSheet
      .getRange(sheetRow, 1, 1, BACKEND.columns.active)
      .getValues()[0];
    if (String(row[BACKEND.columns.key - 1] || '').trim() !== key) {
      throw new Error('資料列已變動，請重新選擇編輯項目。');
    }
    if (row[BACKEND.columns.active - 1] !== true) {
      throw new Error('此項目已停用，無法發布。');
    }

    const rawValue = editor.getRange(EDITOR.newValueCell).getValue();
    const required = String(row[BACKEND.columns.required - 1] || '') === '是';
    if (required && isRawEmptyValue_(rawValue)) {
      throw new Error('必填內容不可留空。');
    }
    if (/有機|organic/i.test(String(rawValue || ''))) {
      throw new Error('內容包含「有機／Organic」，請先交由 Shao 核決。');
    }

    const type = String(row[BACKEND.columns.type - 1] || 'string');
    const value = coerceValue_(rawValue, type);
    const timestamp = new Date().toISOString();
    contentSheet.getRange(sheetRow, BACKEND.columns.value).setValue(value);
    contentSheet.getRange(sheetRow, BACKEND.columns.updatedAt).setValue(timestamp).setNumberFormat('@');
    SpreadsheetApp.flush();
    CacheService.getScriptCache().remove(BACKEND.cacheKey);

    editor.getRange(EDITOR.currentCell).setValue(value);
    editor.getRange(EDITOR.newValueCell).setValue(value);
    editor.getRange(EDITOR.updatedAtCell).setValue(timestamp);
    editor.getRange(EDITOR.statusCell).setValue('已儲存到 Sheet ✓');
    editor.getRange(EDITOR.confirmCell).setValue(false);
  } catch (error) {
    if (editor) editor.getRange(EDITOR.statusCell).setValue(safeErrorMessage_(error));
  } finally {
    if (publishRange) publishRange.setValue(false);
    if (locked) lock.releaseLock();
  }
}

function getBackendSpreadsheet_() {
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  return spreadsheetId ? SpreadsheetApp.openById(spreadsheetId) : null;
}

function getContentRows_(spreadsheetOverride) {
  const sheet = getContentSheet_(spreadsheetOverride);
  const lastRow = sheet.getLastRow();
  if (lastRow < BACKEND.dataStartRow) return [];
  return sheet
    .getRange(
      BACKEND.dataStartRow,
      1,
      lastRow - BACKEND.dataStartRow + 1,
      BACKEND.columns.active,
    )
    .getValues()
    .map((row, index) => ({
      section: String(row[BACKEND.columns.section - 1] || '').trim(),
      item: String(row[BACKEND.columns.item - 1] || '').trim(),
      key: String(row[BACKEND.columns.key - 1] || '').trim(),
      value: row[BACKEND.columns.value - 1],
      guidance: String(row[BACKEND.columns.guidance - 1] || ''),
      updatedAt: normalizeTimestamp_(row[BACKEND.columns.updatedAt - 1]),
      active: row[BACKEND.columns.active - 1] === true,
      sheetRow: BACKEND.dataStartRow + index,
    }))
    .filter((entry) => entry.key && entry.active)
    .map((entry) => ({ ...entry, editorLabel: makeEditorLabel_(entry) }));
}

function makeEditorLabel_(entry) {
  const key = entry.key;
  const rowsMatch = key.match(/\.rows\.(\d+)\.(label|value|note)$/);
  if (rowsMatch) {
    const names = { label: '標籤', value: '內容', note: '補充' };
    return `${entry.item}｜表格第 ${Number(rowsMatch[1]) + 1} 列・${names[rowsMatch[2]]}`;
  }
  const factsMatch = key.match(/\.facts\.(\d+)$/);
  if (factsMatch) return `${entry.item}｜重點 ${Number(factsMatch[1]) + 1}`;

  const field = key.split('.').pop();
  const names = {
    homeUrl: '官網網址', phone: '聯絡電話', shopPhone: '展售室手機',
    enabled: '是否顯示', text: '內容', full: '全票', fullDiscount: '全票折抵',
    half: '半票', halfDiscount: '半票折抵', freeRule: '免票規則', time: '營業時間',
    note: '補充說明', price: '價格', subPrice: '價格單位', name: '名稱',
    tag: '時長', group: '成團人數', image: '圖片網址', title: '標題',
    q: '問題', a: '答案',
  };
  return `${entry.item}｜${names[field] || field}`;
}

function clearEditorFields_(editor, status) {
  [EDITOR.currentCell, EDITOR.newValueCell, EDITOR.guidanceCell, EDITOR.updatedAtCell,
    EDITOR.keyCell, EDITOR.rowCell].forEach((cell) => editor.getRange(cell).clearContent());
  editor.getRange(EDITOR.statusCell).setValue(status);
  editor.getRange(EDITOR.confirmCell).setValue(false);
  editor.getRange(EDITOR.publishCell).setValue(false);
}

function updateControlStatus_(spreadsheet, status) {
  const control = spreadsheet.getSheetByName('控制台');
  if (!control) return;
  control.getRange('A3').setValue('平常從「後台編輯」選擇分類與項目，一次修改一個欄位');
  control.getRange('E10').setValue(status);
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
      if (required && isRawEmptyValue_(update.value)) {
        throw new Error(`必填欄位不可留空：${key}`);
      }
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

function getContentSheet_(spreadsheetOverride) {
  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = properties.getProperty('SPREADSHEET_ID');
  const spreadsheet = spreadsheetOverride
    || SpreadsheetApp.getActiveSpreadsheet()
    || (spreadsheetId ? SpreadsheetApp.openById(spreadsheetId) : null);
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

function isRawEmptyValue_(value) {
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
