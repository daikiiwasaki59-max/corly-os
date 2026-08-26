import { useEffect, useRef } from "react";
import { ALL_STAFF, COMPANY, DEPT_BY_ID } from "../config/company.js";
import { hhmm } from "../lib/format.js";

const STAFF_BY_ID = Object.fromEntries(ALL_STAFF.map((s) => [s.id, s]));

function resolve(msg) {
  if (msg.author === COMPANY.supervisor.id) {
    const s = COMPANY.supervisor;
    return { name: `${s.name}（${s.role}）`, avatar: s.avatar, color: s.color };
  }
  const staff = STAFF_BY_ID[msg.author];
  if (staff) {
    const dept = DEPT_BY_ID[staff.deptId];
    return { name: `${dept?.name || ""}${staff.name}`, avatar: staff.avatar, color: staff.color };
  }
  const dept = DEPT_BY_ID[msg.deptId];
  return { name: dept?.name || msg.author || "AI", avatar: dept?.icon || "・", color: dept?.color || "#8a8aa0" };
}

/** 右カラム：売上報告グループのチャットフィード */
export default function ReportFeed({ feed = [], live }) {
  const listRef = useRef(null);
  useEffect(() => {
    // scrollIntoView だとページ全体まで動いてしまうので、フィード内だけを送る
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [feed.length]);

  const members = ALL_STAFF.length + 1;

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}>
      <div className="card-head">
        📊 売上報告グループ（{members}）
        {live && <span className="live-dot"><i />自動報告</span>}
      </div>
      <div className="feed" ref={listRef}>
        {feed.length === 0 && <div className="feed-empty">まだ報告はありません</div>}
        {feed.map((m) => {
          const who = resolve(m);
          const isMoney = /¥[\d,]+/.test(m.text);
          return (
            <div className="feed-msg" key={m.id || m.at + m.text}>
              <div className="feed-avatar" style={{ background: who.color }}>{who.avatar}</div>
              <div style={{ minWidth: 0 }}>
                <div className="feed-author">{who.name}　{hhmm(m.at)}</div>
                <div className={`feed-bubble${isMoney ? " money" : ""}`}>{m.text}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
