/**
 * CORLY OS 正データ用スプレッドシートの雛形を作る。
 * 使い方: docs/setup-phase0.md を参照。setupCorlySheets() を1回実行する。
 * 既にあるシートは触らない（見出しの上書きもしない）。
 */
var CORLY_SHEETS = {
  "取引先": [
    "取引先ID","事業","会社名","業種","都道府県","市区町村","住所",
    "決裁者役職","決裁者氏名","電話","メール","LINE","Instagram","X","URL",
    "紹介元","ステージ","優先度","連絡NG","反社チェック日","リスト出所",
    "取込日","最終接触日","次アクション","次アクション期限","メモ","重複キー"
  ],
  "案件": [
    "案件ID","取引先ID","商材","ステージ","月額","単発金額","確度",
    "次アクション","期限","失注理由","成約日","開始日","LIOAS送客日","LIOAS契約状況"
  ],
  "活動": [
    "活動ID","日時","取引先ID","案件ID","チャネル","結果","メモ","次アクション","期限","記録者"
  ],
  "見積": [
    "見積ID","案件ID","明細","小計","消費税","合計","有効期限","発行状態","ファイルURL"
  ],
  "請求": [
    "請求ID","案件ID","freee請求書ID","金額","発行日","支払期日","入金日","状態"
  ],
  "価格表": [
    "商材コード","商材名","単価","単位","原価","条件","区分","更新日"
  ],
  "承認待ち": [
    "依頼日時","役職","行為","宛先","内容","下書きの場所","理由","リスク","状態","岩崎メモ","処理日時"
  ],
  "日報": [
    "日付","訪問","架電","メール送信","DM送信","アポ獲得","成約","所感","明日のアクション","記録者"
  ]
};

var CORLY_VALIDATIONS = {
  "取引先": {
    "事業": ["清掃","燃料","両方"],
    "ステージ": ["未接触","初回接触","提案済","交渉中","成約","失注"],
    "優先度": ["高","中","低"],
    "リスト出所": ["自作","購入","LIOAS提供","紹介","Web"]
  },
  "案件": {
    "商材": ["清掃","燃料"],
    "ステージ": ["未接触","初回接触","提案済","交渉中","成約","失注"],
    "確度": ["高","中","低"],
    "失注理由": ["価格","時期","既存契約","不要","不明"]
  },
  "活動": {
    "チャネル": ["飛び込み","電話","メール","LINE","Instagram","X","紹介","Web問い合わせ"],
    "結果": ["会えた・話した","留守・不在","折り返し依頼","資料送付済","DM送信済","断られた"],
    "記録者": ["岩崎","AI"]
  },
  "見積": { "発行状態": ["下書き","承認","送付"] },
  "請求": { "状態": ["下書き","発行","入金済","督促中"] },
  "価格表": { "区分": ["実績値","仮置き"] },
  "承認待ち": { "状態": ["待ち","承認","修正","却下"] },
  "日報": { "記録者": ["岩崎","AI"] }
};

function setupCorlySheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var created = [];
  Object.keys(CORLY_SHEETS).forEach(function (name) {
    if (ss.getSheetByName(name)) return;
    var sheet = ss.insertSheet(name);
    var headers = CORLY_SHEETS[name];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");
    sheet.setFrozenRows(1);
    var rules = CORLY_VALIDATIONS[name] || {};
    Object.keys(rules).forEach(function (col) {
      var idx = headers.indexOf(col);
      if (idx < 0) return;
      var rule = SpreadsheetApp.newDataValidation().requireValueInList(rules[col], true).build();
      sheet.getRange(2, idx + 1, sheet.getMaxRows() - 1, 1).setDataValidation(rule);
    });
    if (name === "取引先") {
      var ngIdx = headers.indexOf("連絡NG");
      sheet.getRange(2, ngIdx + 1, sheet.getMaxRows() - 1, 1).insertCheckboxes();
    }
    created.push(name);
  });
  var first = ss.getSheets()[0];
  if (first.getName() === "シート1" && first.getLastRow() === 0 && ss.getSheets().length > 1) {
    ss.deleteSheet(first);
  }
  Logger.log("作成したシート: " + (created.length ? created.join(", ") : "なし（全て既存）"));
}
