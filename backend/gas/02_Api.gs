/**
 * ダッシュボード用の HTTP API。
 * フロントは Content-Type: text/plain で POST する（プリフライト回避のため）。
 */

function doPost(e) {
  var req = {};
  try {
    req = JSON.parse(e.postData.contents || '{}');
  } catch (err) {
    return json_({ error: 'リクエストが JSON ではありません' });
  }

  var expected = prop_('API_TOKEN', true);
  if (String(req.token || '') !== expected) {
    return json_({ error: '認証に失敗しました（トークン不一致）' });
  }

  try {
    return json_(handle_(req.action, req));
  } catch (err) {
    log_('ERROR', 'doPost:' + req.action, err.stack || err);
    return json_({ error: String(err.message || err) });
  }
}

/** ブラウザで URL を直接開いたときの確認用 */
function doGet() {
  return json_({ ok: true, service: 'CORLY OS', date: today_() });
}

function handle_(action, req) {
  switch (action) {
    case 'ping':
      return { ok: true, date: today_() };

    case 'state':
      return buildState_(req.date || today_());

    case 'approve':
      return patchDraft_(req.id, { status: 'approved', error: '' });

    case 'reject':
      return patchDraft_(req.id, { status: 'rejected', error: req.reason || '' });

    case 'updateDraft': {
      var patch = {};
      if (req.title !== undefined) patch.title = req.title;
      if (req.body !== undefined) patch.body = req.body;
      return patchDraft_(req.id, patch);
    }

    case 'runAgents':
      return submitAgentBatch(req.deptId || null);

    case 'syncRevenue':
      return collectRevenue();

    case 'addRevenue':
      return addRevenueRow_(req);

    default:
      throw new Error('不明な action: ' + action);
  }
}

function patchDraft_(id, patch) {
  if (!id) throw new Error('id が指定されていません');
  if (!update_('drafts', id, patch)) throw new Error('下書きが見つかりません: ' + id);
  return { ok: true };
}

/** ダッシュボードが必要とする当日分を1回で返す */
function buildState_(date) {
  var revenue = readAll_('revenue').filter(function (r) {
    return String(r.date) === String(date) || fmtDate_(r.date) === date;
  });

  var byDept = {};
  DEPARTMENTS.forEach(function (d) { byDept[d.id] = { id: d.id, total: 0, count: 0, items: [] }; });

  revenue.forEach(function (r) {
    var d = byDept[r.deptId];
    if (!d) return;
    var amount = Number(r.amount) || 0;
    d.total += amount;
    d.count += 1;
    d.items.push({ label: String(r.item || r.source), amount: amount });
  });

  // 金額の大きい順に並べ替え（モニター表示用）
  Object.keys(byDept).forEach(function (k) {
    byDept[k].items.sort(function (a, b) { return b.amount - a.amount; });
  });

  return {
    date: date,
    departments: DEPARTMENTS.map(function (d) { return byDept[d.id]; }),
    feed: readTail_('feed', 40).map(function (f) {
      return { id: f.id, at: toIso_(f.at), author: f.author, deptId: f.deptId, text: f.text };
    }),
    ticker: readTail_('ticker', 20).reverse().map(function (t) {
      return { at: toIso_(t.at), deptId: t.deptId, text: t.text, amount: Number(t.amount) || 0 };
    }),
    drafts: readAll_('drafts')
      .filter(function (d) { return d.status !== 'rejected'; })
      .slice(-40)
      .reverse()
      .map(function (d) {
        return {
          id: d.id, createdAt: toIso_(d.createdAt), deptId: d.deptId, channel: d.channel,
          title: d.title, body: d.body, status: d.status,
          publishedAt: toIso_(d.publishedAt), url: d.url, error: d.error
        };
      })
  };
}

function addRevenueRow_(req) {
  if (!DEPT_BY_ID[req.deptId]) throw new Error('不明な deptId: ' + req.deptId);
  var row = {
    id: uid_('rev'),
    at: nowIso_(),
    date: req.date || today_(),
    deptId: req.deptId,
    source: req.source || 'manual',
    item: req.item || '手動記録',
    amount: Number(req.amount) || 0,
    note: req.note || ''
  };
  append_('revenue', row);
  pushTicker_(row.deptId, row.item, row.amount);
  return { ok: true, id: row.id };
}

function pushTicker_(deptId, text, amount) {
  append_('ticker', { at: nowIso_(), deptId: deptId, text: text, amount: amount || 0 });
}

function pushFeed_(author, deptId, text) {
  append_('feed', { id: uid_('f'), at: nowIso_(), author: author, deptId: deptId || '', text: text });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function toIso_(v) {
  if (!v) return '';
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

function fmtDate_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, CFG.TIMEZONE, 'yyyy-MM-dd');
  return String(v || '').slice(0, 10);
}
