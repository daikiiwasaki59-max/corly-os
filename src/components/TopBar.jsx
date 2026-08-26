import { useEffect, useState } from "react";
import { COMPANY } from "../config/company.js";
import { clock, jpDate, yen } from "../lib/format.js";

export default function TopBar({ totals, date }) {
  const [now, setNow] = useState(() => clock());
  useEffect(() => {
    const id = setInterval(() => setNow(clock()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="topbar">
      <div className="chip title">
        🏢 {COMPANY.name} — 売上報告 {jpDate(date)}
      </div>
      <div className="chip">
        <span className="chip-label">💰 本日売上</span>
        <span className="chip-value money">{yen(totals.grand)}</span>
      </div>
      {totals.perDept.map((d) => (
        <div className="chip" key={d.id}>
          <span className="chip-label">
            {d.icon} {d.name.replace(/部$/, "")}
          </span>
          <span className="chip-value money">{yen(d.total)}</span>
        </div>
      ))}
      <div className="topbar-clock">{now}</div>
    </div>
  );
}
