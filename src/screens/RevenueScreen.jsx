import { yen } from "../lib/format.js";

/** 部署別の売上内訳と構成比 */
export default function RevenueScreen({ totals, state }) {
  const { perDept, grand } = totals;

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-title">💰 売上</div>
        <div className="page-sub">
          ASPやストアのレポートを取り込んだ結果です。取り込み経路は docs/INTEGRATIONS.md を参照。
        </div>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-body">
          <div style={{ fontSize: 11, color: "var(--ink-dim)" }}>本日の合計</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 30, fontWeight: 700, color: "var(--money)" }}>
            {yen(grand)}
          </div>
          {perDept.map((d) => (
            <div key={d.id} style={{ marginTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                <span>{d.icon} {d.name}</span>
                <span style={{ fontFamily: "var(--mono)" }}>
                  {yen(d.total)}（{grand ? Math.round((d.total / grand) * 100) : 0}%）
                </span>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ width: `${grand ? (d.total / grand) * 100 : 0}%`, background: d.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2">
        {perDept.map((d) => (
          <div className="card" key={d.id}>
            <div className="card-head" style={{ color: d.color }}>
              {d.icon} {d.name}
            </div>
            <div className="card-body">
              {d.items.length === 0 ? (
                <div style={{ fontSize: 11, color: "var(--ink-mute)" }}>本日の発生はありません</div>
              ) : (
                d.items.map((it, i) => (
                  <div className="tally-row" key={i}>
                    <span className="tally-name">{it.label}</span>
                    <span className="tally-amount">+{yen(it.amount)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {state.demo && (
        <div className="banner warn" style={{ marginTop: 12 }}>
          これはデモデータです。実際の売上を出すには「⚙️ 設定」からバックエンドを接続してください。
        </div>
      )}
    </div>
  );
}
