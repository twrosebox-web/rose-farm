const controlId = 15049093;
const contentId = 895957080;
const contentEndRow = 711;

const color = (hex) => {
  const value = hex.replace("#", "");
  return {
    red: parseInt(value.slice(0, 2), 16) / 255,
    green: parseInt(value.slice(2, 4), 16) / 255,
    blue: parseInt(value.slice(4, 6), 16) / 255,
  };
};
const range = (sheetId, startRowIndex, endRowIndex, startColumnIndex, endColumnIndex) => ({
  sheetId, startRowIndex, endRowIndex, startColumnIndex, endColumnIndex,
});
const format = (target, userEnteredFormat, fields) => ({
  repeatCell: {
    range: target,
    cell: { userEnteredFormat },
    fields: `userEnteredFormat(${fields})`,
  },
});
const merge = (startRowIndex, endRowIndex, startColumnIndex, endColumnIndex) => ({
  mergeCells: {
    range: range(controlId, startRowIndex, endRowIndex, startColumnIndex, endColumnIndex),
    mergeType: "MERGE_ALL",
  },
});
const dimension = (sheetId, dimensionName, startIndex, endIndex, properties, fields) => ({
  updateDimensionProperties: {
    range: { sheetId, dimension: dimensionName, startIndex, endIndex },
    properties,
    fields,
  },
});

const controlCells = Array.from({ length: 19 }, () =>
  Array.from({ length: 6 }, () => ({ userEnteredValue: { stringValue: "" } })),
);
const setText = (row, column, text) => {
  controlCells[row - 1][column - 1] = { userEnteredValue: { stringValue: text } };
};
const setFormula = (row, column, formulaValue) => {
  controlCells[row - 1][column - 1] = { userEnteredValue: { formulaValue } };
};

setText(1, 1, "🌹 大花農場內容後台");
setText(3, 1, "用試算表就能更新網站內容｜平常只修改「內容資料」的黃色欄位");
setText(5, 1, "① 開啟內容資料\n點下方「內容資料」分頁");
setText(5, 3, "② 找到要改的項目\n用 A 欄篩選票價、餐廳、DIY 或 FAQ");
setText(5, 5, "③ 修改目前值\n只修改黃色 D 欄");
setText(9, 1, "後台狀態");
setText(10, 1, "171\n個可管理欄位");
setText(10, 3, "data.js\n雲端失敗自動回退");
setText(10, 5, "待連線\nApps Script");
setText(14, 1, "重要提醒");
setText(15, 1, "品牌紅線：農場只能寫「自然農法」。出現「有機／Organic」時，必須先交由 Shao 核決。");
setText(16, 1, "DIY 時長與成團人數尚未統一，沒有最終數字前不可自行修改。");
setFormula(18, 1, `=HYPERLINK("#gid=${contentId}&range=A1:D${contentEndRow}","▶ 開始編輯內容")`);
setText(18, 4, "找不到「擴充功能」？\n點右上角小箭頭，或按 Ctrl + Shift + F");

const baseText = {
  fontFamily: "Noto Sans TC",
  fontSize: 11,
  foregroundColorStyle: { rgbColor: color("#2F3430") },
};

const requests = [
  {
    updateSpreadsheetProperties: {
      properties: { timeZone: "Asia/Taipei", locale: "zh_TW" },
      fields: "timeZone,locale",
    },
  },
  {
    updateSheetProperties: {
      properties: { sheetId: controlId, title: "控制台", gridProperties: { frozenRowCount: 3 } },
      fields: "title,gridProperties.frozenRowCount",
    },
  },
  { unmergeCells: { range: range(controlId, 0, 20, 0, 6) } },
  {
    updateCells: {
      range: range(controlId, 0, 19, 0, 6),
      rows: controlCells.map((values) => ({ values })),
      fields: "userEnteredValue",
    },
  },
  format(range(controlId, 0, 20, 0, 6), {
    backgroundColorStyle: { rgbColor: color("#FFFDF8") },
    textFormat: baseText,
    verticalAlignment: "MIDDLE",
    wrapStrategy: "WRAP",
  }, "backgroundColorStyle,textFormat,verticalAlignment,wrapStrategy"),
  ...[
    [0, 2, 0, 6], [2, 3, 0, 6], [4, 7, 0, 2], [4, 7, 2, 4], [4, 7, 4, 6],
    [8, 9, 0, 6], [9, 12, 0, 2], [9, 12, 2, 4], [9, 12, 4, 6],
    [13, 14, 0, 6], [14, 15, 0, 6], [15, 16, 0, 6], [17, 19, 0, 3], [17, 19, 3, 6],
  ].map((item) => merge(...item)),
  format(range(controlId, 0, 2, 0, 6), {
    backgroundColorStyle: { rgbColor: color("#3A5A40") },
    horizontalAlignment: "CENTER",
    textFormat: { fontFamily: "Noto Sans TC", fontSize: 22, bold: true, foregroundColorStyle: { rgbColor: color("#FFFFFF") } },
  }, "backgroundColorStyle,horizontalAlignment,textFormat"),
  format(range(controlId, 2, 3, 0, 6), {
    backgroundColorStyle: { rgbColor: color("#EAF1E8") },
    horizontalAlignment: "CENTER",
    textFormat: { fontFamily: "Noto Sans TC", fontSize: 11, bold: true, foregroundColorStyle: { rgbColor: color("#3A5A40") } },
  }, "backgroundColorStyle,horizontalAlignment,textFormat"),
  ...[
    [4, 7, 0, 2, "#F4E7E2", "#7D4544"],
    [4, 7, 2, 4, "#EEF3EC", "#3A5A40"],
    [4, 7, 4, 6, "#FFF4CF", "#6B5400"],
  ].map(([r0, r1, c0, c1, fill, text]) => format(range(controlId, r0, r1, c0, c1), {
    backgroundColorStyle: { rgbColor: color(fill) },
    horizontalAlignment: "CENTER",
    textFormat: { fontFamily: "Noto Sans TC", fontSize: 12, bold: true, foregroundColorStyle: { rgbColor: color(text) } },
  }, "backgroundColorStyle,horizontalAlignment,textFormat")),
  format(range(controlId, 8, 9, 0, 6), {
    backgroundColorStyle: { rgbColor: color("#3A5A40") },
    textFormat: { fontFamily: "Noto Sans TC", fontSize: 12, bold: true, foregroundColorStyle: { rgbColor: color("#FFFFFF") } },
  }, "backgroundColorStyle,textFormat"),
  format(range(controlId, 9, 12, 0, 4), {
    backgroundColorStyle: { rgbColor: color("#F7F9F6") },
    horizontalAlignment: "CENTER",
    textFormat: { fontFamily: "Noto Sans TC", fontSize: 14, bold: true, foregroundColorStyle: { rgbColor: color("#3A5A40") } },
  }, "backgroundColorStyle,horizontalAlignment,textFormat"),
  format(range(controlId, 9, 12, 4, 6), {
    backgroundColorStyle: { rgbColor: color("#FFF0ED") },
    horizontalAlignment: "CENTER",
    textFormat: { fontFamily: "Noto Sans TC", fontSize: 14, bold: true, foregroundColorStyle: { rgbColor: color("#B04E4B") } },
  }, "backgroundColorStyle,horizontalAlignment,textFormat"),
  format(range(controlId, 13, 14, 0, 6), {
    backgroundColorStyle: { rgbColor: color("#D06765") },
    textFormat: { fontFamily: "Noto Sans TC", fontSize: 12, bold: true, foregroundColorStyle: { rgbColor: color("#FFFFFF") } },
  }, "backgroundColorStyle,textFormat"),
  format(range(controlId, 14, 16, 0, 6), {
    backgroundColorStyle: { rgbColor: color("#FFF3F1") },
    textFormat: { fontFamily: "Noto Sans TC", fontSize: 11, bold: true, foregroundColorStyle: { rgbColor: color("#7D4544") } },
  }, "backgroundColorStyle,textFormat"),
  format(range(controlId, 17, 19, 0, 3), {
    backgroundColorStyle: { rgbColor: color("#3A5A40") },
    horizontalAlignment: "CENTER",
    textFormat: { fontFamily: "Noto Sans TC", fontSize: 14, bold: true, foregroundColorStyle: { rgbColor: color("#FFFFFF") } },
  }, "backgroundColorStyle,horizontalAlignment,textFormat"),
  format(range(controlId, 17, 19, 3, 6), {
    backgroundColorStyle: { rgbColor: color("#EEF3EC") },
    horizontalAlignment: "CENTER",
    textFormat: { fontFamily: "Noto Sans TC", fontSize: 11, bold: true, foregroundColorStyle: { rgbColor: color("#3A5A40") } },
  }, "backgroundColorStyle,horizontalAlignment,textFormat"),
  dimension(controlId, "COLUMNS", 0, 6, { pixelSize: 165 }, "pixelSize"),
  dimension(controlId, "COLUMNS", 6, 26, { hiddenByUser: true }, "hiddenByUser"),
  dimension(controlId, "ROWS", 19, 1000, { hiddenByUser: true }, "hiddenByUser"),
  dimension(controlId, "ROWS", 0, 3, { pixelSize: 36 }, "pixelSize"),
  dimension(controlId, "ROWS", 4, 7, { pixelSize: 34 }, "pixelSize"),
  dimension(controlId, "ROWS", 9, 12, { pixelSize: 32 }, "pixelSize"),
  {
    updateSheetProperties: {
      properties: { sheetId: contentId, gridProperties: { frozenRowCount: 3 } },
      fields: "gridProperties.frozenRowCount",
    },
  },
  {
    updateCells: {
      range: range(contentId, 0, 2, 0, 1),
      rows: [
        { values: [{ userEnteredValue: { stringValue: "✏️ 內容資料｜只修改黃色欄位" } }] },
        { values: [{ userEnteredValue: { stringValue: "操作方式：先用 A 欄篩選區塊 → 找到項目 → 修改 D 欄「目前值」" } }] },
      ],
      fields: "userEnteredValue",
    },
  },
  format(range(contentId, 0, 1, 0, 9), {
    backgroundColorStyle: { rgbColor: color("#3A5A40") },
    textFormat: { fontFamily: "Noto Sans TC", fontSize: 16, bold: true, foregroundColorStyle: { rgbColor: color("#FFFFFF") } },
  }, "backgroundColorStyle,textFormat"),
  format(range(contentId, 1, 2, 0, 9), {
    backgroundColorStyle: { rgbColor: color("#FFF4CF") },
    textFormat: { fontFamily: "Noto Sans TC", fontSize: 11, bold: true, foregroundColorStyle: { rgbColor: color("#6B5400") } },
  }, "backgroundColorStyle,textFormat"),
  format(range(contentId, 2, 3, 0, 9), {
    backgroundColorStyle: { rgbColor: color("#5E7A62") },
    horizontalAlignment: "CENTER",
    textFormat: { fontFamily: "Noto Sans TC", fontSize: 11, bold: true, foregroundColorStyle: { rgbColor: color("#FFFFFF") } },
  }, "backgroundColorStyle,horizontalAlignment,textFormat"),
  format(range(contentId, 3, contentEndRow, 0, 2), {
    backgroundColorStyle: { rgbColor: color("#FFFFFF") },
    textFormat: baseText,
    verticalAlignment: "TOP",
    wrapStrategy: "WRAP",
  }, "backgroundColorStyle,textFormat,verticalAlignment,wrapStrategy"),
  format(range(contentId, 3, contentEndRow, 3, 4), {
    backgroundColorStyle: { rgbColor: color("#FFF8DC") },
    textFormat: { fontFamily: "Noto Sans TC", fontSize: 11, bold: true, foregroundColorStyle: { rgbColor: color("#3A5A40") } },
    verticalAlignment: "TOP",
    wrapStrategy: "WRAP",
  }, "backgroundColorStyle,textFormat,verticalAlignment,wrapStrategy"),
  format(range(contentId, 3, contentEndRow, 2, 3), {
    backgroundColorStyle: { rgbColor: color("#F1F3F4") },
    textFormat: { fontFamily: "Roboto Mono", fontSize: 9, foregroundColorStyle: { rgbColor: color("#7A827B") } },
  }, "backgroundColorStyle,textFormat"),
  format(range(contentId, 3, contentEndRow, 4, 9), {
    backgroundColorStyle: { rgbColor: color("#F5F6F5") },
    textFormat: { fontFamily: "Noto Sans TC", fontSize: 9, foregroundColorStyle: { rgbColor: color("#808780") } },
  }, "backgroundColorStyle,textFormat"),
  {
    updateCells: {
      range: range(contentId, 2, 3, 3, 4),
      rows: [{ values: [{ note: "只修改這一欄。number 只填數字；boolean 使用 TRUE／FALSE。" }] }],
      fields: "note",
    },
  },
  dimension(contentId, "COLUMNS", 0, 1, { pixelSize: 110 }, "pixelSize"),
  dimension(contentId, "COLUMNS", 1, 2, { pixelSize: 230 }, "pixelSize"),
  dimension(contentId, "COLUMNS", 3, 4, { pixelSize: 440 }, "pixelSize"),
  dimension(contentId, "COLUMNS", 2, 3, { hiddenByUser: true }, "hiddenByUser"),
  dimension(contentId, "COLUMNS", 4, 9, { hiddenByUser: true }, "hiddenByUser"),
  dimension(contentId, "ROWS", 3, contentEndRow, { pixelSize: 38 }, "pixelSize"),
  {
    addProtectedRange: {
      protectedRange: { range: range(contentId, 3, contentEndRow, 2, 3), description: "系統欄位：key", warningOnly: true },
    },
  },
  {
    addProtectedRange: {
      protectedRange: { range: range(contentId, 3, contentEndRow, 4, 9), description: "系統欄位：類型、說明、updatedAt 與啟用狀態", warningOnly: true },
    },
  },
  {
    addConditionalFormatRule: {
      index: 0,
      rule: {
        ranges: [range(contentId, 3, contentEndRow, 3, 4)],
        booleanRule: {
          condition: { type: "CUSTOM_FORMULA", values: [{ userEnteredValue: '=AND($F4="是",$D4="")' }] },
          format: {
            backgroundColorStyle: { rgbColor: color("#FCE8E6") },
            textFormat: { foregroundColorStyle: { rgbColor: color("#B3261E") }, bold: true },
          },
        },
      },
    },
  },
];

if (requests.some((request) => Object.keys(request).length !== 1)) {
  throw new Error("Batch request preflight failed.");
}

process.stdout.write(JSON.stringify(requests));
