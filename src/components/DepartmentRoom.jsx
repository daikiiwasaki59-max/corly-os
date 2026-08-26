import { yen } from "../lib/format.js";

/** 画像の「部署ルーム」。モニター・AI社員・本日の累計の3ブロック構成 */
export default function DepartmentRoom({ dept }) {
  const { color, icon, name, tagline, items, total, count, staff } = dept;

  return (
    <div className="room">
      <div className="room-head" style={{ color }}>
        <span className="dot" style={{ background: color }} />
        <span>{icon} {name}</span>
        <span className="room-tag">｜{tagline}</span>
      </div>

      <div className="room-body">
        {/* 売上明細モニター */}
        <div className="monitor">
          <div className="monitor-bar">
            <span style={{ color }}>●</span> {name} 本日の内訳
          </div>
          {items.length === 0 ? (
            <div className="monitor-empty">本日の発生はまだありません</div>
          ) : (
            <>
              {items.slice(0, 5).map((it, i) => (
                <div className="monitor-row" key={i}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {it.label}
                  </span>
                  <span>+{yen(it.amount)}</span>
                </div>
              ))}
              <div className="monitor-foot">{yen(total)}</div>
            </>
          )}
        </div>

        {/* AI社員 */}
        <div className="staff">
          {staff.map((s) => (
            <div className="worker" key={s.id} title={`${s.name}｜${s.role}`}>
              <div className="worker-body" style={{ background: color }} />
              <div className="worker-name">{s.name}<br />{s.role}</div>
            </div>
          ))}
        </div>

        {/* 本日の累計 */}
        <div className="total-card" style={{ background: `${color}14`, color }}>
          <div className="total-label">{icon} {name}｜本日の累計</div>
          <div className="total-value">{yen(total)}</div>
          <div className="total-sub">発生 {count}件</div>
        </div>
      </div>
    </div>
  );
}
