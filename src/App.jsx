import { useState } from "react";
import "./styles.css";

import TopBar from "./components/TopBar.jsx";
import Ticker from "./components/Ticker.jsx";
import OfficeScreen from "./screens/OfficeScreen.jsx";
import ApprovalScreen from "./screens/ApprovalScreen.jsx";
import RevenueScreen from "./screens/RevenueScreen.jsx";
import SettingsScreen from "./screens/SettingsScreen.jsx";
import { useCompany } from "./hooks/useCompany.js";
import * as api from "./lib/api.js";

const NAV = [
  { id: "office", icon: "🏢", label: "オフィス" },
  { id: "approve", icon: "📥", label: "承認" },
  { id: "revenue", icon: "💰", label: "売上" },
  { id: "settings", icon: "⚙️", label: "設定" },
];

export default function App() {
  const [screen, setScreen] = useState("office");
  const { state, totals, status, error, reload, approve, reject } = useCompany();

  const pending = (state.drafts || []).filter((d) => d.status === "draft").length;

  return (
    <div className="app">
      <TopBar totals={totals} date={state.date} />

      {status === "error" && (
        <div className="banner err" style={{ margin: "8px 10px 0" }}>
          バックエンドに接続できません：{error}
        </div>
      )}

      {screen === "office" && <OfficeScreen state={state} totals={totals} status={status} />}
      {screen === "approve" && (
        <ApprovalScreen
          state={state}
          onApprove={approve}
          onReject={reject}
          connected={api.isConnected()}
        />
      )}
      {screen === "revenue" && <RevenueScreen totals={totals} state={state} />}
      {screen === "settings" && <SettingsScreen onReload={reload} />}

      {screen === "office" && <Ticker items={state.ticker} />}

      <nav className="nav">
        {NAV.map((n) => (
          <button
            key={n.id}
            className={screen === n.id ? "active" : ""}
            onClick={() => setScreen(n.id)}
          >
            <span>{n.icon}</span>
            <span>{n.label}</span>
            {n.id === "approve" && pending > 0 && <span className="badge">{pending}</span>}
          </button>
        ))}
        <button onClick={reload} style={{ marginLeft: "auto" }} title="再読み込み">
          {status === "loading" ? "⏳" : "🔄"}
        </button>
      </nav>
    </div>
  );
}
