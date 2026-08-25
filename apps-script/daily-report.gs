/**
 * CORLY OS 日報 → スプレッドシート自動追記スクリプト
 * 設置方法は docs/daily-report-sheet-sync.md を参照してください。
 */
function doPost(e) {
  var sheetName = "日報";
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "送信日時", "日付", "飛び込み訪問", "電話架電", "メール送信", "DM送信", "成約",
      "今日の所感・メモ", "明日のアクション"
    ]);
  }

  var data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    new Date(),
    data.date || "",
    data.visits || 0,
    data.calls || 0,
    data.emails || 0,
    data.dms || 0,
    data.deals || 0,
    data.memo || "",
    data.next || ""
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}
