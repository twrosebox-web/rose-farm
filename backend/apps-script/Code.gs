/* global CacheService, ContentService, HtmlService, LockService, PropertiesService, ScriptApp, SpreadsheetApp, Utilities */

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
  sheetName: '批次編輯',
  statusCell: 'B3',
  refreshCell: 'B4',
  publishCell: 'B5',
  dataStartRow: 7,
  columns: Object.freeze({
    label: 1,
    value: 2,
    key: 3,
    sourceRow: 4,
    type: 5,
    required: 6,
    active: 7,
  }),
});

const PREVIEW = Object.freeze({
  pageUrl: 'https://twrosebox-web.github.io/rose-farm/',
  cachePrefix: 'rose-farm-draft-preview-',
  tokenSeconds: 600,
});

/**
 * 公開讀取端。前端以 <script src="...?callback=函式名"> 載入 JSONP。
 */
function doGet(e) {
  const action = String((e && e.parameter && e.parameter.action) || '').trim().toLowerCase();
  if (action === 'preview') return previewRedirectOutput_();

  const callback = String((e && e.parameter && e.parameter.callback) || 'roseFarmCloudCallback');
  const mode = String((e && e.parameter && e.parameter.mode) || '').trim().toLowerCase();
  if (!isValidCallback_(callback)) {
    return jsonpOutput_('roseFarmCloudCallback', {
      ok: false,
      error: 'callback 名稱不合法。',
    });
  }

  try {
    if (mode === 'draft') {
      assertDraftPreviewToken_(e && e.parameter && e.parameter.token);
      return jsonpOutput_(callback, buildDraftPayload_());
    }
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

function createDraftPreviewUrl_() {
  const token = Utilities.getUuid();
  CacheService.getScriptCache().put(`${PREVIEW.cachePrefix}${token}`, '1', PREVIEW.tokenSeconds);
  return `${PREVIEW.pageUrl}?preview=draft&token=${encodeURIComponent(token)}`;
}

function assertDraftPreviewToken_(token) {
  const safeToken = String(token || '').trim();
  if (!safeToken || !CacheService.getScriptCache().get(`${PREVIEW.cachePrefix}${safeToken}`)) {
    throw new Error('草稿預覽連結已失效，請回到後台重新開啟。');
  }
}

function previewRedirectOutput_() {
  const url = createDraftPreviewUrl_();
  return HtmlService.createHtmlOutput(
    `<meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${url}">`
      + `<p>正在開啟草稿預覽……若沒有自動跳轉，<a href="${url}">請點這裡</a>。</p>`,
  ).setTitle('大花農場草稿預覽');
}

/**
 * 草稿預覽端：只讀取「批次編輯」黃色欄位，不寫入正式內容資料。
 */
function buildDraftPayload_(spreadsheetOverride) {
  const spreadsheet = spreadsheetOverride || getBackendSpreadsheet_();
  if (!spreadsheet) throw new Error('找不到後台試算表。');
  const editor = spreadsheet.getSheetByName(EDITOR.sheetName);
  if (!editor) throw new Error(`找不到「${EDITOR.sheetName}」分頁。`);

  const lastRow = editor.getLastRow();
  if (lastRow < EDITOR.dataStartRow) {
    throw new Error('批次編輯分頁沒有可預覽的內容。');
  }

  const rowCount = lastRow - EDITOR.dataStartRow + 1;
  const rows = editor.getRange(
    EDITOR.dataStartRow,
    EDITOR.columns.value,
    rowCount,
    EDITOR.columns.active - EDITOR.columns.value + 1,
  ).getValues();
  const values = {};
  const types = {};
  const updatedAt = {};
  const editorRows = {};
  const previewTime = new Date().toISOString();

  rows.forEach((row, rowIndex) => {
    const rawValue = row[EDITOR.columns.value - EDITOR.columns.value];
    const key = String(row[EDITOR.columns.key - EDITOR.columns.value] || '').trim();
    const type = String(row[EDITOR.columns.type - EDITOR.columns.value] || 'string');
    const active = row[EDITOR.columns.active - EDITOR.columns.value] === true;
    if (!key || !active || !isValidKey_(key)) return;

    try {
      values[key] = coerceValue_(rawValue, type);
    } catch (error) {
      values[key] = rawValue == null ? '' : String(rawValue);
    }
    types[key] = type;
    updatedAt[key] = previewTime;
    editorRows[key] = EDITOR.dataStartRow + rowIndex;
  });

  return {
    ok: true,
    mode: 'draft',
    values,
    types,
    updatedAt,
    editorRows,
    editorSheetId: editor.getSheetId(),
    generatedAt: previewTime,
  };
}

/**
 * 寫入端。fetch 請使用 Content-Type: text/plain 避免跨網域預檢。
 * 支援 { passcode, key, value } 或 { passcode, updates: [{ key, value }] }。
 */
function doPost(e) {
  try {
    const payload = parsePostBody_(e);
    assertPasscode_(payload.passcode);
    const action = String(payload.action || '').trim().toLowerCase();
    if (action === 'admin_load') {
      return jsonOutput_({ ok: true, ...buildAdminPayload_() });
    }
    if (action === 'draft_save') {
      const updates = normalizeUpdates_(payload);
      return jsonOutput_({
        ok: true,
        ...saveAdminDraft_(updates, payload.brandConfirmed === true),
      });
    }
    if (action === 'preview_url') {
      return jsonOutput_({ ok: true, url: createDraftPreviewUrl_(), expiresIn: PREVIEW.tokenSeconds });
    }
    if (action === 'publish_draft') {
      return jsonOutput_({
        ok: true,
        ...publishBatchEditor_(null, true, payload.brandConfirmed === true),
      });
    }
    const updates = normalizeUpdates_(payload);
    const result = updateRows_(updates);
    return jsonOutput_({ ok: true, updated: result });
  } catch (error) {
    return jsonOutput_({ ok: false, error: safeErrorMessage_(error) });
  }
}

/**
 * admin.html 登入後載入：正式值、批次編輯草稿值與欄位說明。
 */
function buildAdminPayload_(spreadsheetOverride) {
  const spreadsheet = spreadsheetOverride || getBackendSpreadsheet_();
  if (!spreadsheet) throw new Error('找不到後台試算表。');
  const entries = getContentRows_(spreadsheet);
  const draftByKey = getEditorDraftByKey_(spreadsheet);
  return {
    entries: entries.map((entry) => ({
      section: entry.section,
      item: entry.item,
      key: entry.key,
      label: entry.editorLabel,
      value: entry.value,
      draftValue: draftByKey.has(entry.key) ? draftByKey.get(entry.key).value : entry.value,
      type: entry.type,
      required: entry.required,
      guidance: entry.guidance,
      updatedAt: entry.updatedAt,
      editorRow: draftByKey.has(entry.key) ? draftByKey.get(entry.key).row : null,
    })),
    generatedAt: new Date().toISOString(),
  };
}

function getEditorDraftByKey_(spreadsheet) {
  const editor = spreadsheet.getSheetByName(EDITOR.sheetName);
  if (!editor) throw new Error(`找不到「${EDITOR.sheetName}」分頁。`);
  const lastRow = editor.getLastRow();
  const result = new Map();
  if (lastRow < EDITOR.dataStartRow) return result;
  const rowCount = lastRow - EDITOR.dataStartRow + 1;
  const rows = editor.getRange(
    EDITOR.dataStartRow,
    EDITOR.columns.value,
    rowCount,
    EDITOR.columns.active - EDITOR.columns.value + 1,
  ).getValues();
  rows.forEach((row, index) => {
    const key = String(row[EDITOR.columns.key - EDITOR.columns.value] || '').trim();
    const active = row[EDITOR.columns.active - EDITOR.columns.value] === true;
    if (!key || !active) return;
    result.set(key, {
      value: row[EDITOR.columns.value - EDITOR.columns.value],
      row: EDITOR.dataStartRow + index,
    });
  });
  return result;
}

/**
 * admin.html 的「儲存草稿」：只寫批次編輯 B 欄，不發布正式內容。
 */
function saveAdminDraft_(updates, brandConfirmed, spreadsheetOverride) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const spreadsheet = spreadsheetOverride || getBackendSpreadsheet_();
    if (!spreadsheet) throw new Error('找不到後台試算表。');
    const editor = spreadsheet.getSheetByName(EDITOR.sheetName);
    if (!editor) throw new Error(`找不到「${EDITOR.sheetName}」分頁。`);
    const contentSheet = getContentSheet_(spreadsheet);
    const contentRowCount = contentSheet.getLastRow() - BACKEND.dataStartRow + 1;
    if (contentRowCount < 1) throw new Error('內容資料沒有可更新的欄位。');
    const contentRows = contentSheet
      .getRange(BACKEND.dataStartRow, 1, contentRowCount, BACKEND.columns.active)
      .getValues();
    const contentByKey = new Map();
    contentRows.forEach((row) => {
      const key = String(row[BACKEND.columns.key - 1] || '').trim();
      if (key) contentByKey.set(key, row);
    });

    const editorRowCount = editor.getLastRow() - EDITOR.dataStartRow + 1;
    if (editorRowCount < 1) throw new Error('批次編輯頁沒有欄位。');
    const editorRows = editor.getRange(
      EDITOR.dataStartRow,
      EDITOR.columns.value,
      editorRowCount,
      EDITOR.columns.active - EDITOR.columns.value + 1,
    ).getValues();
    const editorIndexByKey = new Map();
    editorRows.forEach((row, index) => {
      const key = String(row[EDITOR.columns.key - EDITOR.columns.value] || '').trim();
      const active = row[EDITOR.columns.active - EDITOR.columns.value] === true;
      if (key && active) editorIndexByKey.set(key, index);
      const contentRow = contentByKey.get(key);
      if (contentRow) contentRow[BACKEND.columns.value - 1] = row[0];
    });

    const prepared = updates.map((update) => {
      const key = String(update.key || '').trim();
      if (!isValidKey_(key)) throw new Error(`key 格式不合法：${key}`);
      const contentRow = contentByKey.get(key);
      const editorIndex = editorIndexByKey.get(key);
      if (!contentRow || editorIndex == null) throw new Error(`找不到可編輯欄位：${key}`);
      const type = String(contentRow[BACKEND.columns.type - 1] || 'string');
      const required = String(contentRow[BACKEND.columns.required - 1] || '') === '是';
      if (required && isRawEmptyValue_(update.value)) throw new Error(`必填欄位不可留空：${key}`);
      const value = coerceValue_(update.value, type);
      if (/有機|organic/i.test(String(value || '')) && !brandConfirmed) {
        throw new Error(`BRAND_CONFIRM_REQUIRED：內容包含「有機／Organic」，請確認已由 Shao 核決：${key}`);
      }
      if (isImageKey_(key) && !isRawEmptyValue_(value) && !/^https:\/\//i.test(String(value))) {
        throw new Error(`圖片網址必須以 https:// 開頭：${key}`);
      }
      return { key, value, editorIndex };
    });

    prepared.forEach((entry) => {
      editorRows[entry.editorIndex][0] = entry.value;
      contentByKey.get(entry.key)[BACKEND.columns.value - 1] = entry.value;
    });
    validateDiyGroups_(contentRows);
    validateImageUrls_(contentRows);

    editor.getRange(EDITOR.dataStartRow, EDITOR.columns.value, editorRowCount, 1)
      .setValues(editorRows.map((row) => [row[0]]));
    editor.getRange(EDITOR.statusCell).setValue(`已儲存 ${prepared.length} 項草稿，尚未發布`);
    SpreadsheetApp.flush();
    return {
      savedCount: prepared.length,
      savedAt: new Date().toISOString(),
      keys: prepared.map((entry) => entry.key),
    };
  } finally {
    lock.releaseLock();
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
    .addItem('重新載入全部內容', 'refreshEditorUi')
    .addItem('開啟批次編輯', 'openEditorSheet')
    .addItem('預覽尚未發布的修改', 'showDraftPreview')
    .addToUi();
}

function showDraftPreview() {
  const serviceUrl = ScriptApp.getService().getUrl();
  if (!serviceUrl) throw new Error('請先將 Apps Script 部署為網頁應用程式。');
  const url = `${serviceUrl}?action=preview`;
  const html = HtmlService.createHtmlOutput(
    `<div style="font-family:sans-serif;padding:20px;line-height:1.7">`
      + `<p>預覽連結每次開啟後 10 分鐘內有效，不會發布內容。</p>`
      + `<p><a href="${url}" target="_blank" style="display:inline-block;background:#356f80;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:bold">👁 開啟草稿預覽</a></p>`
      + `</div>`,
  ).setWidth(420).setHeight(180);
  SpreadsheetApp.getUi().showModalDialog(html, '預覽尚未發布的修改');
}

function openEditorSheet() {
  const spreadsheet = getBackendSpreadsheet_();
  const editor = spreadsheet.getSheetByName(EDITOR.sheetName);
  if (!editor) throw new Error(`找不到「${EDITOR.sheetName}」分頁。`);
  spreadsheet.setActiveSheet(editor);
}

/**
 * Sheet 編輯事件：批次頁只在按下「重新載入」或「儲存全部」時執行重工作業。
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
  if (rangeContainsCell_(e.range, 4, EDITOR.columns.value) && e.value === 'TRUE') {
    refreshEditorUi(spreadsheet);
    return;
  }
  if (rangeContainsCell_(e.range, 5, EDITOR.columns.value) && e.value === 'TRUE') {
    publishBatchEditor_(spreadsheet);
    return;
  }
  if (
    e.range.getColumn() <= EDITOR.columns.value
    && e.range.getLastColumn() >= EDITOR.columns.value
    && e.range.getLastRow() >= EDITOR.dataStartRow
  ) {
    sheet.getRange(EDITOR.statusCell).setValue('有未儲存的變更');
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

  const entries = getContentRows_(spreadsheet);
  const entryByKey = new Map(entries.map((entry) => [entry.key, entry]));
  const lastRow = editor.getLastRow();
  const rowCount = Math.max(0, lastRow - EDITOR.dataStartRow + 1);
  if (!rowCount) throw new Error('批次編輯頁沒有欄位對照資料。');

  const keyValues = editor
    .getRange(EDITOR.dataStartRow, EDITOR.columns.key, rowCount, 1)
    .getValues();
  const editorValues = editor
    .getRange(EDITOR.dataStartRow, EDITOR.columns.value, rowCount, 1)
    .getValues();

  keyValues.forEach((row, index) => {
    const key = String(row[0] || '').trim();
    if (key && entryByKey.has(key)) editorValues[index][0] = entryByKey.get(key).value;
  });
  editor.getRange(EDITOR.dataStartRow, EDITOR.columns.value, rowCount, 1).setValues(editorValues);
  editor.getRange(EDITOR.refreshCell).setValue(false);
  editor.getRange(EDITOR.publishCell).setValue(false);
  editor.getRange(EDITOR.statusCell).setValue(`已載入 ${entries.length} 個欄位`);
  updateDraftPreviewLinks_(spreadsheet);
}

function updateDraftPreviewLinks_(spreadsheet) {
  const serviceUrl = ScriptApp.getService().getUrl();
  if (!serviceUrl) return;
  const formula = `=HYPERLINK("${serviceUrl}?action=preview","👁 預覽尚未發布的修改")`;
  const editor = spreadsheet.getSheetByName(EDITOR.sheetName);
  if (editor) editor.getRange('A6').setFormula(formula);
  const control = spreadsheet.getSheetByName('控制台');
  if (control) control.getRange('A20').setFormula(formula);
}

function publishBatchEditor_(spreadsheetOverride, throwOnError, brandConfirmed) {
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

    const contentSheet = getContentSheet_(spreadsheet);
    const contentLastRow = contentSheet.getLastRow();
    const contentRowCount = contentLastRow - BACKEND.dataStartRow + 1;
    if (contentRowCount < 1) throw new Error('內容資料沒有可更新的欄位。');
    const contentRows = contentSheet
      .getRange(BACKEND.dataStartRow, 1, contentRowCount, BACKEND.columns.active)
      .getValues();
    const contentByKey = new Map();
    contentRows.forEach((row) => {
      const key = String(row[BACKEND.columns.key - 1] || '').trim();
      if (!key) return;
      if (contentByKey.has(key)) throw new Error(`內容資料出現重複 key：${key}`);
      contentByKey.set(key, row);
    });

    const editorRowCount = editor.getLastRow() - EDITOR.dataStartRow + 1;
    const editorRows = editor
      .getRange(
        EDITOR.dataStartRow,
        EDITOR.columns.value,
        editorRowCount,
        EDITOR.columns.active - EDITOR.columns.value + 1,
      )
      .getValues();
    const timestamp = new Date().toISOString();
    let changedCount = 0;

    editorRows.forEach((editorRow) => {
      const rawValue = editorRow[EDITOR.columns.value - EDITOR.columns.value];
      const key = String(editorRow[EDITOR.columns.key - EDITOR.columns.value] || '').trim();
      if (!key) return;
      const contentRow = contentByKey.get(key);
      if (!contentRow) throw new Error(`內容資料找不到 key：${key}`);
      const type = String(contentRow[BACKEND.columns.type - 1] || 'string');
      const required = String(contentRow[BACKEND.columns.required - 1] || '') === '是';
      const active = contentRow[BACKEND.columns.active - 1] === true;
      if (!active) throw new Error(`此項目已停用：${key}`);
      if (required && isRawEmptyValue_(rawValue)) {
        throw new Error(`必填內容不可留空：${key}`);
      }
      const value = coerceValue_(rawValue, type);
      const currentValue = contentRow[BACKEND.columns.value - 1];
      if (valuesEqual_(value, currentValue)) return;
      if (/有機|organic/i.test(String(value || '')) && !brandConfirmed) {
        throw new Error(`內容包含「有機／Organic」，請先交由 Shao 核決：${key}`);
      }
      contentRow[BACKEND.columns.value - 1] = value;
      contentRow[BACKEND.columns.updatedAt - 1] = timestamp;
      changedCount += 1;
    });

    validateDiyGroups_(contentRows);
    validateImageUrls_(contentRows);

    if (changedCount) {
      contentSheet.getRange(BACKEND.dataStartRow, BACKEND.columns.value, contentRowCount, 1)
        .setValues(contentRows.map((row) => [row[BACKEND.columns.value - 1]]));
      contentSheet.getRange(BACKEND.dataStartRow, BACKEND.columns.updatedAt, contentRowCount, 1)
        .setValues(contentRows.map((row) => [row[BACKEND.columns.updatedAt - 1]]))
        .setNumberFormat('@');
      SpreadsheetApp.flush();
      CacheService.getScriptCache().remove(BACKEND.cacheKey);
    }
    const message = changedCount ? `已發布 ${changedCount} 項到正式內容 ✓` : '沒有需要發布的變更';
    editor.getRange(EDITOR.statusCell).setValue(message);
    return { publishedCount: changedCount, message, publishedAt: new Date().toISOString() };
  } catch (error) {
    if (editor) editor.getRange(EDITOR.statusCell).setValue(safeErrorMessage_(error));
    if (throwOnError) throw error;
    return { publishedCount: 0, message: safeErrorMessage_(error), error: true };
  } finally {
    if (publishRange) publishRange.setValue(false);
    if (locked) lock.releaseLock();
  }
}

function valuesEqual_(left, right) {
  return typeof left === typeof right && left === right;
}

function validateDiyGroups_(contentRows) {
  const groups = new Map();
  contentRows.forEach((row) => {
    const key = String(row[BACKEND.columns.key - 1] || '').trim();
    const match = key.match(/^diy\.(\d+)\.(enabled|name|price|tag|group|image)$/);
    if (!match) return;
    const index = Number(match[1]);
    if (!groups.has(index)) groups.set(index, {});
    groups.get(index)[match[2]] = row[BACKEND.columns.value - 1];
  });

  groups.forEach((group, index) => {
    if (group.enabled !== true) return;
    const missing = ['name', 'price', 'tag', 'group', 'image']
      .filter((field) => isRawEmptyValue_(group[field]));
    if (missing.length) {
      throw new Error(`DIY 項目 ${index + 1} 啟用前，請完整填寫名稱、價格、時長、成團人數與圖片網址。`);
    }
    if (!/^https:\/\//i.test(String(group.image))) {
      throw new Error(`DIY 項目 ${index + 1} 的圖片網址必須以 https:// 開頭。`);
    }
  });
}

function isImageKey_(key) {
  return /(?:^|\.)(?:image|img)$/.test(key)
    || /\.images\.\d+$/.test(key)
    || /^siteConfig\.diningImages\.\d+$/.test(key);
}

function validateImageUrls_(contentRows) {
  contentRows.forEach((row) => {
    const key = String(row[BACKEND.columns.key - 1] || '').trim();
    if (!isImageKey_(key)) return;
    const value = row[BACKEND.columns.value - 1];
    if (isRawEmptyValue_(value)) return;
    if (!/^https:\/\//i.test(String(value))) {
      throw new Error(`圖片網址必須以 https:// 開頭：${key}`);
    }
  });
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
      type: String(row[BACKEND.columns.type - 1] || 'string'),
      required: String(row[BACKEND.columns.required - 1] || '') === '是',
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
  const diyMatch = key.match(/^diy\.(\d+)\.(enabled|name|price|tag|group|image)$/);
  if (diyMatch) {
    const names = {
      enabled: '顯示此項目', name: '名稱', price: '價格', tag: '時長',
      group: '成團人數', image: '圖片網址',
    };
    return names[diyMatch[2]];
  }
  const faqRowsMatch = key.match(/^qa\.categories\.\d+\.list\.(\d+)\.rows\.(\d+)\.(label|value|note)$/);
  if (faqRowsMatch) {
    const names = { label: '項目', value: '內容', note: '補充' };
    return `💬 答案 ${Number(faqRowsMatch[1]) + 1}｜選項 ${Number(faqRowsMatch[2]) + 1}・${names[faqRowsMatch[3]]}`;
  }
  const factsMatch = key.match(/\.facts\.(\d+)$/);
  if (factsMatch) return `${entry.item}｜重點 ${Number(factsMatch[1]) + 1}`;

  const faqMatch = key.match(/^qa\.categories\.\d+\.list\.(\d+)\.(q|a)$/);
  if (faqMatch) {
    const category = entry.item.split('／第')[0];
    const questionNumber = Number(faqMatch[1]) + 1;
    return faqMatch[2] === 'q'
      ? `❓ 題目內容 ${questionNumber}｜${category}`
      : `💬 答案內容 ${questionNumber}`;
  }
  if (key.startsWith('diningContent.')) return entry.item;
  if (isImageKey_(key)) return `${entry.item}｜圖片網址`;

  const field = key.split('.').pop();
  const names = {
    homeUrl: '官網網址', phone: '聯絡電話', shopPhone: '展售室手機',
    enabled: '是否顯示', text: '內容', full: '全票', fullDiscount: '全票折抵',
    half: '半票', halfDiscount: '半票折抵', freeRule: '免票規則', time: '營業時間',
    note: '補充說明', price: '價格', subPrice: '價格單位', name: '名稱',
    tag: '時長', group: '成團人數', image: '圖片網址', img: '圖片網址', title: '標題', desc: '描述',
    q: '問題', a: '答案',
  };
  return `${entry.item}｜${names[field] || field}`;
}

function updateControlStatus_(spreadsheet, status) {
  const control = spreadsheet.getSheetByName('控制台');
  if (!control) return;
  control.getRange('A3').setValue('平常在「批次編輯」一次修改多個欄位，再統一儲存');
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
      const active = row[BACKEND.columns.active - 1] === true;
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
      if (found.row[BACKEND.columns.active - 1] !== true) {
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

    prepared.forEach((entry) => {
      rowByKey.get(entry.key).row[BACKEND.columns.value - 1] = entry.value;
    });
    validateDiyGroups_(rows);
    validateImageUrls_(rows);

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
  if (raw.length > 300) throw new Error('單次最多更新 300 個欄位。');
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
