/**
 * 自動運転のスケジュール設定。
 *
 * Apps Script のエディタで installTriggers を1回だけ実行すれば、
 * 以後この時間割で会社が勝手に回る。
 * 時間割を変えたあとは、もう一度 installTriggers を実行し直すこと
 * （古いトリガーは中で消してから貼り直している）。
 */

function installTriggers() {
  ScriptApp.getProjectTriggers().forEach(function (t) { ScriptApp.deleteTrigger(t); });

  // 朝6時：各部のAI社員に今日ぶんの下書きを書かせる
  ScriptApp.newTrigger('dailyAgentRun').timeBased().atHour(6).everyDays(1).create();

  // 10分おき：書き上がったバッチを回収して承認キューに積む
  ScriptApp.newTrigger('pollAgentBatches').timeBased().everyMinutes(10).create();

  // 15分おき：承認済みを投稿する
  ScriptApp.newTrigger('publishApproved').timeBased().everyMinutes(15).create();

  // 1時間おき：売上レポートを取り込む
  ScriptApp.newTrigger('collectRevenue').timeBased().everyHours(1).create();

  // 昼12時：承認待ちが溜まっていたら催促
  ScriptApp.newTrigger('nudgePendingDrafts').timeBased().atHour(12).everyDays(1).create();

  // 夜19時：その日の売上報告をグループに流す
  ScriptApp.newTrigger('dailyReport').timeBased().atHour(19).everyDays(1).create();

  log_('INFO', 'installTriggers', 'トリガーを再設定しました');
  return { ok: true, triggers: ScriptApp.getProjectTriggers().length };
}

/** トリガーはイベントオブジェクトを渡してくるので、引数なしで呼ぶ入口を用意する */
function dailyAgentRun() {
  return submitAgentBatch(null);
}

/** 設置直後の動作確認用。エディタから実行してログを見る。 */
function selfTest() {
  var checks = [];

  function check(label, fn) {
    try { fn(); checks.push('OK   ' + label); }
    catch (e) { checks.push('NG   ' + label + ' → ' + (e.message || e)); }
  }

  check('スプレッドシート書き込み', function () { sheet_('log'); });
  check('API_TOKEN', function () { prop_('API_TOKEN', true); });
  check('ANTHROPIC_API_KEY', function () { prop_('ANTHROPIC_API_KEY', true); });
  check('Claude API 疎通', function () {
    fetchJson_(ANTHROPIC_BASE + '/models?limit=1', {
      method: 'get',
      headers: { 'x-api-key': prop_('ANTHROPIC_API_KEY', true), 'anthropic-version': CFG.ANTHROPIC_VERSION }
    });
  });

  // 任意設定は未設定でも失格にしない
  ['X_REFRESH_TOKEN', 'THREADS_ACCESS_TOKEN', 'WP_APP_PASSWORD', 'STRIPE_SECRET_KEY'].forEach(function (k) {
    checks.push((prop_(k, false) ? 'OK   ' : '--   ') + k + '（任意）');
  });

  var report = checks.join('\n');
  console.log(report);
  return report;
}
