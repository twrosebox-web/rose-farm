import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const outputDir = path.join(repoRoot, "outputs", "phase3-rose-farm");
const dataSource = await fs.readFile(path.join(repoRoot, "js", "data.js"), "utf8");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(dataSource, context);
const data = context.window.DATA;

const now = new Date().toISOString();
const textTimestamp = `'${now}`;
const rows = [];

function valueType(value) {
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  return "string";
}

function addRow(section, item, key, value, guidance, required = true) {
  rows.push([
    section,
    item,
    key,
    value,
    valueType(value),
    required ? "是" : "否",
    guidance,
    textTimestamp,
    true,
  ]);
}

addRow("基本資訊", "官網", "homeUrl", data.homeUrl, "回官網按鈕連結；請填完整 https:// 網址。", true);
addRow("基本資訊", "聯絡電話", "siteConfig.phone", data.siteConfig.phone, "電話格式固定為 08-810-1858。", true);
addRow("基本資訊", "展售室手機", "siteConfig.shopPhone", data.siteConfig.shopPhone, "電話格式固定為 0987-019-118。", true);
addRow("公告", "是否顯示", "siteConfig.announcement.enabled", false, "預留欄位；前端公告區完成後才會顯示。", false);
addRow("公告", "公告內容", "siteConfig.announcement.text", "", "預留欄位；請使用繁體中文與全形標點。", false);

const ticketFields = [
  ["全票", "full", "全票售價，只填數字。"],
  ["全票折抵", "fullDiscount", "全票可折抵園區消費金額，只填數字。"],
  ["半票", "half", "半票售價，只填數字。"],
  ["半票折抵", "halfDiscount", "半票可折抵園區消費金額，只填數字。"],
  ["免票規則", "freeRule", "請完整寫出免票資格。"],
];
for (const [item, field, guidance] of ticketFields) {
  addRow("票價", item, `siteConfig.ticket.${field}`, data.siteConfig.ticket[field], guidance, true);
}

const infoIndex = data.bentoItems.findIndex((item) => item.type === "info");
if (infoIndex >= 0) {
  addRow("基本資訊", "營業時間", `bentoItems.${infoIndex}.time`, data.bentoItems[infoIndex].time, "使用 09:00 - 17:00 格式。", true);
  addRow("基本資訊", "公休日", `bentoItems.${infoIndex}.note`, data.bentoItems[infoIndex].note, "請填固定公休日或臨時休園說明。", true);
}

data.services.forEach((service, serviceIndex) => {
  const item = service.title || `服務 ${serviceIndex + 1}`;
  addRow("體驗服務", item, `services.${serviceIndex}.price`, service.price, "卡片可見價格；請保留單位。", true);
  (service.facts || []).forEach((fact, factIndex) => {
    addRow("體驗服務", item, `services.${serviceIndex}.facts.${factIndex}`, fact, "卡片可見的人數、時段或容量資訊。", false);
  });
});

data.diningOptions.forEach((option, optionIndex) => {
  const item = option.title || `餐飲方案 ${optionIndex + 1}`;
  addRow("餐廳", item, `diningOptions.${optionIndex}.price`, option.price, "請填顯示價格；可使用「請洽專人」等文字。", true);
  if (Object.hasOwn(option, "subPrice")) {
    addRow("餐廳", item, `diningOptions.${optionIndex}.subPrice`, option.subPrice, "價格後方的單位，例如「／桌」或「起／人」。", false);
  }
});

data.diy.forEach((diy, diyIndex) => {
  const item = diy.name || `DIY 項目 ${diyIndex + 1}（可新增）`;
  addRow("DIY", item, `diy.${diyIndex}.enabled`, diy.enabled !== false, "勾選＝顯示；取消勾選＝下架，原資料會保留。", true);
  addRow("DIY", item, `diy.${diyIndex}.name`, diy.name, "DIY 對外顯示名稱。啟用前必須填寫。", false);
  addRow("DIY", item, `diy.${diyIndex}.price`, diy.price, "價格與單位需一起填寫；啟用前必須填寫。", false);
  addRow("DIY", item, `diy.${diyIndex}.tag`, diy.tag, "時長目前仍有待拍板資料，不可自行猜測。", false);
  addRow("DIY", item, `diy.${diyIndex}.group`, diy.group, "成團人數尚待拍板；修改前先確認最終數字。", false);
  addRow("DIY", item, `diy.${diyIndex}.image`, diy.image, "完整圖片網址，需以 https:// 開頭；啟用前必須填寫。", false);
});

data.qa.infoIcons.forEach((info, infoIndex) => {
  const item = info.title || `參觀資訊 ${infoIndex + 1}`;
  addRow("參觀資訊", item, `qa.infoIcons.${infoIndex}.title`, info.title, "資訊卡標題。", true);
  addRow("參觀資訊", item, `qa.infoIcons.${infoIndex}.text`, info.text, "資訊卡內容；請保留必要的 HTML 標記。", true);
});

data.qa.categories.forEach((category, categoryIndex) => {
  addRow("FAQ 分類", category.name, `qa.categories.${categoryIndex}.name`, category.name, "FAQ 分類名稱。", true);
  category.list.forEach((faq, faqIndex) => {
    const item = `${category.name}／第 ${faqIndex + 1} 題`;
    addRow("FAQ", item, `qa.categories.${categoryIndex}.list.${faqIndex}.q`, faq.q, "使用遊客會搜尋的完整問句。", true);
    if (Object.hasOwn(faq, "a")) {
      addRow("FAQ", item, `qa.categories.${categoryIndex}.list.${faqIndex}.a`, faq.a, "使用繁體中文與全形標點；請保留必要的 HTML 標記。", true);
    }
    (faq.rows || []).forEach((tableRow, rowIndex) => {
      addRow("FAQ", item, `qa.categories.${categoryIndex}.list.${faqIndex}.rows.${rowIndex}.label`, tableRow.label, "表格左欄標籤。", true);
      addRow("FAQ", item, `qa.categories.${categoryIndex}.list.${faqIndex}.rows.${rowIndex}.value`, tableRow.value, "表格主要內容。", true);
      addRow("FAQ", item, `qa.categories.${categoryIndex}.list.${faqIndex}.rows.${rowIndex}.note`, tableRow.note, "補充說明；沒有內容可留空。", false);
    });
  });
});

const isMain = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
const { SpreadsheetFile, Workbook } = await import("@oai/artifact-tool");
const workbook = Workbook.create();
const guideSheet = workbook.worksheets.add("操作說明");
const contentSheet = workbook.worksheets.add("內容資料");

guideSheet.showGridLines = false;
guideSheet.getRange("A1:F1").merge();
guideSheet.getRange("A1").values = [["大花農場內容後台｜操作說明"]];
guideSheet.getRange("A1:F1").format = {
  fill: "#F1F3F4",
  font: { bold: true, color: "#202124", size: 16 },
  verticalAlignment: "center",
};
guideSheet.getRange("A1:F1").format.rowHeightPx = 42;

const guideRows = [
  ["使用原則", "平常只修改「內容資料」分頁的 D 欄「目前值」。"],
  ["不可修改", "C 欄 key、E 欄類型與 H 欄 updatedAt 由系統使用，請勿自行更動。"],
  ["更新時間", "每次從網頁後台發布時，只更新該 key 所在列的 updatedAt。"],
  ["文字規範", "一律使用繁體中文與全形標點；電話固定為 08-810-1858／0987-019-118。"],
  ["品牌紅線", "農場只能寫「自然農法」。出現「有機／Organic」時必須先交由 Shao 核決。"],
  ["DIY 待拍板", "時長與成團人數尚未統一，沒有最終數字前不可自行修改。"],
  ["發布方式", "此表完成 Apps Script 部署後，由網頁載入；雲端失敗時仍會使用 data.js 內建值。"],
  ["欄位類型", "number 只填數字；boolean 只使用 TRUE／FALSE；string 可填文字或完整網址。"],
];
guideSheet.getRange(`A3:B${guideRows.length + 2}`).values = guideRows;
guideSheet.getRange(`A3:A${guideRows.length + 2}`).format = {
  fill: "#F8F9FA",
  font: { bold: true, color: "#3C4043" },
  verticalAlignment: "top",
};
guideSheet.getRange(`A3:B${guideRows.length + 2}`).format.wrapText = true;
guideSheet.getRange("A:A").format.columnWidthPx = 130;
guideSheet.getRange("B:B").format.columnWidthPx = 620;
guideSheet.getRange(`A3:B${guideRows.length + 2}`).format.autofitRows();
guideSheet.freezePanes.freezeRows(1);

contentSheet.showGridLines = false;
contentSheet.getRange("A1:I1").merge();
contentSheet.getRange("A1").values = [["大花農場內容資料｜一個 key 一列"]];
contentSheet.getRange("A1:I1").format = {
  fill: "#F1F3F4",
  font: { bold: true, color: "#202124", size: 15 },
  verticalAlignment: "center",
};
contentSheet.getRange("A1:I1").format.rowHeightPx = 40;
contentSheet.getRange("A2:I2").merge();
contentSheet.getRange("A2").values = [["只修改 D 欄目前值；C 欄 key 與 H 欄 updatedAt 請勿手動更動。"]];
contentSheet.getRange("A2:I2").format = {
  fill: "#FFF8E1",
  font: { color: "#5F4B00" },
};

const headers = [["區塊", "項目", "key", "目前值", "類型", "必填", "填寫說明", "updatedAt", "啟用"]];
contentSheet.getRange("A3:I3").values = headers;
contentSheet.getRange(`A4:I${rows.length + 3}`).values = rows;
contentSheet.getRange("A3:I3").format = {
  fill: "#E8EAED",
  font: { bold: true, color: "#202124" },
  verticalAlignment: "center",
};
contentSheet.getRange(`A3:I${rows.length + 3}`).format.wrapText = true;
contentSheet.getRange(`A4:I${rows.length + 3}`).format.verticalAlignment = "top";
contentSheet.getRange(`H4:H${rows.length + 3}`).format.numberFormat = "@";
contentSheet.getRange(`I4:I${rows.length + 3}`).format.horizontalAlignment = "center";
contentSheet.getRange(`E4:E${rows.length + 3}`).dataValidation = {
  rule: { type: "list", values: ["string", "number", "boolean"] },
};
contentSheet.getRange(`F4:F${rows.length + 3}`).dataValidation = {
  rule: { type: "list", values: ["是", "否"] },
};
contentSheet.getRange(`I4:I${rows.length + 3}`).dataValidation = {
  rule: { type: "list", values: [true, false] },
};
const contentTable = contentSheet.tables.add(`A3:I${rows.length + 3}`, true, "ContentData");
contentTable.style = "TableStyleLight1";
contentTable.showBandedColumns = false;
contentTable.showFilterButton = true;
contentSheet.freezePanes.freezeRows(3);
contentSheet.getRange("A:A").format.columnWidthPx = 105;
contentSheet.getRange("B:B").format.columnWidthPx = 190;
contentSheet.getRange("C:C").format.columnWidthPx = 360;
contentSheet.getRange("D:D").format.columnWidthPx = 430;
contentSheet.getRange("E:F").format.columnWidthPx = 85;
contentSheet.getRange("G:G").format.columnWidthPx = 300;
contentSheet.getRange("H:H").format.columnWidthPx = 190;
contentSheet.getRange("I:I").format.columnWidthPx = 70;
contentSheet.getRange(`A3:I${rows.length + 3}`).format.autofitRows();

await fs.mkdir(outputDir, { recursive: true });
const guidePreview = await workbook.render({
  sheetName: "操作說明",
  autoCrop: "all",
  scale: 1.25,
  format: "png",
});
await fs.writeFile(path.join(outputDir, "操作說明.png"), new Uint8Array(await guidePreview.arrayBuffer()));
const contentPreview = await workbook.render({
  sheetName: "內容資料",
  range: "A1:I24",
  scale: 1,
  format: "png",
});
await fs.writeFile(path.join(outputDir, "內容資料.png"), new Uint8Array(await contentPreview.arrayBuffer()));

const inspect = await workbook.inspect({
  kind: "table",
  range: "內容資料!A1:I15",
  include: "values,formulas",
  tableMaxRows: 15,
  tableMaxCols: 9,
});
console.log(inspect.ndjson);
const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "final formula error scan",
});
console.log(errors.ndjson);

const output = await SpreadsheetFile.exportXlsx(workbook);
const outputPath = path.join(outputDir, "大花農場內容後台範本.xlsx");
await output.save(outputPath);
console.log(JSON.stringify({ outputPath, rowCount: rows.length, sheetNames: ["操作說明", "內容資料"] }));
}

export { rows };
