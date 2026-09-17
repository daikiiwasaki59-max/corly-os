/**
 * CORLY OS ジャーナル → スプレッドシート「ジャーナル」自動追記スクリプト
 *
 * 日次 / 週次 / 月次 / PDCA の4種類を、それぞれ対応するタブへ1行ずつ追記します。
 * 書き込み先の列は「列の位置」ではなく「1行目の見出し名」で決めるため、
 * 列を入れ替えても壊れません。
 *
 * 設置手順は docs/journal-app.md を参照してください。
 */

// アプリ側が送ってくる sheet 名が見つからなかった場合の代替候補。
// （Googleフォームの回答タブは環境によって名前が揺れるため）
var SHEET_ALIASES = {
  'フォームの回答 1': ['フォームの回答 1', 'フォームの回答1', 'フォームの回答 2', 'PDCA', 'pdca'],
  'daily':   ['daily', '日次', 'デイリー'],
  'weekly':  ['weekly', '週次', 'ウィークリー'],
  'monthly': ['monthly', '月次', 'マンスリー']
};

var TIMESTAMP_HEADERS = ['タイムスタンプ', 'Timestamp', '送信日時'];

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var answers = data.answers || {};
    var sheet = resolveSheet_(data.sheet, answers);

    var headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    var row = new Array(headers.length).fill('');
    var matched = 0;

    for (var i = 0; i < headers.length; i++) {
      var header = normalize_(headers[i]);
      if (!header) continue;

      if (TIMESTAMP_HEADERS.indexOf(header) !== -1) {
        row[i] = new Date();
        continue;
      }

      var value = lookupAnswer_(answers, header);
      if (value !== null) {
        row[i] = coerce_(value);
        matched++;
      }
    }

    if (matched === 0) {
      throw new Error('見出しが1つも一致しませんでした。タブ「' + sheet.getName() + '」の1行目を確認してください。');
    }

    sheet.appendRow(row);
    return json_({ status: 'ok', sheet: sheet.getName(), columns: matched });
  } catch (err) {
    return json_({ status: 'error', message: String(err && err.message ? err.message : err) });
  }
}

/** 動作確認用。ブラウザでウェブアプリURLを開くと表示されます。 */
function doGet() {
  return json_({ status: 'ok', message: 'CORLY OS journal endpoint is alive.' });
}

/**
 * 送信された見出しのうち、シートの見出しと一致するものを探して値を返す。
 * Googleフォームが作った重複列（「Q1. 〜？ 2」のような末尾連番）にも同じ値を入れる。
 * 一致しなければ null。
 */
function lookupAnswer_(answers, sheetHeader) {
  var base = sheetHeader.replace(/\s+\d+$/, '');
  for (var key in answers) {
    if (!answers.hasOwnProperty(key)) continue;
    var k = normalize_(key);
    if (k === sheetHeader || k === base) {
      var v = answers[key];
      return (v === null || v === undefined) ? '' : v;
    }
  }
  return null;
}

/**
 * 「2026-09-17」形式の文字列は日付型に変換する。
 * 既存の「日付」列が日付型のため、文字列のまま入れると型が混ざって
 * 並べ替え・グラフが崩れる。それ以外の値はそのまま返す。
 */
function coerce_(value) {
  if (typeof value === 'string') {
    var m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  return value;
}

/** 前後の空白を落とし、連続空白を1つにまとめる */
function normalize_(value) {
  return String(value === null || value === undefined ? '' : value).replace(/\s+/g, ' ').trim();
}

/** タブ名を解決する。見つからなければ見出し付きで新規作成する。 */
function resolveSheet_(name, answers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var candidates = [name].concat(SHEET_ALIASES[name] || []);

  for (var i = 0; i < candidates.length; i++) {
    if (!candidates[i]) continue;
    var found = ss.getSheetByName(candidates[i]);
    if (found) return found;
  }

  // 該当タブが無い場合は、送られてきた見出しでタブを新規作成する
  var sheet = ss.insertSheet(name);
  var headers = ['タイムスタンプ'];
  for (var key in answers) {
    if (answers.hasOwnProperty(key)) headers.push(key);
  }
  sheet.appendRow(headers);
  return sheet;
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
