// ── バックエンド接続層 ────────────────────────────────────────────
// 接続先は Google Apps Script のウェブアプリURL。
// 未設定の場合はデモデータで動作する（設定画面から後付けできる）。
//
// CORS メモ:
//   GET  … Apps Script は Access-Control-Allow-Origin:* を返すのでそのまま叩ける
//   POST … Content-Type を text/plain にすることでプリフライトを回避する
//           （application/json にすると OPTIONS が飛び、Apps Script が返せず失敗する）

const LS_URL = "corly.api.url";
const LS_TOKEN = "corly.api.token";

export const getEndpoint = () => localStorage.getItem(LS_URL) || import.meta.env.VITE_API_URL || "";
export const getToken = () => localStorage.getItem(LS_TOKEN) || "";

export const setEndpoint = (url) => localStorage.setItem(LS_URL, url.trim());
export const setToken = (t) => localStorage.setItem(LS_TOKEN, t.trim());

export const isConnected = () => Boolean(getEndpoint());

async function call(action, payload = {}) {
  const base = getEndpoint();
  if (!base) throw new Error("NOT_CONNECTED");

  const res = await fetch(base, {
    method: "POST",
    // text/plain でプリフライトを回避（本文は JSON 文字列）
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, token: getToken(), ...payload }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json;
}

/** ダッシュボード表示に必要な当日分の状態をまとめて取得 */
export const fetchState = (date) => call("state", { date });

/** 下書きを承認 → 次回の publish サイクルで自動投稿される */
export const approveDraft = (id) => call("approve", { id });

/** 下書きを却下 */
export const rejectDraft = (id, reason = "") => call("reject", { id, reason });

/** 下書き本文を編集して保存 */
export const updateDraft = (id, patch) => call("updateDraft", { id, ...patch });

/** AI社員に今すぐ執筆させる（バッチ投入） */
export const runAgents = (deptId) => call("runAgents", { deptId });

/** 売上レポートの取り込みを今すぐ実行 */
export const syncRevenue = () => call("syncRevenue");

/** 手動で売上を1件記録する（API のない販路用） */
export const addRevenue = (row) => call("addRevenue", row);

export const ping = () => call("ping");
