/**
 * スプレッドシートを DB として使うための薄いラッパー。
 * シートは初回アクセス時に自動生成される。
 */

var SCHEMA = {
  revenue: ['id', 'at', 'date', 'deptId', 'source', 'item', 'amount', 'note'],
  drafts: ['id', 'createdAt', 'deptId', 'channel', 'title', 'body', 'status', 'publishedAt', 'url', 'error'],
  feed: ['id', 'at', 'author', 'deptId', 'text'],
  ticker: ['at', 'deptId', 'text', 'amount'],
  batches: ['batchId', 'at', 'deptId', 'status'],
  log: ['at', 'level', 'where', 'message']
};

function ss_() {
  var id = prop_('SPREADSHEET_ID', false);
  return id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
}

function sheet_(name) {
  var ss = ss_();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(SCHEMA[name]);
    sh.setFrozenRows(1);
  }
  return sh;
}

/** シート全体をオブジェクト配列で読む */
function readAll_(name) {
  var sh = sheet_(name);
  var last = sh.getLastRow();
  if (last < 2) return [];
  var cols = SCHEMA[name];
  var values = sh.getRange(2, 1, last - 1, cols.length).getValues();
  return values.map(function (row, i) {
    var o = { _row: i + 2 };
    cols.forEach(function (c, j) { o[c] = row[j]; });
    return o;
  });
}

function append_(name, obj) {
  var cols = SCHEMA[name];
  sheet_(name).appendRow(cols.map(function (c) {
    return obj[c] === undefined || obj[c] === null ? '' : obj[c];
  }));
  return obj;
}

/** id 一致の行を部分更新する */
function update_(name, id, patch) {
  var cols = SCHEMA[name];
  var idCol = cols.indexOf('id');
  if (idCol < 0) throw new Error(name + ' に id 列がありません');

  var sh = sheet_(name);
  var last = sh.getLastRow();
  if (last < 2) return null;

  var ids = sh.getRange(2, idCol + 1, last - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) !== String(id)) continue;
    var row = i + 2;
    Object.keys(patch).forEach(function (k) {
      var c = cols.indexOf(k);
      // undefined を setValue に渡すと落ちるので、明示された値だけ書く
      if (c >= 0 && patch[k] !== undefined) sh.getRange(row, c + 1).setValue(patch[k]);
    });
    return row;
  }
  return null;
}

/** 直近 n 行だけ読む（フィードやログ用） */
function readTail_(name, n) {
  var all = readAll_(name);
  return all.slice(Math.max(0, all.length - n));
}

function log_(level, where, message) {
  try {
    append_('log', { at: nowIso_(), level: level, where: where, message: String(message).slice(0, 900) });
  } catch (e) {
    console.error(where + ': ' + message);
  }
}
