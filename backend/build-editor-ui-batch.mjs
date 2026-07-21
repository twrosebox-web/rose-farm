const controlId = 15049093;
const contentId = 895957080;
const editorId = 2026072101;

const rgb = (hex) => {
  const value = hex.replace('#', '');
  return {
    red: parseInt(value.slice(0, 2), 16) / 255,
    green: parseInt(value.slice(2, 4), 16) / 255,
    blue: parseInt(value.slice(4, 6), 16) / 255,
  };
};

const gridRange = (startRowIndex, endRowIndex, startColumnIndex, endColumnIndex) => ({
  sheetId: editorId,
  startRowIndex,
  endRowIndex,
  startColumnIndex,
  endColumnIndex,
});

const merge = (startRowIndex, endRowIndex, startColumnIndex, endColumnIndex) => ({
  mergeCells: {
    range: gridRange(startRowIndex, endRowIndex, startColumnIndex, endColumnIndex),
    mergeType: 'MERGE_ALL',
  },
});

const format = (range, userEnteredFormat, fields) => ({
  repeatCell: {
    range,
    cell: { userEnteredFormat },
    fields: `userEnteredFormat(${fields})`,
  },
});

const values = Array.from({ length: 24 }, () =>
  Array.from({ length: 8 }, () => ({ userEnteredValue: { stringValue: '' } })),
);
const setText = (row, column, value) => {
  values[row - 1][column - 1] = { userEnteredValue: { stringValue: value } };
};
const setBoolean = (row, column, value) => {
  values[row - 1][column - 1] = { userEnteredValue: { boolValue: value } };
};

setText(1, 1, '🌹 大花農場｜內容編輯面板');
setText(3, 1, '一次只修改一個項目，系統欄位已藏在底層');
setText(4, 1, '⚠️ 下一步：安裝 Apps Script 後，分類切換與發布才會啟用。');
setText(5, 1, '① 選擇分類');
setText(5, 2, '基本資訊');
setText(7, 1, '② 選擇項目');
setText(7, 2, '官網｜官網網址');
setText(9, 1, '目前內容');
setText(9, 2, 'https://www.rosebox.com.tw');
setText(13, 1, '③ 輸入新內容');
setText(13, 2, 'https://www.rosebox.com.tw');
setText(18, 1, '填寫說明');
setText(18, 2, '回官網按鈕連結；請填完整 https:// 網址。');
setText(21, 1, '最後更新');
setText(21, 2, '2026-07-17T06:13:34.458Z');
setText(21, 4, '尚未修改');
setText(23, 1, '我已確認內容');
setBoolean(23, 2, false);
setText(23, 3, '發布更新');
setBoolean(23, 4, false);
setText(2, 8, 'homeUrl');
values[2][7] = { userEnteredValue: { numberValue: 4 } };

const requests = [
  {
    addSheet: {
      properties: {
        sheetId: editorId,
        title: '後台編輯',
        index: 1,
        gridProperties: {
          rowCount: 40,
          columnCount: 8,
          frozenRowCount: 3,
          hideGridlines: true,
        },
      },
    },
  },
  merge(0, 2, 0, 4),
  merge(2, 3, 0, 4),
  merge(3, 4, 0, 4),
  merge(4, 5, 1, 4),
  merge(6, 7, 1, 4),
  merge(8, 11, 1, 4),
  merge(12, 16, 1, 4),
  merge(17, 19, 1, 4),
  merge(20, 21, 1, 3),
  {
    updateCells: {
      range: gridRange(0, 24, 0, 8),
      rows: values.map((row) => ({ values: row })),
      fields: 'userEnteredValue',
    },
  },
  format(
    gridRange(0, 24, 0, 8),
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
    gridRange(0, 2, 0, 4),
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
    gridRange(2, 3, 0, 4),
    {
      backgroundColorStyle: { rgbColor: rgb('#eaf1e8') },
      horizontalAlignment: 'CENTER',
      textFormat: {
        fontFamily: 'Noto Sans TC',
        fontSize: 11,
        bold: true,
        foregroundColorStyle: { rgbColor: rgb('#3a5a40') },
      },
    },
    'backgroundColorStyle,horizontalAlignment,textFormat',
  ),
  format(
    gridRange(3, 4, 0, 4),
    {
      backgroundColorStyle: { rgbColor: rgb('#fff0ee') },
      horizontalAlignment: 'CENTER',
      textFormat: {
        fontFamily: 'Noto Sans TC',
        fontSize: 10,
        bold: true,
        foregroundColorStyle: { rgbColor: rgb('#a24b47') },
      },
    },
    'backgroundColorStyle,horizontalAlignment,textFormat',
  ),
  format(
    gridRange(4, 23, 0, 1),
    {
      backgroundColorStyle: { rgbColor: rgb('#f3e6df') },
      horizontalAlignment: 'CENTER',
      textFormat: {
        fontFamily: 'Noto Sans TC',
        fontSize: 11,
        bold: true,
        foregroundColorStyle: { rgbColor: rgb('#7d4544') },
      },
    },
    'backgroundColorStyle,horizontalAlignment,textFormat',
  ),
  format(
    gridRange(4, 7, 1, 4),
    {
      backgroundColorStyle: { rgbColor: rgb('#ffffff') },
      textFormat: {
        fontFamily: 'Noto Sans TC',
        fontSize: 12,
        bold: true,
        foregroundColorStyle: { rgbColor: rgb('#3a5a40') },
      },
      borders: {
        bottom: { style: 'SOLID_MEDIUM', colorStyle: { rgbColor: rgb('#8ba888') } },
      },
    },
    'backgroundColorStyle,textFormat,borders',
  ),
  format(
    gridRange(8, 11, 1, 4),
    {
      backgroundColorStyle: { rgbColor: rgb('#f1f4f0') },
      verticalAlignment: 'TOP',
      textFormat: {
        fontFamily: 'Noto Sans TC',
        fontSize: 12,
        foregroundColorStyle: { rgbColor: rgb('#4f5b51') },
      },
      borders: {
        top: { style: 'SOLID', colorStyle: { rgbColor: rgb('#d6ded4') } },
        bottom: { style: 'SOLID', colorStyle: { rgbColor: rgb('#d6ded4') } },
        left: { style: 'SOLID', colorStyle: { rgbColor: rgb('#d6ded4') } },
        right: { style: 'SOLID', colorStyle: { rgbColor: rgb('#d6ded4') } },
      },
    },
    'backgroundColorStyle,verticalAlignment,textFormat,borders',
  ),
  format(
    gridRange(12, 16, 1, 4),
    {
      backgroundColorStyle: { rgbColor: rgb('#fff1b8') },
      verticalAlignment: 'TOP',
      textFormat: {
        fontFamily: 'Noto Sans TC',
        fontSize: 13,
        bold: true,
        foregroundColorStyle: { rgbColor: rgb('#3a5a40') },
      },
      borders: {
        top: { style: 'SOLID_MEDIUM', colorStyle: { rgbColor: rgb('#d6a93b') } },
        bottom: { style: 'SOLID_MEDIUM', colorStyle: { rgbColor: rgb('#d6a93b') } },
        left: { style: 'SOLID_MEDIUM', colorStyle: { rgbColor: rgb('#d6a93b') } },
        right: { style: 'SOLID_MEDIUM', colorStyle: { rgbColor: rgb('#d6a93b') } },
      },
    },
    'backgroundColorStyle,verticalAlignment,textFormat,borders',
  ),
  format(
    gridRange(17, 19, 1, 4),
    {
      backgroundColorStyle: { rgbColor: rgb('#f8f5f2') },
      verticalAlignment: 'TOP',
      textFormat: {
        fontFamily: 'Noto Sans TC',
        fontSize: 10,
        foregroundColorStyle: { rgbColor: rgb('#6e716d') },
      },
    },
    'backgroundColorStyle,verticalAlignment,textFormat',
  ),
  format(
    gridRange(20, 21, 1, 4),
    {
      backgroundColorStyle: { rgbColor: rgb('#eef3ec') },
      horizontalAlignment: 'CENTER',
      textFormat: {
        fontFamily: 'Noto Sans TC',
        fontSize: 10,
        bold: true,
        foregroundColorStyle: { rgbColor: rgb('#3a5a40') },
      },
    },
    'backgroundColorStyle,horizontalAlignment,textFormat',
  ),
  format(
    gridRange(22, 23, 0, 4),
    {
      backgroundColorStyle: { rgbColor: rgb('#3a5a40') },
      horizontalAlignment: 'CENTER',
      textFormat: {
        fontFamily: 'Noto Sans TC',
        fontSize: 12,
        bold: true,
        foregroundColorStyle: { rgbColor: rgb('#ffffff') },
      },
    },
    'backgroundColorStyle,horizontalAlignment,textFormat',
  ),
  {
    setDataValidation: {
      range: gridRange(4, 5, 1, 2),
      rule: {
        condition: {
          type: 'ONE_OF_LIST',
          values: ['基本資訊', '公告', '票價', '體驗服務', '餐廳', 'DIY', '參觀資訊', 'FAQ 分類', 'FAQ', 'FAQ 表格']
            .map((userEnteredValue) => ({ userEnteredValue })),
        },
        strict: true,
        showCustomUi: true,
      },
    },
  },
  {
    setDataValidation: {
      range: gridRange(6, 7, 1, 2),
      rule: {
        condition: {
          type: 'ONE_OF_LIST',
          values: ['官網｜官網網址', '聯絡電話｜聯絡電話', '展售室手機｜展售室手機', '營業時間｜營業時間', '公休日｜補充說明']
            .map((userEnteredValue) => ({ userEnteredValue })),
        },
        strict: true,
        showCustomUi: true,
      },
    },
  },
  ...[1, 3].map((columnIndex) => ({
    setDataValidation: {
      range: gridRange(22, 23, columnIndex, columnIndex + 1),
      rule: {
        condition: { type: 'BOOLEAN' },
        strict: true,
        showCustomUi: true,
      },
    },
  })),
  {
    updateCells: {
      range: gridRange(12, 13, 1, 2),
      rows: [{ values: [{ note: '只修改黃色區域。完成後勾選確認，再勾選發布更新。' }] }],
      fields: 'note',
    },
  },
  ...[
    [0, 1, 138], [1, 4, 118], [4, 8, 5],
  ].map(([startIndex, endIndex, pixelSize]) => ({
    updateDimensionProperties: {
      range: { sheetId: editorId, dimension: 'COLUMNS', startIndex, endIndex },
      properties: { pixelSize },
      fields: 'pixelSize',
    },
  })),
  {
    updateDimensionProperties: {
      range: { sheetId: editorId, dimension: 'COLUMNS', startIndex: 4, endIndex: 8 },
      properties: { hiddenByUser: true },
      fields: 'hiddenByUser',
    },
  },
  ...[
    [0, 3, 34], [4, 8, 38], [8, 11, 30], [12, 16, 32], [17, 19, 28], [20, 24, 36],
  ].map(([startIndex, endIndex, pixelSize]) => ({
    updateDimensionProperties: {
      range: { sheetId: editorId, dimension: 'ROWS', startIndex, endIndex },
      properties: { pixelSize },
      fields: 'pixelSize',
    },
  })),
  {
    updateDimensionProperties: {
      range: { sheetId: editorId, dimension: 'ROWS', startIndex: 24, endIndex: 40 },
      properties: { hiddenByUser: true },
      fields: 'hiddenByUser',
    },
  },
  {
    updateSheetProperties: {
      properties: { sheetId: contentId, hidden: true },
      fields: 'hidden',
    },
  },
  {
    updateCells: {
      range: { sheetId: controlId, startRowIndex: 4, endRowIndex: 5, startColumnIndex: 0, endColumnIndex: 6 },
      rows: [{ values: [
        { userEnteredValue: { stringValue: '① 開啟後台編輯\n點下方「後台編輯」分頁' } }, {},
        { userEnteredValue: { stringValue: '② 選擇分類與項目\n一次只處理一個欄位' } }, {},
        { userEnteredValue: { stringValue: '③ 確認後發布\n資料表會自動同步' } }, {},
      ] }],
      fields: 'userEnteredValue',
    },
  },
  {
    updateCells: {
      range: { sheetId: controlId, startRowIndex: 17, endRowIndex: 18, startColumnIndex: 0, endColumnIndex: 1 },
      rows: [{ values: [{
        userEnteredValue: {
          formulaValue: '=HYPERLINK("#gid=2026072101&range=A1:D24","▶ 開啟內容編輯面板")',
        },
      }] }],
      fields: 'userEnteredValue',
    },
  },
];

if (requests.length < 20) throw new Error('Editor UI batch preflight failed.');
console.log(JSON.stringify(requests));
