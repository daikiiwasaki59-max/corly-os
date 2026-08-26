/**
 * CORLY OS — 設定
 *
 * 秘密情報はこのファイルに書かない。すべて スクリプトプロパティ に入れる。
 * （Apps Script エディタ → 左の歯車「プロジェクトの設定」→ スクリプト プロパティ）
 *
 * 必須:
 *   API_TOKEN          ダッシュボードから叩くときの合言葉（自分で決める長い文字列）
 *   ANTHROPIC_API_KEY  Claude API キー
 *
 * 任意（使う販路のぶんだけ）:
 *   X_CLIENT_ID / X_CLIENT_SECRET / X_REFRESH_TOKEN
 *   THREADS_USER_ID / THREADS_ACCESS_TOKEN
 *   WP_BASE_URL / WP_USER / WP_APP_PASSWORD
 *   STRIPE_SECRET_KEY
 */

var CFG = {
  MODEL: 'claude-opus-5',
  ANTHROPIC_VERSION: '2023-06-01',
  TIMEZONE: 'Asia/Tokyo',

  // 1日あたり各部署に書かせる下書きの本数
  DRAFTS_PER_DEPT: 2,

  // 承認済みの下書きを1サイクルで何件まで投稿するか（レート制限よけ）
  PUBLISH_PER_RUN: 3
};

/** 部署定義。src/config/company.js の DEPARTMENTS と id を一致させる。 */
var DEPARTMENTS = [
  {
    id: 'affiliate',
    name: 'アフィリエイト部',
    reporter: 'sol',          // 報告グループで発言するAI社員のid
    channels: ['blog', 'x'],
    // このAI社員の人格・執筆方針
    brief: [
      'あなたはアフィリエイト記事を書くAI社員です。',
      '商品の比較・レビュー記事を、実際に使った人の視点で具体的に書きます。',
      '誇大表現・断定的な効果保証は書きません。景品表示法と薬機法に触れる表現を避けます。',
      'アフィリエイトリンクを含む記事には必ず「PR」表記を入れます。'
    ].join('\n')
  },
  {
    id: 'note',
    name: 'note販売部',
    reporter: 'nao',
    channels: ['note', 'x'],
    brief: [
      'あなたは note で有料記事を売るAI社員です。',
      '読者が今日から実行できる具体的な手順を、出し惜しみせず書きます。',
      '煽り・不安を煽る導入は使いません。実績を偽らず、再現性の条件を正直に書きます。'
    ].join('\n')
  },
  {
    id: 'content',
    name: 'コンテンツ販売部',
    reporter: 'kai',
    channels: ['lp', 'x', 'threads'],
    brief: [
      'あなたは自社コンテンツ（教材・テンプレート）を売るAI社員です。',
      '購入者が何を得られるかを、機能ではなく結果で書きます。',
      '返金条件・サポート範囲を明記し、誤解を生む表現を避けます。'
    ].join('\n')
  }
];

/**
 * 売上の取り込み元。
 *   kind: 'gmail'  … 受信したレポートメールから金額を拾う
 *   kind: 'stripe' … Stripe API から直接取得
 * 新しいASPを足すときはこの配列に1行足す。
 */
var REVENUE_SOURCES = [
  {
    id: 'a8',
    deptId: 'affiliate',
    kind: 'gmail',
    query: 'from:a8.net newer_than:2d',
    // 本文から「◯◯ 1,234円」形式を拾う。ASPのメール書式に合わせて調整すること。
    itemPattern: /^(.+?)\s+([\d,]+)\s*円/gm
  },
  {
    id: 'moshimo',
    deptId: 'affiliate',
    kind: 'gmail',
    query: 'from:moshimo.com newer_than:2d',
    itemPattern: /^(.+?)\s+([\d,]+)\s*円/gm
  },
  {
    id: 'note',
    deptId: 'note',
    kind: 'gmail',
    query: 'from:note.com subject:(購入 OR 売上) newer_than:2d',
    itemPattern: /「(.+?)」.*?([\d,]+)\s*円/gm
  },
  {
    id: 'stripe',
    deptId: 'content',
    kind: 'stripe'
  }
];

var DEPT_BY_ID = (function () {
  var m = {};
  DEPARTMENTS.forEach(function (d) { m[d.id] = d; });
  return m;
})();

function prop_(key, required) {
  var v = PropertiesService.getScriptProperties().getProperty(key);
  if (!v && required) throw new Error('スクリプトプロパティ ' + key + ' が未設定です');
  return v || '';
}

function today_() {
  return Utilities.formatDate(new Date(), CFG.TIMEZONE, 'yyyy-MM-dd');
}

function nowIso_() {
  return new Date().toISOString();
}

function uid_(prefix) {
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
