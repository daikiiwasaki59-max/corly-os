/**
 * 画像の「売上報告グループ」を作る部分。
 * 監督AI(Fable)が各部に聞き、各部のAI社員が本日の数字を答える、という
 * やりとりを feed シートに書き込む。ダッシュボードはそれを読んで表示する。
 */

function dailyReport() {
  var date = today_();
  var revenue = readAll_('revenue').filter(function (r) { return fmtDate_(r.date) === date; });

  var totals = {};
  DEPARTMENTS.forEach(function (d) { totals[d.id] = 0; });
  revenue.forEach(function (r) {
    if (totals[r.deptId] !== undefined) totals[r.deptId] += Number(r.amount) || 0;
  });

  pushFeed_('fable', '', '承知しました🙌 各部に聞いてきます');

  var grand = 0;
  DEPARTMENTS.forEach(function (dept) {
    var amount = totals[dept.id];
    grand += amount;
    pushFeed_('fable', '', dept.name.replace(/部$/, '') + 'どう？');
    pushFeed_(dept.reporter, dept.id, '本日 ' + yen_(amount) + ' でした！');
  });

  pushFeed_('fable', '', '本日の合計は ' + yen_(grand) + ' です。お疲れさまでした！');
  log_('INFO', 'dailyReport', date + ' 合計 ' + grand);
  return { ok: true, date: date, total: grand };
}

/** 承認待ちが溜まっていたら社長に催促する */
function nudgePendingDrafts() {
  var pending = readAll_('drafts').filter(function (d) { return d.status === 'draft'; });
  if (pending.length === 0) return { ok: true, pending: 0 };

  pushFeed_('fable', '', '承認待ちが ' + pending.length + '本 あります。確認をお願いします🙏');
  return { ok: true, pending: pending.length };
}

function yen_(n) {
  return '¥' + Math.round(Number(n) || 0).toLocaleString('ja-JP');
}
