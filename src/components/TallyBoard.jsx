import { COMPANY } from "../config/company.js";
import { jpDate, yen } from "../lib/format.js";

/** 左カラム：社長室 + Fable が記帳する集計ボード */
export function CeoRoom({ status }) {
  const line =
    status === "error" ? "集計が取れてないよ？" :
    status === "demo" ? "まだ繋いでないね" :
    "報告待ってるよ〜";
  return (
    <div className="ceo-room">
      <div className="bubble">{line}</div>
      <div className="ceo-avatar">{COMPANY.ceo.avatar}</div>
      <div className="ceo-desk" />
      <div className="ceo-note">社長｜仕事：報告を聞くだけ</div>
    </div>
  );
}

export function TallyBoard({ totals, date }) {
  return (
    <div className="card">
      <div className="card-head">
        📋 集計ボード｜{COMPANY.supervisor.name} が記帳
      </div>
      <div className="card-body">
        <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6 }}>
          {jpDate(date)} の売上集計
        </div>
        {totals.perDept.map((d) => (
          <div className="tally-row" key={d.id}>
            <span className="tally-name">
              <span>{d.icon}</span>
              {d.name.replace(/部$/, "")}
            </span>
            <span className="tally-amount">{yen(d.total)}</span>
          </div>
        ))}
        <div className="tally-total">
          <span className="tally-name">💰 合計</span>
          <span className="tally-amount">{yen(totals.grand)}</span>
        </div>
      </div>
    </div>
  );
}
