/**
 * 承認済みの下書きを実際に投稿する部分。
 *
 * 「承認済み(approved)」のものだけを投稿する。AIが書いたものが人の確認なしに
 * 世に出ることはない。note のように API のない販路は manual 扱いで、
 * ダッシュボードから本文をコピーして人が公開する。
 *
 * 各SNSの制約と申請方法は docs/INTEGRATIONS.md にまとめてある。
 */

/** トリガーから定期実行。承認済みを少しずつ投稿する。 */
function publishApproved() {
  var queue = readAll_('drafts')
    .filter(function (d) { return d.status === 'approved'; })
    .slice(0, CFG.PUBLISH_PER_RUN);

  if (queue.length === 0) return { ok: true, published: 0 };

  var published = 0;
  queue.forEach(function (d) {
    var publisher = PUBLISHERS[d.channel];

    if (!publisher) {
      // API のない販路。人が公開するまで待つ。
      update_('drafts', d.id, { status: 'manual', error: 'この販路は手動公開です' });
      return;
    }

    try {
      var url = publisher(d);
      update_('drafts', d.id, { status: 'published', publishedAt: nowIso_(), url: url || '', error: '' });
      pushTicker_(d.deptId, (d.title || d.body).toString().slice(0, 28) + ' を投稿', 0);
      published++;
    } catch (err) {
      update_('drafts', d.id, { status: 'failed', error: String(err.message || err).slice(0, 400) });
      log_('ERROR', 'publish:' + d.channel, err.stack || err);
    }
  });

  if (published > 0) pushFeed_('fable', '', published + '本 投稿しました');
  return { ok: true, published: published };
}

var PUBLISHERS = {
  x: publishToX_,
  threads: publishToThreads_,
  blog: publishToWordPress_,
  lp: publishToWordPress_
  // note: API が公開されていないため未対応（手動公開）
};

// ── X（旧Twitter） ───────────────────────────────────────────────
// OAuth 2.0 のリフレッシュトークン方式。X はリフレッシュトークンを
// 使うたびに新しいものを返す（ローテーション）ので、必ず保存し直すこと。
function xAccessToken_() {
  var clientId = prop_('X_CLIENT_ID', true);
  var clientSecret = prop_('X_CLIENT_SECRET', true);
  var refresh = prop_('X_REFRESH_TOKEN', true);

  var res = fetchJson_('https://api.x.com/2/oauth2/token', {
    method: 'post',
    headers: {
      Authorization: 'Basic ' + Utilities.base64Encode(clientId + ':' + clientSecret),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    payload: {
      grant_type: 'refresh_token',
      refresh_token: refresh,
      client_id: clientId
    }
  });

  if (res.refresh_token) {
    PropertiesService.getScriptProperties().setProperty('X_REFRESH_TOKEN', res.refresh_token);
  }
  return res.access_token;
}

function publishToX_(draft) {
  var text = String(draft.body || '').trim();
  if (text.length > 280) text = text.slice(0, 279) + '…';

  var res = fetchJson_('https://api.x.com/2/tweets', {
    method: 'post',
    headers: { Authorization: 'Bearer ' + xAccessToken_(), 'Content-Type': 'application/json' },
    payload: JSON.stringify({ text: text })
  });
  var id = res.data && res.data.id;
  return id ? 'https://x.com/i/status/' + id : '';
}

// ── Threads ────────────────────────────────────────────────────
// 2段階（コンテナ作成 → 公開）。作成直後は反映待ちがあるため少し待つ。
function publishToThreads_(draft) {
  var userId = prop_('THREADS_USER_ID', true);
  var token = prop_('THREADS_ACCESS_TOKEN', true);
  var base = 'https://graph.threads.net/v1.0/' + userId;

  var created = fetchJson_(base + '/threads', {
    method: 'post',
    payload: { media_type: 'TEXT', text: String(draft.body || '').slice(0, 500), access_token: token }
  });
  if (!created.id) throw new Error('Threads: コンテナ作成に失敗');

  Utilities.sleep(3000);

  var published = fetchJson_(base + '/threads_publish', {
    method: 'post',
    payload: { creation_id: created.id, access_token: token }
  });
  return published.id ? 'https://www.threads.net/@me/post/' + published.id : '';
}

// ── WordPress（ブログ / LP） ────────────────────────────────────
// アプリケーションパスワードを使った Basic 認証。
function publishToWordPress_(draft) {
  var base = prop_('WP_BASE_URL', true).replace(/\/$/, '');
  var user = prop_('WP_USER', true);
  var pass = prop_('WP_APP_PASSWORD', true);

  var res = fetchJson_(base + '/wp-json/wp/v2/posts', {
    method: 'post',
    headers: {
      Authorization: 'Basic ' + Utilities.base64Encode(user + ':' + pass),
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify({
      title: draft.title || '(無題)',
      content: String(draft.body || ''),
      status: 'publish'
    })
  });
  return res.link || '';
}
