/**
 * 売上の自動取り込み。
 *
 * 取り込み方は2通り:
 *   stripe … API から確実に取れる。決済系はこちらが正確。
 *   gmail  … ASP から届く成果レポートメールを正規表現で読む。
 *            メールの書式が変わると壊れるので、金額が合わないときはまず
 *            00_Config.gs の itemPattern を疑うこと。
 *
 * どちらも取れない販路（note など）は、ダッシュボードの手動記録か
 * スプレッドシートの revenue シートに直接1行足せばそのまま集計に乗る。
 */

function collectRevenue() {
  var existing = {};
  readAll_('revenue').forEach(function (r) { existing[String(r.id)] = true; });

  var added = 0;
  REVENUE_SOURCES.forEach(function (src) {
    try {
      var rows = src.kind === 'stripe' ? fetchStripe_(src) : fetchGmail_(src);
      rows.forEach(function (row) {
        if (existing[row.id]) return;      // 取り込み済みは飛ばす
        append_('revenue', row);
        pushTicker_(row.deptId, row.item, row.amount);
        existing[row.id] = true;
        added++;
      });
    } catch (err) {
      log_('ERROR', 'collectRevenue:' + src.id, err.stack || err);
    }
  });

  log_('INFO', 'collectRevenue', added + ' 件追加');
  return { ok: true, added: added };
}

// ── Stripe ─────────────────────────────────────────────────────
function fetchStripe_(src) {
  var key = prop_('STRIPE_SECRET_KEY', true);
  var since = Math.floor(Date.now() / 1000) - 60 * 60 * 26;   // 直近26時間

  var res = fetchJson_(
    'https://api.stripe.com/v1/charges?limit=100&created%5Bgte%5D=' + since,
    { method: 'get', headers: { Authorization: 'Bearer ' + key } }
  );

  return (res.data || [])
    .filter(function (c) { return c.paid && !c.refunded; })
    .map(function (c) {
      var at = new Date(c.created * 1000);
      return {
        id: 'stripe_' + c.id,
        at: at.toISOString(),
        date: Utilities.formatDate(at, CFG.TIMEZONE, 'yyyy-MM-dd'),
        deptId: src.deptId,
        source: 'stripe',
        // JPY は最小単位が「円」なので amount がそのまま円。
        // USD 等を扱う場合は通貨ごとに 100 で割る処理が要る。
        item: c.description || 'Stripe決済',
        amount: c.currency === 'jpy' ? c.amount : c.amount / 100,
        note: c.currency
      };
    });
}

// ── Gmail（ASPレポートメール） ──────────────────────────────────
function fetchGmail_(src) {
  var threads = GmailApp.search(src.query, 0, 20);
  var rows = [];

  threads.forEach(function (thread) {
    thread.getMessages().forEach(function (msg) {
      var body = msg.getPlainBody();
      var at = msg.getDate();
      var pattern = new RegExp(src.itemPattern.source, src.itemPattern.flags);
      var m, i = 0;

      while ((m = pattern.exec(body)) !== null) {
        var amount = Number(String(m[2]).replace(/,/g, ''));
        if (!amount) { i++; continue; }
        rows.push({
          id: 'gmail_' + msg.getId() + '_' + i,
          at: at.toISOString(),
          date: Utilities.formatDate(at, CFG.TIMEZONE, 'yyyy-MM-dd'),
          deptId: src.deptId,
          source: src.id,
          item: String(m[1]).trim().slice(0, 80),
          amount: amount,
          note: ''
        });
        i++;
        if (i > 200) break;   // 暴走よけ
      }
    });
  });

  return rows;
}
