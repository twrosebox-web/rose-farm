import { rows as contentRows } from './build-sheet-template.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const controlId = 15049093;
const contentId = 895957080;
const editorId = 2026072101;
const firstDataRow = 7;

const rgb = (hex) => {
  const value = hex.replace('#', '');
  return {
    red: parseInt(value.slice(0, 2), 16) / 255,
    green: parseInt(value.slice(2, 4), 16) / 255,
    blue: parseInt(value.slice(4, 6), 16) / 255,
  };
};

const editorRange = (startRowIndex, endRowIndex, startColumnIndex, endColumnIndex) => ({
  sheetId: editorId,
  startRowIndex,
  endRowIndex,
  startColumnIndex,
  endColumnIndex,
});

const cellData = (value, note) => {
  const cell = {};
  if (typeof value === 'boolean') cell.userEnteredValue = { boolValue: value };
  else if (typeof value === 'number') cell.userEnteredValue = { numberValue: value };
  else if (value !== undefined && value !== null) cell.userEnteredValue = { stringValue: String(value) };
  if (note) cell.note = note;
  return cell;
};

const format = (range, userEnteredFormat, fields) => ({
  repeatCell: {
    range,
    cell: { userEnteredFormat },
    fields: `userEnteredFormat(${fields})`,
  },
});

const merge = (startRowIndex, endRowIndex, startColumnIndex, endColumnIndex) => ({
  mergeCells: {
    range: editorRange(startRowIndex, endRowIndex, startColumnIndex, endColumnIndex),
    mergeType: 'MERGE_ALL',
  },
});

const fieldNames = {
  homeUrl: '官網網址',
  phone: '聯絡電話',
  shopPhone: '展售室手機',
  enabled: '是否顯示',
  text: '內容',
  full: '全票',
  fullDiscount: '全票折抵',
  half: '半票',
  halfDiscount: '半票折抵',
  freeRule: '免票規則',
  time: '營業時間',
  note: '補充說明',
  price: '價格',
  subPrice: '補充價格',
  name: '名稱',
  tag: '時長',
  group: '成團人數',
  image: '圖片網址',
  title: '標題',
  q: '問題',
  a: '答案',
};

function makeLabel(item, key) {
  const diyMatch = key.match(/^diy\.(\d+)\.(enabled|name|price|tag|group|image)$/);
  if (diyMatch) {
    const names = {
      enabled: '顯示此項目',
      name: '名稱',
      price: '價格',
      tag: '時長',
      group: '成團人數',
      image: '圖片網址',
    };
    return names[diyMatch[2]];
  }
  const rowsMatch = key.match(/\.rows\.(\d+)\.(label|value|note)$/);
  if (rowsMatch) {
    const names = { label: '左欄', value: '內容', note: '補充' };
    return `${item}｜💬 答案內容・第 ${Number(rowsMatch[1]) + 1} 列・${names[rowsMatch[2]]}`;
  }
  const factsMatch = key.match(/\.facts\.(\d+)$/);
  if (factsMatch) return `${item}｜重點 ${Number(factsMatch[1]) + 1}`;
  const field = key.split('.').pop();
  if (field === 'q') return `${item}｜❓ 問題`;
  if (field === 'a') return `${item}｜💬 答案`;
  return `${item}｜${fieldNames[field] || field}`;
}

const sections = new Map();
contentRows.forEach((row, index) => {
  const [section, item, key, value, type, required, guidance, , active] = row;
  if (!sections.has(section)) sections.set(section, []);
  sections.get(section).push({
    section,
    item,
    label: makeLabel(item, key),
    key,
    value,
    type,
    required,
    guidance,
    active,
    sourceRow: index + 4,
  });
});

const outputRows = [
  [cellData('🌹 大花農場｜批次內容編輯')],
  [],
  [cellData('目前狀態'), cellData('待安裝 Apps Script')],
  [cellData('重新載入全部內容'), cellData(false, '會放棄尚未儲存的修改，重新載入底層內容。')],
  [cellData('我已確認，儲存全部變更'), cellData(false, '改完多個黃色欄位後，只要勾選這裡一次。')],
  [],
];
const sectionRows = [];
const fieldRows = [];
const numberRows = [];
const booleanRows = [];
const diyItemHeaderRows = [];
const questionRows = [];
const answerRows = [];

function pushEntry(entry) {
  const rowNumber = outputRows.length + 1;
  fieldRows.push(rowNumber);
  if (entry.type === 'number') numberRows.push(rowNumber);
  if (entry.type === 'boolean') booleanRows.push(rowNumber);
  if (/\.q$/.test(entry.key)) questionRows.push(rowNumber);
  if (/\.a$/.test(entry.key) || /\.rows\.\d+\.(label|value|note)$/.test(entry.key)) {
    answerRows.push(rowNumber);
  }
  outputRows.push([
    cellData(entry.label),
    cellData(entry.value, entry.guidance),
    cellData(entry.key),
    cellData(entry.sourceRow),
    cellData(entry.type),
    cellData(entry.required),
    cellData(entry.active),
  ]);
}

sections.forEach((entries, section) => {
  const sheetRow = outputRows.length + 1;
  sectionRows.push(sheetRow);
  outputRows.push([cellData(section)]);
  if (section !== 'DIY') {
    entries.forEach(pushEntry);
    return;
  }

  const fieldOrder = { enabled: 0, name: 1, price: 2, tag: 3, group: 4, image: 5 };
  const itemGroups = new Map();
  entries.forEach((entry) => {
    const match = entry.key.match(/^diy\.(\d+)\.(enabled|name|price|tag|group|image)$/);
    if (!match) return;
    const index = Number(match[1]);
    if (!itemGroups.has(index)) itemGroups.set(index, []);
    itemGroups.get(index).push({ ...entry, diyField: match[2] });
  });

  [...itemGroups.keys()].sort((left, right) => left - right).forEach((index) => {
    const itemEntries = itemGroups.get(index)
      .sort((left, right) => fieldOrder[left.diyField] - fieldOrder[right.diyField]);
    const nameEntry = itemEntries.find((entry) => entry.diyField === 'name');
    const enabledEntry = itemEntries.find((entry) => entry.diyField === 'enabled');
    const name = String((nameEntry && nameEntry.value) || '').trim();
    const enabled = !enabledEntry || enabledEntry.value !== false;
    const headerRow = outputRows.length + 1;
    diyItemHeaderRows.push(headerRow);
    outputRows.push([cellData(
      `DIY 項目 ${index + 1}｜${name || '可新增空白項目'}${enabled ? '' : '（未顯示）'}`,
    )]);
    itemEntries.forEach(pushEntry);
  });
});

const totalRows = outputRows.length;
const gridRows = Math.max(220, totalRows + 10);
const valueRange = editorRange(firstDataRow - 1, totalRows, 1, 2);

const requests = [
  {
    updateSheetProperties: {
      properties: {
        sheetId: editorId,
        title: '批次編輯',
        gridProperties: {
          rowCount: gridRows,
          columnCount: 8,
          frozenRowCount: 0,
          hideGridlines: true,
        },
      },
      fields: 'title,gridProperties(rowCount,columnCount,frozenRowCount,hideGridlines)',
    },
  },
  {
    unmergeCells: {
      range: editorRange(0, gridRows, 0, 8),
    },
  },
  { deleteConditionalFormatRule: { sheetId: editorId, index: 0 } },
  { deleteConditionalFormatRule: { sheetId: editorId, index: 0 } },
  {
    repeatCell: {
      range: editorRange(0, gridRows, 0, 8),
      cell: {},
      fields: 'userEnteredValue,note,dataValidation,userEnteredFormat',
    },
  },
  merge(0, 2, 0, 2),
  ...sectionRows.map((row) => merge(row - 1, row, 0, 2)),
  ...diyItemHeaderRows.map((row) => merge(row - 1, row, 0, 2)),
  {
    updateCells: {
      range: editorRange(0, totalRows, 0, 7),
      rows: outputRows.map((row) => ({ values: row })),
      fields: 'userEnteredValue,note',
    },
  },
  format(
    editorRange(0, totalRows, 0, 7),
    {
      backgroundColorStyle: { rgbColor: rgb('#fffdf8') },
      verticalAlignment: 'MIDDLE',
      wrapStrategy: 'WRAP',
      textFormat: {
        fontFamily: 'Noto Sans TC',
        fontSize: 11,
        foregroundColorStyle: { rgbColor: rgb('#2f3430') },
      },
    },
    'backgroundColorStyle,verticalAlignment,wrapStrategy,textFormat',
  ),
  format(
    editorRange(0, 2, 0, 2),
    {
      backgroundColorStyle: { rgbColor: rgb('#3a5a40') },
      horizontalAlignment: 'CENTER',
      textFormat: {
        fontFamily: 'Noto Sans TC',
        fontSize: 20,
        bold: true,
        foregroundColorStyle: { rgbColor: rgb('#ffffff') },
      },
    },
    'backgroundColorStyle,horizontalAlignment,textFormat',
  ),
  format(
    editorRange(2, 3, 0, 2),
    {
      backgroundColorStyle: { rgbColor: rgb('#eaf1e8') },
      textFormat: { bold: true, foregroundColorStyle: { rgbColor: rgb('#3a5a40') } },
      borders: { bottom: { style: 'SOLID', colorStyle: { rgbColor: rgb('#b8c8b5') } } },
    },
    'backgroundColorStyle,textFormat,borders',
  ),
  format(
    editorRange(3, 5, 0, 2),
    {
      backgroundColorStyle: { rgbColor: rgb('#f3e6df') },
      textFormat: { bold: true, foregroundColorStyle: { rgbColor: rgb('#7d4544') } },
      borders: { bottom: { style: 'SOLID', colorStyle: { rgbColor: rgb('#dbc8bd') } } },
    },
    'backgroundColorStyle,textFormat,borders',
  ),
  format(
    editorRange(firstDataRow - 1, totalRows, 0, 1),
    {
      backgroundColorStyle: { rgbColor: rgb('#f6f0e8') },
      textFormat: { bold: true, foregroundColorStyle: { rgbColor: rgb('#5f493e') } },
      borders: { bottom: { style: 'SOLID', colorStyle: { rgbColor: rgb('#e4ddd4') } } },
    },
    'backgroundColorStyle,textFormat,borders',
  ),
  format(
    editorRange(firstDataRow - 1, totalRows, 1, 2),
    {
      backgroundColorStyle: { rgbColor: rgb('#fff1b8') },
      verticalAlignment: 'TOP',
      textFormat: { bold: true, foregroundColorStyle: { rgbColor: rgb('#29452e') } },
      borders: {
        bottom: { style: 'SOLID', colorStyle: { rgbColor: rgb('#dcc775') } },
        left: { style: 'SOLID_MEDIUM', colorStyle: { rgbColor: rgb('#d6a93b') } },
      },
    },
    'backgroundColorStyle,verticalAlignment,textFormat,borders',
  ),
  ...sectionRows.map((row) => format(
    editorRange(row - 1, row, 0, 2),
    {
      backgroundColorStyle: { rgbColor: rgb('#3a5a40') },
      textFormat: {
        fontFamily: 'Noto Sans TC',
        fontSize: 12,
        bold: true,
        foregroundColorStyle: { rgbColor: rgb('#ffffff') },
      },
    },
    'backgroundColorStyle,textFormat',
  )),
  ...diyItemHeaderRows.map((row) => format(
    editorRange(row - 1, row, 0, 2),
    {
      backgroundColorStyle: { rgbColor: rgb('#6f8d72') },
      textFormat: {
        fontFamily: 'Noto Sans TC',
        fontSize: 11,
        bold: true,
        foregroundColorStyle: { rgbColor: rgb('#ffffff') },
      },
    },
    'backgroundColorStyle,textFormat',
  )),
  ...questionRows.map((row) => format(
    editorRange(row - 1, row, 0, 2),
    {
      backgroundColorStyle: { rgbColor: rgb('#e6f2e8') },
      textFormat: { bold: true, foregroundColorStyle: { rgbColor: rgb('#244b2b') } },
      borders: { top: { style: 'SOLID_MEDIUM', colorStyle: { rgbColor: rgb('#8ba888') } } },
    },
    'backgroundColorStyle,textFormat,borders',
  )),
  ...answerRows.map((row) => format(
    editorRange(row - 1, row, 0, 2),
    {
      backgroundColorStyle: { rgbColor: rgb('#fff4cf') },
      verticalAlignment: 'TOP',
      textFormat: { foregroundColorStyle: { rgbColor: rgb('#6b4b35') } },
      borders: { bottom: { style: 'SOLID_MEDIUM', colorStyle: { rgbColor: rgb('#decf9a') } } },
    },
    'backgroundColorStyle,verticalAlignment,textFormat,borders',
  )),
  {
    setDataValidation: {
      range: editorRange(3, 5, 1, 2),
      rule: { condition: { type: 'BOOLEAN' }, strict: true, showCustomUi: true },
    },
  },
  ...booleanRows.map((row) => ({
    setDataValidation: {
      range: editorRange(row - 1, row, 1, 2),
      rule: { condition: { type: 'BOOLEAN' }, strict: true, showCustomUi: true },
    },
  })),
  ...numberRows.map((row) => ({
    setDataValidation: {
      range: editorRange(row - 1, row, 1, 2),
      rule: {
        condition: {
          type: 'CUSTOM_FORMULA',
          values: [{ userEnteredValue: `=OR(B${row}="",ISNUMBER(B${row}))` }],
        },
        inputMessage: '此欄只填數字。',
        strict: true,
        showCustomUi: false,
      },
    },
  })),
  {
    addConditionalFormatRule: {
      rule: {
        ranges: [valueRange],
        booleanRule: {
          condition: {
            type: 'CUSTOM_FORMULA',
            values: [{ userEnteredValue: `=AND($F${firstDataRow}="是",$C${firstDataRow}<>"",$B${firstDataRow}="")` }],
          },
          format: {
            backgroundColorStyle: { rgbColor: rgb('#ffd7d4') },
            textFormat: { foregroundColorStyle: { rgbColor: rgb('#9b2c2c') }, bold: true },
          },
        },
      },
      index: 0,
    },
  },
  {
    addConditionalFormatRule: {
      rule: {
        ranges: [valueRange],
        booleanRule: {
          condition: {
            type: 'CUSTOM_FORMULA',
            values: [{ userEnteredValue: `=OR(IFERROR(SEARCH("有機",$B${firstDataRow})>0,FALSE),IFERROR(SEARCH("Organic",$B${firstDataRow})>0,FALSE))` }],
          },
          format: {
            backgroundColorStyle: { rgbColor: rgb('#ffe0b2') },
            textFormat: { foregroundColorStyle: { rgbColor: rgb('#a23b00') }, bold: true },
          },
        },
      },
      index: 0,
    },
  },
  ...[
    [0, 1, 300],
    [1, 2, 520],
    [2, 7, 90],
    [7, 8, 12],
  ].map(([startIndex, endIndex, pixelSize]) => ({
    updateDimensionProperties: {
      range: { sheetId: editorId, dimension: 'COLUMNS', startIndex, endIndex },
      properties: { pixelSize },
      fields: 'pixelSize',
    },
  })),
  {
    updateDimensionProperties: {
      range: { sheetId: editorId, dimension: 'COLUMNS', startIndex: 2, endIndex: 8 },
      properties: { hiddenByUser: true },
      fields: 'hiddenByUser',
    },
  },
  ...[
    [0, 2, 38],
    [2, 5, 36],
    [5, 6, 14],
  ].map(([startIndex, endIndex, pixelSize]) => ({
    updateDimensionProperties: {
      range: { sheetId: editorId, dimension: 'ROWS', startIndex, endIndex },
      properties: { pixelSize },
      fields: 'pixelSize',
    },
  })),
  {
    updateDimensionProperties: {
      range: { sheetId: editorId, dimension: 'ROWS', startIndex: firstDataRow - 1, endIndex: totalRows },
      properties: { pixelSize: 48 },
      fields: 'pixelSize',
    },
  },
  ...sectionRows.map((row) => ({
    updateDimensionProperties: {
      range: { sheetId: editorId, dimension: 'ROWS', startIndex: row - 1, endIndex: row },
      properties: { pixelSize: 34 },
      fields: 'pixelSize',
    },
  })),
  ...diyItemHeaderRows.map((row) => ({
    updateDimensionProperties: {
      range: { sheetId: editorId, dimension: 'ROWS', startIndex: row - 1, endIndex: row },
      properties: { pixelSize: 34 },
      fields: 'pixelSize',
    },
  })),
  ...questionRows.map((row) => ({
    updateDimensionProperties: {
      range: { sheetId: editorId, dimension: 'ROWS', startIndex: row - 1, endIndex: row },
      properties: { pixelSize: 46 },
      fields: 'pixelSize',
    },
  })),
  ...answerRows.map((row) => ({
    updateDimensionProperties: {
      range: { sheetId: editorId, dimension: 'ROWS', startIndex: row - 1, endIndex: row },
      properties: { pixelSize: 76 },
      fields: 'pixelSize',
    },
  })),
  {
    updateSheetProperties: {
      properties: { sheetId: contentId, hidden: true },
      fields: 'hidden',
    },
  },
  {
    updateCells: {
      range: { sheetId: controlId, startRowIndex: 2, endRowIndex: 3, startColumnIndex: 0, endColumnIndex: 1 },
      rows: [{ values: [{ userEnteredValue: { stringValue: '平常在「批次編輯」一次修改多個欄位，再統一儲存' } }] }],
      fields: 'userEnteredValue',
    },
  },
  {
    updateCells: {
      range: { sheetId: controlId, startRowIndex: 4, endRowIndex: 5, startColumnIndex: 0, endColumnIndex: 6 },
      rows: [{ values: [
        { userEnteredValue: { stringValue: '① 開啟批次編輯\n所有欄位都在同一頁' } }, {},
        { userEnteredValue: { stringValue: '② 一次修改多項\n只改黃色欄位' } }, {},
        { userEnteredValue: { stringValue: '③ 儲存全部變更\n勾選一次即可送出' } }, {},
      ] }],
      fields: 'userEnteredValue',
    },
  },
  {
    updateCells: {
      range: { sheetId: controlId, startRowIndex: 9, endRowIndex: 10, startColumnIndex: 4, endColumnIndex: 5 },
      rows: [{ values: [{ userEnteredValue: { stringValue: '待安裝\nApps Script' } }] }],
      fields: 'userEnteredValue',
    },
  },
  {
    updateCells: {
      range: { sheetId: controlId, startRowIndex: 17, endRowIndex: 18, startColumnIndex: 0, endColumnIndex: 1 },
      rows: [{ values: [{
        userEnteredValue: {
          formulaValue: `=HYPERLINK("#gid=${editorId}&range=A1:B${totalRows}","▶ 開啟批次內容編輯")`,
        },
      }] }],
      fields: 'userEnteredValue',
    },
  },
];

if (totalRows < 100 || contentRows.length < 100) {
  throw new Error('Batch editor row generation is unexpectedly short.');
}

const badRequests = requests.filter((request) => Object.keys(request).length !== 1);
if (badRequests.length) throw new Error('Batch request preflight failed.');

const summary = {
  contentRows: contentRows.length,
  sections: sections.size,
  totalRows,
  firstDataRow,
};

const isMain = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) console.log(JSON.stringify({ requests, summary }));

export { requests, summary };
