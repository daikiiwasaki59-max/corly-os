/**
 * AI社員に記事・投稿を書かせる部分。
 *
 * Apps Script の UrlFetchApp は 1リクエスト約60秒で打ち切られるため、
 * Claude を同期で呼ぶと長い記事の生成でタイムアウトする。
 * そこで Message Batches API を使い「投げる」と「受け取る」を別トリガーに分ける。
 *   submitAgentBatch()  … 朝1回。全部署ぶんをまとめて投げる（即返る）
 *   pollAgentBatches()  … 10分おき。終わったバッチの結果を drafts に書き込む
 * バッチは同期実行より料金が50%安いという副次的な利点もある。
 */

var ANTHROPIC_BASE = 'https://api.anthropic.com/v1';

function anthropicHeaders_() {
  return {
    'x-api-key': prop_('ANTHROPIC_API_KEY', true),
    'anthropic-version': CFG.ANTHROPIC_VERSION,
    'content-type': 'application/json'
  };
}

/** 全部署（または指定部署）の執筆リクエストを1つのバッチにまとめて投入する */
function submitAgentBatch(deptId) {
  var depts = deptId ? [DEPT_BY_ID[deptId]] : DEPARTMENTS;
  if (!depts[0]) throw new Error('不明な deptId: ' + deptId);

  var requests = [];
  depts.forEach(function (dept) {
    dept.channels.forEach(function (channel) {
      for (var i = 0; i < CFG.DRAFTS_PER_DEPT; i++) {
        requests.push({
          custom_id: [dept.id, channel, i, Date.now().toString(36)].join('__'),
          params: buildParams_(dept, channel)
        });
      }
    });
  });

  var res = fetchJson_(ANTHROPIC_BASE + '/messages/batches', {
    method: 'post',
    headers: anthropicHeaders_(),
    payload: JSON.stringify({ requests: requests })
  });

  append_('batches', {
    batchId: res.id,
    at: nowIso_(),
    deptId: deptId || 'all',
    status: res.processing_status || 'in_progress'
  });

  pushFeed_('fable', '', '各部に執筆を指示しました（' + requests.length + '本）');
  log_('INFO', 'submitAgentBatch', res.id + ' / ' + requests.length + ' requests');
  return { ok: true, batchId: res.id, requests: requests.length };
}

/** 1リクエスト分の Messages API パラメータを組み立てる */
function buildParams_(dept, channel) {
  var spec = channelSpec_(channel);

  return {
    model: CFG.MODEL,
    max_tokens: 8000,
    // 4.6以降のモデルは adaptive thinking を使う（budget_tokens は廃止）
    thinking: { type: 'adaptive' },
    system: [
      {
        type: 'text',
        text: HOUSE_RULES + '\n\n---\n\n' + dept.brief,
        // 部署ごとに同じ前置きを複数リクエストで使い回すためキャッシュを効かせる
        cache_control: { type: 'ephemeral' }
      }
    ],
    messages: [
      {
        role: 'user',
        content: [
          '今日の' + spec.label + '向けの下書きを1本書いてください。',
          '',
          '# 制約',
          spec.constraint,
          '',
          '# 出力形式',
          'JSON のみを出力してください。前後に説明文やコードフェンスを付けないこと。',
          '{"title": "タイトル（' + (spec.needsTitle ? '必須' : '空文字で可') + '）", "body": "本文"}'
        ].join('\n')
      }
    ]
  };
}

var HOUSE_RULES = [
  'あなたは日本語で執筆するAI社員です。以下は会社全体の編集方針です。',
  '',
  '- 事実でないことを事実として書かない。数字を出すときは出典か前提条件を添える。',
  '- 実績・体験を捏造しない。持っていない実績は書かない。',
  '- 「必ず稼げる」「誰でも」など、根拠のない断定や効果保証は書かない。',
  '- 医療・健康・金融に関わる話題では、専門家への相談を促す一文を入れる。',
  '- 広告・アフィリエイトを含む場合は冒頭に「PR」と明記する。',
  '- 他人の文章をそのまま引き写さない。'
].join('\n');

function channelSpec_(channel) {
  switch (channel) {
    case 'x':
      return { label: 'X（旧Twitter）投稿', needsTitle: false,
        constraint: '- 本文は日本語で140文字以内。\n- ハッシュタグは多くても2個。\n- URLは含めない（投稿時に自動で付与する）。' };
    case 'threads':
      return { label: 'Threads投稿', needsTitle: false,
        constraint: '- 本文は日本語で480文字以内。\n- 会話を誘う問いかけで締める。' };
    case 'note':
      return { label: 'note有料記事', needsTitle: true,
        constraint: '- 本文は2000〜4000字。\n- 見出しを3〜5個立て、手順は番号付きリストで書く。\n- 冒頭800字は無料部分として単体で価値が伝わるようにする。' };
    case 'blog':
      return { label: 'ブログ記事', needsTitle: true,
        constraint: '- 本文は2500〜5000字。\n- 見出しはMarkdownの##で作る。\n- 比較表が有効な場合はMarkdownの表を使う。' };
    case 'lp':
      return { label: '販売ページ（LP）の本文', needsTitle: true,
        constraint: '- 「誰の何が変わるか」を最初の3行で示す。\n- 返金条件とサポート範囲を必ず書く。' };
    default:
      return { label: channel, needsTitle: true, constraint: '- 読みやすい日本語で書く。' };
  }
}

/** 終了したバッチを回収して drafts に落とす */
function pollAgentBatches() {
  var pending = readAll_('batches').filter(function (b) { return b.status !== 'done'; });
  if (pending.length === 0) return { ok: true, collected: 0 };

  var collected = 0;
  pending.forEach(function (b) {
    var info;
    try {
      info = fetchJson_(ANTHROPIC_BASE + '/messages/batches/' + b.batchId, {
        method: 'get', headers: anthropicHeaders_()
      });
    } catch (err) {
      log_('ERROR', 'pollAgentBatches', b.batchId + ': ' + err);
      return;
    }
    if (info.processing_status !== 'ended') return;

    collected += ingestBatchResults_(info.results_url);
    updateBatchStatus_(b.batchId, 'done');
  });

  if (collected > 0) {
    pushFeed_('fable', '', '下書きが ' + collected + '本 上がりました。承認をお願いします🙏');
  }
  return { ok: true, collected: collected };
}

function updateBatchStatus_(batchId, status) {
  var sh = sheet_('batches');
  var last = sh.getLastRow();
  if (last < 2) return;
  var ids = sh.getRange(2, 1, last - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(batchId)) {
      sh.getRange(i + 2, SCHEMA.batches.indexOf('status') + 1).setValue(status);
      return;
    }
  }
}

/** results_url は JSONL。1行1リクエストの結果。 */
function ingestBatchResults_(resultsUrl) {
  var text = UrlFetchApp.fetch(resultsUrl, {
    method: 'get', headers: anthropicHeaders_(), muteHttpExceptions: true
  }).getContentText();

  var n = 0;
  text.split('\n').forEach(function (line) {
    if (!line.trim()) return;
    var row;
    try { row = JSON.parse(line); } catch (e) { return; }

    if (!row.result || row.result.type !== 'succeeded') {
      log_('WARN', 'batchResult', row.custom_id + ': ' + JSON.stringify(row.result || {}).slice(0, 300));
      return;
    }

    var parts = String(row.custom_id).split('__');
    var deptId = parts[0], channel = parts[1];
    var parsed = parseDraft_(row.result.message);
    if (!parsed) {
      log_('WARN', 'batchResult', row.custom_id + ': 本文を取り出せませんでした');
      return;
    }

    append_('drafts', {
      id: uid_('d'),
      createdAt: nowIso_(),
      deptId: deptId,
      channel: channel,
      title: parsed.title || '',
      body: parsed.body || '',
      status: 'draft',
      publishedAt: '', url: '', error: ''
    });
    n++;
  });
  return n;
}

/**
 * レスポンスから {title, body} を取り出す。
 * JSON で返すよう指示しているが、前後に文が付く場合に備えて最初の { … } を拾う。
 */
function parseDraft_(message) {
  var text = (message.content || [])
    .filter(function (b) { return b.type === 'text'; })
    .map(function (b) { return b.text; })
    .join('\n')
    .trim();
  if (!text) return null;

  var start = text.indexOf('{');
  var end = text.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try {
      var o = JSON.parse(text.slice(start, end + 1));
      if (o && typeof o.body === 'string') return { title: o.title || '', body: o.body };
    } catch (e) { /* JSONとして読めなければ本文そのものを使う */ }
  }
  return { title: '', body: text };
}

/** UrlFetch + JSON パース + エラーを読める形にする共通処理 */
function fetchJson_(url, options) {
  options.muteHttpExceptions = true;
  var res = UrlFetchApp.fetch(url, options);
  var code = res.getResponseCode();
  var body = res.getContentText();

  if (code < 200 || code >= 300) {
    throw new Error('HTTP ' + code + ' ' + url + ' → ' + body.slice(0, 500));
  }
  try {
    return JSON.parse(body);
  } catch (e) {
    throw new Error('JSONとして読めない応答: ' + body.slice(0, 300));
  }
}
