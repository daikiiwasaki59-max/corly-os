import { useState } from "react";
import * as api from "../lib/api.js";
import { CHANNELS, DEPARTMENTS } from "../config/company.js";

export default function SettingsScreen({ onReload }) {
  const [url, setUrl] = useState(api.getEndpoint());
  const [token, setToken] = useState(api.getToken());
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    api.setEndpoint(url);
    api.setToken(token);
    setBusy(true);
    setMsg(null);
    try {
      await api.ping();
      setMsg({ kind: "ok", text: "接続できました。データを取得します。" });
      onReload();
    } catch (e) {
      setMsg({ kind: "err", text: `接続できませんでした：${e.message}` });
    } finally {
      setBusy(false);
    }
  };

  const trigger = async (label, fn) => {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
      setMsg({ kind: "ok", text: `${label}を実行しました。` });
      onReload();
    } catch (e) {
      setMsg({ kind: "err", text: `${label}に失敗：${e.message}` });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-title">⚙️ 設定</div>
        <div className="page-sub">
          バックエンド（Google Apps Script ウェブアプリ）の接続先を設定します。
          <br />
          設置手順は docs/SETUP.md を参照してください。
        </div>
      </div>

      {msg && <div className={`banner ${msg.kind}`}>{msg.text}</div>}

      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-body">
          <label className="field">
            <span className="field-label">ウェブアプリURL</span>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/XXXX/exec"
            />
            <span className="field-hint">
              Apps Script を「ウェブアプリ」としてデプロイしたときに発行されるURLです。
            </span>
          </label>

          <label className="field">
            <span className="field-label">アクセストークン</span>
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="スクリプトプロパティ API_TOKEN と同じ値"
            />
            <span className="field-hint">
              URLを知っている人が誰でも叩けてしまうため、必ず設定してください。
              この値はこの端末のブラウザ内にのみ保存されます。
            </span>
          </label>

          <button className="btn btn-approve" onClick={save} disabled={busy}>
            {busy ? "確認中…" : "保存して接続テスト"}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-head">🔧 手動実行</div>
        <div className="card-body stack">
          <button
            className="btn btn-ghost"
            disabled={busy || !api.isConnected()}
            onClick={() => trigger("執筆指示", () => api.runAgents())}
          >
            ✍️ AI社員に今すぐ書かせる
          </button>
          <button
            className="btn btn-ghost"
            disabled={busy || !api.isConnected()}
            onClick={() => trigger("売上取り込み", () => api.syncRevenue())}
          >
            📥 売上レポートを今すぐ取り込む
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-head">🏢 現在の組織</div>
        <div className="card-body">
          {DEPARTMENTS.map((d) => (
            <div key={d.id} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: d.color }}>
                {d.icon} {d.name}
              </div>
              <div style={{ fontSize: 10, color: "var(--ink-dim)", marginTop: 3, lineHeight: 1.7 }}>
                AI社員：{d.staff.map((s) => `${s.name}（${s.role}）`).join("・")}
                <br />
                投稿先：
                {d.channels
                  .map((c) => `${CHANNELS[c]?.label || c}${CHANNELS[c]?.auto ? "（自動）" : "（手動）"}`)
                  .join("・")}
              </div>
            </div>
          ))}
          <div className="field-hint">
            組織を変えるには src/config/company.js と backend/gas/00_Config.gs を編集します。
          </div>
        </div>
      </div>
    </div>
  );
}
