import { useState } from "react";
import { CHANNELS, DEPT_BY_ID } from "../config/company.js";
import { hhmm } from "../lib/format.js";

/** API のない販路（note など）向け。本文をクリップボードに移して人が貼る。 */
function CopyButton({ draft }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    const text = [draft.title, draft.body].filter(Boolean).join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch {
      setDone(false);
    }
  };
  return (
    <button className="btn btn-ghost" onClick={copy}>
      {done ? "コピーしました" : "📋 本文をコピー"}
    </button>
  );
}

const STATUS_LABEL = {
  draft: { text: "承認待ち", bg: "#fff5d6", fg: "#7a5a00" },
  approved: { text: "投稿待ち", bg: "#e3f6ea", fg: "#0b6b3c" },
  manual: { text: "手動公開待ち", bg: "#e7edfb", fg: "#25478f" },
  published: { text: "投稿済み", bg: "#e7edfb", fg: "#25478f" },
  rejected: { text: "却下", bg: "#f1f1f7", fg: "#8a8aa0" },
  failed: { text: "投稿失敗", bg: "#fde8e8", fg: "#a12020" },
};

/**
 * AI が書いた下書きを社長が承認する画面。
 * 承認されたものだけが次の publish サイクルで実際に投稿される。
 */
export default function ApprovalScreen({ state, onApprove, onReject, connected }) {
  const drafts = state.drafts || [];
  const pending = drafts.filter((d) => d.status === "draft");
  const rest = drafts.filter((d) => d.status !== "draft");

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-title">📥 承認キュー</div>
        <div className="page-sub">
          AI社員が書いた下書きです。承認すると自動投稿サイクルに乗ります。
          <br />
          note のように API のない販路は、承認後に本文をコピーして手動で公開してください。
        </div>
      </div>

      {!connected && (
        <div className="banner warn">
          デモデータを表示しています。実データを扱うには「⚙️ 設定」からバックエンドを接続してください。
        </div>
      )}

      <div className="stack">
        {pending.length === 0 && <div className="banner ok">承認待ちの下書きはありません。</div>}
        {pending.map((d) => (
          <DraftCard key={d.id} draft={d} onApprove={onApprove} onReject={onReject} />
        ))}
      </div>

      {rest.length > 0 && (
        <>
          <div className="page-head" style={{ marginTop: 20 }}>
            <div className="page-title" style={{ fontSize: 13 }}>処理済み</div>
          </div>
          <div className="stack">
            {rest.map((d) => (
              <DraftCard key={d.id} draft={d} readOnly />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function DraftCard({ draft, onApprove, onReject, readOnly }) {
  const dept = DEPT_BY_ID[draft.deptId];
  const ch = CHANNELS[draft.channel] || { label: draft.channel, color: "#8a8aa0", auto: false };
  const st = STATUS_LABEL[draft.status] || STATUS_LABEL.draft;

  return (
    <div className="card">
      <div className="card-body">
        <div className="draft-head">
          <span className="pill" style={{ background: `${dept?.color}18`, color: dept?.color }}>
            {dept?.icon} {dept?.name}
          </span>
          <span className="pill" style={{ background: `${ch.color}18`, color: ch.color }}>
            {ch.icon} {ch.label}
          </span>
          <span className="pill" style={{ background: st.bg, color: st.fg }}>{st.text}</span>
          {!ch.auto && (
            <span className="pill" style={{ background: "#f1f1f7", color: "#8a8aa0" }}>
              手動公開
            </span>
          )}
          <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--ink-mute)" }}>
            {hhmm(draft.createdAt)}
          </span>
        </div>

        {draft.title && <div className="draft-title">{draft.title}</div>}
        <div className="draft-body">{draft.body}</div>

        {draft.url && (
          <a
            href={draft.url}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 11, color: "#25478f", display: "inline-block", marginTop: 8 }}
          >
            投稿を開く →
          </a>
        )}
        {draft.error && <div className="banner err" style={{ marginTop: 8 }}>{draft.error}</div>}

        {(!readOnly || draft.status === "manual") && (
          <div className="draft-actions">
            {!readOnly && (
              <>
                <button className="btn btn-approve" onClick={() => onApprove(draft.id)}>
                  {ch.auto ? "✅ 承認して投稿" : "✅ 承認"}
                </button>
                <button className="btn btn-reject" onClick={() => onReject(draft.id)}>
                  却下
                </button>
              </>
            )}
            {!ch.auto && <CopyButton draft={draft} />}
          </div>
        )}
      </div>
    </div>
  );
}
