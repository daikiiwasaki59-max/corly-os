import { DEPT_BY_ID } from "../config/company.js";
import { hhmm, yen } from "../lib/format.js";

/** 画面下の実況ログ。売上発生とAI社員の作業をそのまま流す */
export default function Ticker({ items = [] }) {
  if (items.length === 0) {
    return <div className="ticker"><span className="ticker-item">稼働ログ待機中…</span></div>;
  }
  return (
    <div className="ticker">
      {items.map((it, i) => {
        const dept = DEPT_BY_ID[it.deptId];
        return (
          <div className="ticker-item" key={i}>
            <span style={{ color: dept?.color }}>{dept?.icon || "•"}</span>
            <span>{hhmm(it.at)}</span>
            <span>{dept ? `${dept.name}：` : ""}{it.text}</span>
            {it.amount > 0 && <span className="ticker-amount">+{yen(it.amount)}</span>}
          </div>
        );
      })}
    </div>
  );
}
