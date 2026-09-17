import { useEffect, useMemo, useState } from "react";
import { C, inputStyle, Label, TextArea, ActionBtn, SectionTitle } from "./ui.jsx";
import { JOURNAL_FORMS, SCALE_MIN, SCALE_MAX, getForm, suggestedFormId } from "./journal.js";

const LS_WEBHOOK = "corly_journal_webhook";
const LS_DRAFTS  = "corly_journal_drafts";
const LS_HISTORY = "corly_journal_history";

const readJSON = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; }
  catch { return fallback; }
};
const writeJSON = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* 容量超過などは黙って無視 */ }
};

const todayStr = () => {
  const d = new Date();
  const p = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const emptyDraft = (form) =>
  Object.fromEntries(form.fields.map(f => [f.key, f.type === "date" ? todayStr() : ""]));

/** 回答を「見出し → 値」の形にして送信ペイロードを作る */
const buildPayload = (form, draft) => ({
  type: form.id,
  sheet: form.sheet,
  answers: Object.fromEntries(
    form.fields.map(f => [f.header, draft[f.key] ?? ""])
  ),
});

/**
 * Apps Script のウェブアプリへ送信する。
 * no-cors のため本当にシートへ書けたかはブラウザ側からは判定できない。
 * ネットワーク自体が失敗した場合のみ false を返す。
 */
async function postToSheet(webhook, payload) {
  try {
    await fetch(webhook, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    return true;
  } catch {
    return false;
  }
}

// ── SCALE PICKER ──────────────────────────────────────────────
function ScalePicker({ value, onChange, color }) {
  const nums = [];
  for (let n = SCALE_MIN; n <= SCALE_MAX; n++) nums.push(n);
  return (
    <div style={{ display:"grid", gridTemplateColumns:`repeat(${nums.length}, 1fr)`, gap:4, marginBottom:12 }}>
      {nums.map(n => {
        const active = String(value) === String(n);
        return (
          <button
            key={n}
            onClick={() => onChange(active ? "" : n)}
            style={{
              padding:"8px 0", borderRadius:8, cursor:"pointer", fontSize:12,
              fontWeight: active ? 700 : 400,
              background: active ? `${color}28` : "rgba(255,255,255,0.04)",
              border: `1px solid ${active ? color : "rgba(255,255,255,0.1)"}`,
              color: active ? color : "rgba(255,255,255,0.4)",
            }}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

// ── HISTORY CARD ──────────────────────────────────────────────
function HistoryCard({ entry, onResend, resending }) {
  const form = getForm(entry.type);
  const shown = Object.entries(entry.answers).filter(([, v]) => v !== "" && v != null).slice(0, 3);
  return (
    <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:11, padding:"11px 13px", marginBottom:8, borderLeft:`3px solid ${form.color}` }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
        <span style={{ fontSize:12, fontWeight:700, color:form.color }}>{form.icon} {form.label}</span>
        <span style={{ fontSize:9, color:C.textMuted }}>{new Date(entry.savedAt).toLocaleString("ja-JP")}</span>
      </div>
      {shown.map(([header, v]) => (
        <div key={header} style={{ fontSize:10, color:C.textDim, marginBottom:3, lineHeight:1.5 }}>
          <span style={{ color:C.textMuted }}>{header}</span><br />{String(v)}
        </div>
      ))}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:7 }}>
        <span style={{ fontSize:9, color: entry.sent ? "#10B981" : "#F97316" }}>
          {entry.sent ? "✓ シートへ送信済み" : "未送信（この端末に保存）"}
        </span>
        {!entry.sent && (
          <button onClick={() => onResend(entry)} disabled={resending} style={{ fontSize:9, padding:"3px 9px", borderRadius:20, background:"rgba(240,180,41,0.12)", border:"1px solid rgba(240,180,41,0.4)", color:"#F0B429", cursor:resending?"default":"pointer" }}>
            {resending ? "送信中…" : "再送信"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── MAIN SCREEN ───────────────────────────────────────────────
export default function JournalScreen() {
  const suggested = useMemo(() => suggestedFormId(), []);
  const [formId, setFormId] = useState(suggested);
  const [webhook, setWebhook] = useState(() => localStorage.getItem(LS_WEBHOOK) || "");
  const [showSettings, setShowSettings] = useState(false);
  const [drafts, setDrafts] = useState(() => readJSON(LS_DRAFTS, {}));
  const [history, setHistory] = useState(() => readJSON(LS_HISTORY, []));
  const [status, setStatus] = useState(null);
  const [resendingId, setResendingId] = useState(null);

  const form = getForm(formId);
  const draft = drafts[formId] || emptyDraft(form);

  useEffect(() => { writeJSON(LS_DRAFTS, drafts); }, [drafts]);
  useEffect(() => { writeJSON(LS_HISTORY, history); }, [history]);

  const setField = (key, value) =>
    setDrafts(prev => ({ ...prev, [formId]: { ...(prev[formId] || emptyDraft(form)), [key]: value } }));

  const filled = form.fields.filter(f => f.type !== "date" && String(draft[f.key] ?? "") !== "").length;
  const answerable = form.fields.filter(f => f.type !== "date").length;

  const saveWebhook = (url) => {
    setWebhook(url);
    try { localStorage.setItem(LS_WEBHOOK, url); } catch { /* noop */ }
  };

  const submit = async () => {
    if (filled === 0) { setStatus("empty"); setTimeout(() => setStatus(null), 2000); return; }
    setStatus("sending");

    const payload = buildPayload(form, draft);
    const sent = webhook ? await postToSheet(webhook, payload) : false;

    setHistory(prev => [{ id: Date.now(), type: form.id, answers: payload.answers, savedAt: new Date().toISOString(), sent }, ...prev].slice(0, 80));
    setDrafts(prev => ({ ...prev, [formId]: emptyDraft(form) }));
    setStatus(webhook ? (sent ? "sent" : "error") : "saved");
    setTimeout(() => setStatus(null), 2800);
  };

  const resend = async (entry) => {
    if (!webhook) { setShowSettings(true); return; }
    setResendingId(entry.id);
    const sent = await postToSheet(webhook, { type: entry.type, sheet: getForm(entry.type).sheet, answers: entry.answers });
    if (sent) setHistory(prev => prev.map(h => (h.id === entry.id ? { ...h, sent: true } : h)));
    setResendingId(null);
  };

  const buttonLabel = {
    sending: "送信中…",
    sent:    "✓ スプレッドシートに記録しました",
    error:   "✕ 送信失敗（この端末には保存済み）",
    saved:   "✓ 端末に保存しました（シート未接続）",
    empty:   "1問以上入力してください",
  }[status] || `📤 ${form.label}ジャーナルを記録する`;

  const unsent = history.filter(h => !h.sent).length;

  return (
    <div style={{ padding:"14px 14px 100px" }}>
      <SectionTitle color={form.color}>📔 ジャーナル</SectionTitle>

      {/* 接続設定 */}
      <button onClick={() => setShowSettings(s => !s)} style={{ fontSize:10, color: webhook ? "#10B981" : "#F97316", background: webhook ? "rgba(16,185,129,0.1)" : "rgba(249,115,22,0.1)", border:`1px solid ${webhook ? "#10B981" : "#F97316"}40`, borderRadius:20, padding:"5px 11px", cursor:"pointer", marginBottom:12 }}>
        {webhook ? "🔗 スプレッドシート連携：接続済み" : "⚠️ スプレッドシート未接続（タップして設定）"}
        {unsent > 0 && `　未送信 ${unsent}件`}
      </button>

      {showSettings && (
        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:11, padding:"12px 13px", marginBottom:14 }}>
          <Label>Google Apps Script ウェブアプリ URL</Label>
          <input defaultValue={webhook} onBlur={e => saveWebhook(e.target.value.trim())} placeholder="https://script.google.com/macros/s/xxxx/exec" style={inputStyle} />
          <div style={{ fontSize:10, color:C.textMuted, marginTop:8, lineHeight:1.6 }}>
            スプレッドシート「ジャーナル」に <code>apps-script/journal.gs</code> を設置してウェブアプリとして公開し、そのURLをここに貼ると、日次・週次・月次・PDCAが対応するタブへ自動で追記されます。設定手順は <code>docs/journal-app.md</code> を参照。URLはこの端末のブラウザ内にのみ保存されます。
          </div>
        </div>
      )}

      {/* タブ */}
      <div style={{ display:"flex", gap:5, marginBottom:6 }}>
        {JOURNAL_FORMS.map(f => {
          const active = f.id === formId;
          return (
            <button key={f.id} onClick={() => setFormId(f.id)} style={{ flex:1, padding:"8px 2px", borderRadius:10, cursor:"pointer", background: active ? `${f.color}22` : "rgba(255,255,255,0.03)", border:`1px solid ${active ? f.color : "rgba(255,255,255,0.08)"}`, color: active ? f.color : "rgba(255,255,255,0.4)", fontSize:10, fontWeight: active ? 700 : 400, position:"relative" }}>
              <div style={{ fontSize:15, marginBottom:2 }}>{f.icon}</div>
              {f.label}
              {f.id === suggested && !active && (
                <span style={{ position:"absolute", top:4, right:5, width:6, height:6, borderRadius:"50%", background:"#F0B429" }} />
              )}
            </button>
          );
        })}
      </div>
      <div style={{ fontSize:9, color:C.textMuted, marginBottom:14 }}>
        {form.hint}
        {formId !== suggested && `　／ 今日は「${getForm(suggested).label}」を書くタイミングです`}
      </div>

      {/* 進捗 */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
        <span style={{ fontSize:10, color:C.textDim }}>{form.title}</span>
        <span style={{ fontSize:10, color:form.color, fontWeight:700 }}>{filled} / {answerable}</span>
      </div>
      <div style={{ height:4, background:"rgba(255,255,255,0.06)", borderRadius:2, overflow:"hidden", marginBottom:16 }}>
        <div style={{ height:"100%", width:`${(filled / answerable) * 100}%`, background:form.color, borderRadius:2, transition:"width 0.2s" }} />
      </div>

      {/* 設問 */}
      {form.fields.map(f => {
        if (f.type === "scale") {
          return (
            <div key={f.key}>
              <Label>{f.label}（{SCALE_MIN}〜{SCALE_MAX}）</Label>
              <ScalePicker value={draft[f.key]} onChange={v => setField(f.key, v)} color={form.color} />
            </div>
          );
        }
        if (f.type === "date") {
          return (
            <div key={f.key} style={{ marginBottom:12 }}>
              <Label>{f.label}</Label>
              <input type="date" value={draft[f.key] || todayStr()} onChange={e => setField(f.key, e.target.value)} style={inputStyle} />
            </div>
          );
        }
        return (
          <TextArea key={f.key} label={f.label} value={draft[f.key] || ""} onChange={v => setField(f.key, v)} rows={f.rows || 2} placeholder={f.placeholder} />
        );
      })}

      <ActionBtn color={status === "error" || status === "empty" ? "#EF4444" : form.color} onClick={submit} disabled={status === "sending"}>
        {buttonLabel}
      </ActionBtn>

      <div style={{ fontSize:9, color:C.textMuted, marginTop:8, lineHeight:1.6 }}>
        入力内容はタブを切り替えても消えません（この端末に自動保存されます）。送信すると下書きはクリアされます。
      </div>

      {/* 履歴 */}
      {history.length > 0 && (
        <div style={{ marginTop:24 }}>
          <div style={{ fontSize:10, color:C.textMuted, fontWeight:700, letterSpacing:"0.1em", marginBottom:10 }}>📚 直近の記録</div>
          {history.slice(0, 20).map(h => (
            <HistoryCard key={h.id} entry={h} onResend={resend} resending={resendingId === h.id} />
          ))}
        </div>
      )}
    </div>
  );
}
