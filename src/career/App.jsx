import { useState, useEffect } from "react";

// ── THEME (shared with CORLY OS) ────────────────────────────────
const C = {
  bg: "#050508",
  surface: "#0c0c14",
  border: "rgba(255,255,255,0.07)",
  gold: "#F0B429",
  text: "#F0EEE8",
  textDim: "rgba(240,238,232,0.45)",
  textMuted: "rgba(240,238,232,0.25)",
};

const STORAGE_KEY = "career-os-data";

const TIMEFRAMES = ["1年後", "3年後", "5年後", "10年後", "20年後"];
const MILESTONE_CATEGORIES = [
  { id: "career", label: "キャリア", color: "#6366F1" },
  { id: "money", label: "お金", color: "#F0B429" },
  { id: "family", label: "家族・人間関係", color: "#EC4899" },
  { id: "health", label: "健康", color: "#10B981" },
  { id: "growth", label: "自己成長", color: "#A78BFA" },
];
const BALANCE_WHEEL = [
  { id: "work", label: "仕事・キャリア", color: "#6366F1" },
  { id: "money", label: "収入・お金", color: "#F0B429" },
  { id: "health", label: "健康", color: "#10B981" },
  { id: "family", label: "家族", color: "#EC4899" },
  { id: "relations", label: "人間関係", color: "#4ECDC4" },
  { id: "growth", label: "自己成長・学び", color: "#A78BFA" },
  { id: "leisure", label: "趣味・余暇", color: "#F97316" },
  { id: "mind", label: "心の充実", color: "#14B8A6" },
];

const defaultData = {
  will: "",
  can: "",
  must: "",
  experiences: [{ id: 1, company: "", role: "", period: "", achievement: "", skill: "" }],
  strengths: [""],
  weaknesses: [""],
  motivation: [
    { id: 1, label: "学生時代", score: 50, note: "" },
    { id: 2, label: "社会人〜現在", score: 50, note: "" },
  ],
  mustConditions: [""],
  wantConditions: [""],
  selfPitch: "",
  vision: "",
  balanceWheel: Object.fromEntries(BALANCE_WHEEL.map((b) => [b.id, 5])),
  milestones: [],
  topActions: [{ id: 1, text: "", done: false }],
};

function useCareerData() {
  const [data, setData] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...defaultData, ...JSON.parse(raw) } : defaultData;
    } catch {
      return defaultData;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, [data]);
  return [data, setData];
}

// ── PRIMITIVES ────────────────────────────────────────────────
const inputStyle = { width: "100%", padding: "9px 12px", borderRadius: 9, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: C.text, fontSize: 13, outline: "none" };
function Label({ children }) { return <div style={{ fontSize: 9, color: C.textMuted, letterSpacing: "0.1em", marginBottom: 6, textTransform: "uppercase" }}>{children}</div>; }
function TextArea({ value, onChange, rows = 3, placeholder }) { return <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} style={{ ...inputStyle, resize: "none", lineHeight: 1.7 }} />; }
function SectionTitle({ children, color = C.gold, icon }) { return <div style={{ fontWeight: 700, fontSize: 15, color, marginBottom: 4, display: "flex", alignItems: "center", gap: 7 }}>{icon && <span>{icon}</span>}{children}</div>; }
function SectionHint({ children }) { return <div style={{ fontSize: 11, color: C.textDim, marginBottom: 12, lineHeight: 1.6 }}>{children}</div>; }
function Card({ children, color = "rgba(255,255,255,0.07)", bg = "rgba(255,255,255,0.03)", style }) {
  return <div style={{ background: bg, border: `1px solid ${color}`, borderRadius: 13, padding: "14px 15px", marginBottom: 12, ...style }}>{children}</div>;
}

function EditableList({ items, onChange, placeholder, addLabel = "＋ 追加" }) {
  const update = (id, val) => onChange(items.map((it) => (it.id === id ? { ...it, text: val } : it)));
  const remove = (id) => onChange(items.filter((it) => it.id !== id));
  const add = () => onChange([...items, { id: Date.now(), text: "" }]);
  return (
    <div>
      {items.map((it) => (
        <div key={it.id} style={{ display: "flex", gap: 6, marginBottom: 7 }}>
          <input value={it.text} onChange={(e) => update(it.id, e.target.value)} placeholder={placeholder} style={{ ...inputStyle, flex: 1 }} />
          <button onClick={() => remove(it.id)} style={{ width: 30, height: 34, borderRadius: 8, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#F87171", fontSize: 15, cursor: "pointer", flexShrink: 0 }}>×</button>
        </div>
      ))}
      <button onClick={add} style={{ width: "100%", padding: "8px", borderRadius: 9, background: "transparent", border: "1px dashed rgba(255,255,255,0.18)", color: C.textMuted, fontSize: 11, cursor: "pointer" }}>{addLabel}</button>
    </div>
  );
}

// list of plain strings (strengths/weaknesses)
function StringList({ items, onChange, placeholder }) {
  const wrapped = items.map((t, i) => ({ id: i, text: t }));
  return (
    <EditableList
      items={wrapped}
      onChange={(next) => onChange(next.map((it) => it.text))}
      placeholder={placeholder}
    />
  );
}

// ── WILL / CAN / MUST ────────────────────────────────────────
function WillCanMust({ data, setData }) {
  const set = (k) => (v) => setData((d) => ({ ...d, [k]: v }));
  const blocks = [
    { key: "will", label: "Will｜やりたいこと", color: "#F0B429", ph: "本当はどんな仕事・働き方をしたい？ワクワクすること、興味の方向性を書き出す" },
    { key: "can", label: "Can｜できること・強み", color: "#10B981", ph: "これまでの経験で培ったスキル、得意なこと、成果を出せたことを書き出す" },
    { key: "must", label: "Must｜大切にしたい価値観", color: "#6366F1", ph: "仕事において譲れない価値観、社会や会社に求められると感じること" },
  ];
  return (
    <div>
      <SectionTitle icon="🧭">Will / Can / Must</SectionTitle>
      <SectionHint>3つの円が重なるところに、転職の軸が見えてきます。</SectionHint>
      {blocks.map((b) => (
        <Card key={b.key} color={`${b.color}30`} bg={`${b.color}08`}>
          <div style={{ fontSize: 11, fontWeight: 700, color: b.color, marginBottom: 8 }}>{b.label}</div>
          <TextArea value={data[b.key]} onChange={set(b.key)} rows={3} placeholder={b.ph} />
        </Card>
      ))}
    </div>
  );
}

// ── EXPERIENCE INVENTORY ─────────────────────────────────────
function ExperienceInventory({ data, setData }) {
  const experiences = data.experiences;
  const update = (id, k, v) => setData((d) => ({ ...d, experiences: d.experiences.map((e) => (e.id === id ? { ...e, [k]: v } : e)) }));
  const remove = (id) => setData((d) => ({ ...d, experiences: d.experiences.filter((e) => e.id !== id) }));
  const add = () => setData((d) => ({ ...d, experiences: [...d.experiences, { id: Date.now(), company: "", role: "", period: "", achievement: "", skill: "" }] }));
  return (
    <div>
      <SectionTitle icon="📂" color="#4ECDC4">経験の棚卸し</SectionTitle>
      <SectionHint>会社・役職ごとに、成果と得たスキルを言語化しておくと職務経歴書にそのまま使えます。</SectionHint>
      {experiences.map((e) => (
        <Card key={e.id} color="rgba(78,205,196,0.25)" bg="rgba(78,205,196,0.05)">
          <div style={{ display: "flex", gap: 6, marginBottom: 7 }}>
            <input value={e.company} onChange={(ev) => update(e.id, "company", ev.target.value)} placeholder="会社・組織名" style={{ ...inputStyle, flex: 2 }} />
            <input value={e.period} onChange={(ev) => update(e.id, "period", ev.target.value)} placeholder="期間（例：2021-2024）" style={{ ...inputStyle, flex: 1 }} />
          </div>
          <input value={e.role} onChange={(ev) => update(e.id, "role", ev.target.value)} placeholder="役職・職種" style={{ ...inputStyle, marginBottom: 7 }} />
          <TextArea value={e.achievement} onChange={(v) => update(e.id, "achievement", v)} rows={2} placeholder="担当業務・成果（数字で語れると◎）" />
          <div style={{ height: 7 }} />
          <input value={e.skill} onChange={(ev) => update(e.id, "skill", ev.target.value)} placeholder="そこで得たスキル・学び" style={inputStyle} />
          <button onClick={() => remove(e.id)} style={{ marginTop: 9, fontSize: 10, color: "#F87171", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "5px 10px", cursor: "pointer" }}>× この経験を削除</button>
        </Card>
      ))}
      <button onClick={add} style={{ width: "100%", padding: "9px", borderRadius: 10, background: "transparent", border: "1px dashed rgba(255,255,255,0.18)", color: C.textMuted, fontSize: 12, cursor: "pointer" }}>＋ 経験を追加</button>
    </div>
  );
}

// ── STRENGTHS / WEAKNESSES ───────────────────────────────────
function StrengthsWeaknesses({ data, setData }) {
  return (
    <div>
      <SectionTitle icon="⚖️" color="#EC4899">強み・弱み</SectionTitle>
      <SectionHint>それぞれTOP3を目安に。面接で「弱み」を聞かれたときの返答準備にもなります。</SectionHint>
      <Card color="rgba(16,185,129,0.25)" bg="rgba(16,185,129,0.05)">
        <div style={{ fontSize: 11, fontWeight: 700, color: "#10B981", marginBottom: 8 }}>💪 強み</div>
        <StringList items={data.strengths} onChange={(v) => setData((d) => ({ ...d, strengths: v }))} placeholder="例：数字を分解して課題を特定する力" />
      </Card>
      <Card color="rgba(249,115,22,0.25)" bg="rgba(249,115,22,0.05)">
        <div style={{ fontSize: 11, fontWeight: 700, color: "#F97316", marginBottom: 8 }}>🌱 弱み（伸びしろ）</div>
        <StringList items={data.weaknesses} onChange={(v) => setData((d) => ({ ...d, weaknesses: v }))} placeholder="例：一人で抱え込みやすい" />
      </Card>
    </div>
  );
}

// ── MOTIVATION GRAPH ──────────────────────────────────────────
function MotivationGraph({ data, setData }) {
  const stages = data.motivation;
  const update = (id, k, v) => setData((d) => ({ ...d, motivation: d.motivation.map((s) => (s.id === id ? { ...s, [k]: v } : s)) }));
  const remove = (id) => setData((d) => ({ ...d, motivation: d.motivation.filter((s) => s.id !== id) }));
  const add = () => setData((d) => ({ ...d, motivation: [...d.motivation, { id: Date.now(), label: "", score: 50, note: "" }] }));

  const n = stages.length;
  const W = 300, H = 110, padX = 14;
  const stepX = n > 1 ? (W - padX * 2) / (n - 1) : 0;
  const pts = stages.map((s, i) => ({ x: padX + i * stepX, y: 100 - (Math.max(0, Math.min(100, s.score)) / 100) * 90 }));
  const path = pts.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div>
      <SectionTitle icon="📈" color="#F0B429">モチベーショングラフ</SectionTitle>
      <SectionHint>人生の各段階でのやる気・満足度を振り返ると、自分が上がる/下がる条件が見えてきます。</SectionHint>
      <Card>
        {n > 0 && (
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", marginBottom: 10 }}>
            {[0, 50, 100].map((g) => (
              <line key={g} x1={padX} x2={W - padX} y1={100 - (g / 100) * 90} y2={100 - (g / 100) * 90} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            ))}
            {n > 1 && <polyline points={path} fill="none" stroke={C.gold} strokeWidth="2" />}
            {pts.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="4" fill={C.gold} />
            ))}
          </svg>
        )}
        {stages.map((s) => (
          <div key={s.id} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
              <input value={s.label} onChange={(e) => update(s.id, "label", e.target.value)} placeholder="時期（例：新卒〜3年目）" style={{ ...inputStyle, flex: 1 }} />
              <button onClick={() => remove(s.id)} style={{ width: 30, borderRadius: 8, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#F87171", cursor: "pointer" }}>×</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <input type="range" min="0" max="100" value={s.score} onChange={(e) => update(s.id, "score", Number(e.target.value))} style={{ flex: 1, accentColor: C.gold }} />
              <span style={{ fontSize: 12, color: C.gold, fontWeight: 700, width: 30, textAlign: "right" }}>{s.score}</span>
            </div>
            <input value={s.note} onChange={(e) => update(s.id, "note", e.target.value)} placeholder="そのときの出来事・理由" style={{ ...inputStyle, fontSize: 11, padding: "6px 10px" }} />
          </div>
        ))}
        <button onClick={add} style={{ width: "100%", padding: "8px", borderRadius: 9, background: "transparent", border: "1px dashed rgba(255,255,255,0.18)", color: C.textMuted, fontSize: 11, cursor: "pointer" }}>＋ 時期を追加</button>
      </Card>
    </div>
  );
}

// ── JOB CHANGE CRITERIA ──────────────────────────────────────
function ChangeCriteria({ data, setData }) {
  return (
    <div>
      <SectionTitle icon="🎯" color="#A78BFA">転職の軸</SectionTitle>
      <SectionHint>「絶対条件」と「できれば条件」を分けると、求人を見比べるときの判断がぶれません。</SectionHint>
      <Card color="rgba(167,139,250,0.3)" bg="rgba(167,139,250,0.06)">
        <div style={{ fontSize: 11, fontWeight: 700, color: "#A78BFA", marginBottom: 8 }}>🔴 絶対条件（Must）</div>
        <StringList items={data.mustConditions} onChange={(v) => setData((d) => ({ ...d, mustConditions: v }))} placeholder="例：年収600万円以上" />
      </Card>
      <Card color="rgba(99,102,241,0.3)" bg="rgba(99,102,241,0.05)">
        <div style={{ fontSize: 11, fontWeight: 700, color: "#6366F1", marginBottom: 8 }}>🔵 できれば条件（Want）</div>
        <StringList items={data.wantConditions} onChange={(v) => setData((d) => ({ ...d, wantConditions: v }))} placeholder="例：リモートワーク可" />
      </Card>
    </div>
  );
}

// ── SELF PITCH ────────────────────────────────────────────────
function SelfPitch({ data, setData }) {
  return (
    <div>
      <SectionTitle icon="🗣" color="#14B8A6">自己紹介まとめ</SectionTitle>
      <SectionHint>ここまでの内容をもとに、面接や職務経歴書で使える一言をまとめてみましょう。</SectionHint>
      <Card color="rgba(20,184,166,0.25)" bg="rgba(20,184,166,0.05)">
        <TextArea value={data.selfPitch} onChange={(v) => setData((d) => ({ ...d, selfPitch: v }))} rows={4} placeholder="例：〇〇業界で△年、□□の経験を積んできました。強みは〜。次のキャリアでは〜を実現したいです。" />
      </Card>
    </div>
  );
}

// ── SELF UNDERSTANDING SHEET TAB ─────────────────────────────
function SelfSheetTab({ data, setData }) {
  return (
    <div style={{ padding: "16px 16px 100px" }}>
      <WillCanMust data={data} setData={setData} />
      <div style={{ height: 8 }} />
      <ExperienceInventory data={data} setData={setData} />
      <div style={{ height: 8 }} />
      <StrengthsWeaknesses data={data} setData={setData} />
      <div style={{ height: 8 }} />
      <MotivationGraph data={data} setData={setData} />
      <div style={{ height: 8 }} />
      <ChangeCriteria data={data} setData={setData} />
      <div style={{ height: 8 }} />
      <SelfPitch data={data} setData={setData} />
    </div>
  );
}

// ── VISION ────────────────────────────────────────────────────
function Vision({ data, setData }) {
  return (
    <div>
      <SectionTitle icon="🌅" color={C.gold}>人生のビジョン</SectionTitle>
      <SectionHint>10年後、どんな自分でありたいか。仕事に限らず自由に書いてみましょう。</SectionHint>
      <Card color="rgba(240,180,41,0.3)" bg="rgba(240,180,41,0.06)">
        <TextArea value={data.vision} onChange={(v) => setData((d) => ({ ...d, vision: v }))} rows={4} placeholder="例：家族と過ごす時間を大切にしながら、専門性を活かして人の役に立つ仕事を続けている" />
      </Card>
    </div>
  );
}

// ── LIFE BALANCE WHEEL ───────────────────────────────────────
function BalanceWheel({ data, setData }) {
  const set = (id, v) => setData((d) => ({ ...d, balanceWheel: { ...d.balanceWheel, [id]: v } }));
  const avg = (Object.values(data.balanceWheel).reduce((s, v) => s + v, 0) / BALANCE_WHEEL.length).toFixed(1);
  return (
    <div>
      <SectionTitle icon="☸️" color="#4ECDC4">ライフバランスホイール</SectionTitle>
      <SectionHint>今の充実度を0〜10で自己採点。偏りが見えると、次にどこへ力を入れるか決めやすくなります。</SectionHint>
      <Card>
        <div style={{ textAlign: "right", marginBottom: 10 }}>
          <span style={{ fontSize: 10, color: C.textMuted }}>平均 </span>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.gold }}>{avg}</span>
          <span style={{ fontSize: 10, color: C.textMuted }}> / 10</span>
        </div>
        {BALANCE_WHEEL.map((b) => (
          <div key={b.id} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: C.text }}>{b.label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: b.color }}>{data.balanceWheel[b.id]}</span>
            </div>
            <input type="range" min="0" max="10" value={data.balanceWheel[b.id]} onChange={(e) => set(b.id, Number(e.target.value))} style={{ width: "100%", accentColor: b.color }} />
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── MILESTONES / TIMELINE ────────────────────────────────────
function Milestones({ data, setData }) {
  const [tf, setTf] = useState(TIMEFRAMES[0]);
  const [cat, setCat] = useState(MILESTONE_CATEGORIES[0].id);
  const [text, setText] = useState("");

  const add = () => {
    if (!text.trim()) return;
    setData((d) => ({ ...d, milestones: [...d.milestones, { id: Date.now(), timeframe: tf, category: cat, text, done: false }] }));
    setText("");
  };
  const toggle = (id) => setData((d) => ({ ...d, milestones: d.milestones.map((m) => (m.id === id ? { ...m, done: !m.done } : m)) }));
  const remove = (id) => setData((d) => ({ ...d, milestones: d.milestones.filter((m) => m.id !== id) }));

  return (
    <div>
      <SectionTitle icon="🗺" color="#6366F1">タイムライン・マイルストーン</SectionTitle>
      <SectionHint>「いつまでに」「どの領域で」「何を成し遂げたいか」を書き出していきます。</SectionHint>
      <Card>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 8 }}>
          {TIMEFRAMES.map((t) => (
            <button key={t} onClick={() => setTf(t)} style={{ flexShrink: 0, padding: "5px 11px", borderRadius: 20, fontSize: 11, cursor: "pointer", background: tf === t ? `${C.gold}25` : "transparent", border: `1px solid ${tf === t ? C.gold : "rgba(255,255,255,0.12)"}`, color: tf === t ? C.gold : C.textDim }}>{t}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 10 }}>
          {MILESTONE_CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => setCat(c.id)} style={{ flexShrink: 0, padding: "5px 11px", borderRadius: 20, fontSize: 11, cursor: "pointer", background: cat === c.id ? `${c.color}25` : "transparent", border: `1px solid ${cat === c.id ? c.color : "rgba(255,255,255,0.12)"}`, color: cat === c.id ? c.color : C.textDim }}>{c.label}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="目標を入力（例：昇進して部署を持つ）" style={{ ...inputStyle, flex: 1 }} />
          <button onClick={add} style={{ padding: "0 16px", borderRadius: 9, background: `${C.gold}20`, border: `1px solid ${C.gold}50`, color: C.gold, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>追加</button>
        </div>
      </Card>

      {TIMEFRAMES.map((t) => {
        const items = data.milestones.filter((m) => m.timeframe === t);
        if (items.length === 0) return null;
        return (
          <div key={t} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.gold }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: C.gold }}>{t}</span>
              <div style={{ flex: 1, height: 1, background: "rgba(240,180,41,0.15)" }} />
            </div>
            {items.map((m) => {
              const c = MILESTONE_CATEGORIES.find((x) => x.id === m.category);
              return (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 9, background: `${c.color}08`, border: `1px solid ${c.color}25`, borderRadius: 11, padding: "10px 12px", marginBottom: 6, marginLeft: 14 }}>
                  <button onClick={() => toggle(m.id)} style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${c.color}`, background: m.done ? c.color : "transparent", flexShrink: 0, cursor: "pointer" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, color: c.color, marginBottom: 2 }}>{c.label}</div>
                    <div style={{ fontSize: 12, color: C.text, textDecoration: m.done ? "line-through" : "none", opacity: m.done ? 0.5 : 1 }}>{m.text}</div>
                  </div>
                  <button onClick={() => remove(m.id)} style={{ background: "none", border: "none", color: C.textMuted, fontSize: 16, cursor: "pointer" }}>×</button>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ── TOP ACTIONS THIS YEAR ────────────────────────────────────
function TopActions({ data, setData }) {
  const items = data.topActions;
  const update = (id, k, v) => setData((d) => ({ ...d, topActions: d.topActions.map((it) => (it.id === id ? { ...it, [k]: v } : it)) }));
  const remove = (id) => setData((d) => ({ ...d, topActions: d.topActions.filter((it) => it.id !== id) }));
  const add = () => setData((d) => ({ ...d, topActions: [...d.topActions, { id: Date.now(), text: "", done: false }] }));
  return (
    <div>
      <SectionTitle icon="✅" color="#10B981">今年やることTOP3</SectionTitle>
      <SectionHint>ロードマップを、まず今年動かすアクションまで分解します。</SectionHint>
      <Card>
        {items.map((it) => (
          <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <button onClick={() => update(it.id, "done", !it.done)} style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid #10B981", background: it.done ? "#10B981" : "transparent", flexShrink: 0, cursor: "pointer" }} />
            <input value={it.text} onChange={(e) => update(it.id, "text", e.target.value)} placeholder="例：転職エージェントに3社登録する" style={{ ...inputStyle, flex: 1, textDecoration: it.done ? "line-through" : "none", opacity: it.done ? 0.5 : 1 }} />
            <button onClick={() => remove(it.id)} style={{ width: 28, height: 32, borderRadius: 8, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#F87171", cursor: "pointer", flexShrink: 0 }}>×</button>
          </div>
        ))}
        <button onClick={add} style={{ width: "100%", padding: "8px", borderRadius: 9, background: "transparent", border: "1px dashed rgba(255,255,255,0.18)", color: C.textMuted, fontSize: 11, cursor: "pointer" }}>＋ 追加</button>
      </Card>
    </div>
  );
}

// ── LIFE ROADMAP TAB ─────────────────────────────────────────
function RoadmapTab({ data, setData }) {
  return (
    <div style={{ padding: "16px 16px 100px" }}>
      <Vision data={data} setData={setData} />
      <div style={{ height: 8 }} />
      <BalanceWheel data={data} setData={setData} />
      <div style={{ height: 8 }} />
      <Milestones data={data} setData={setData} />
      <div style={{ height: 8 }} />
      <TopActions data={data} setData={setData} />
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────
export default function CareerApp() {
  const [data, setData] = useCareerData();
  const [tab, setTab] = useState("sheet");

  const tabs = [
    { id: "sheet", icon: "🧭", label: "自己理解シート" },
    { id: "roadmap", icon: "🗺", label: "人生のロードマップ" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif", color: C.text }}>
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "14px 16px", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#F0B429,#F97316)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🧭</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: "0.02em" }}>Career OS</div>
            <div style={{ fontSize: 9, color: C.textMuted }}>自己理解シート & 人生のロードマップ</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "9px 6px", borderRadius: 11, fontSize: 12, fontWeight: 700, cursor: "pointer", background: tab === t.id ? "rgba(240,180,41,0.15)" : "rgba(255,255,255,0.03)", border: `1px solid ${tab === t.id ? "#F0B429" : "rgba(255,255,255,0.08)"}`, color: tab === t.id ? "#F0B429" : C.textDim }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "sheet" ? <SelfSheetTab data={data} setData={setData} /> : <RoadmapTab data={data} setData={setData} />}

      <div style={{ position: "fixed", bottom: 16, right: 16, fontSize: 9, color: C.textMuted, background: "rgba(12,12,20,0.85)", border: `1px solid ${C.border}`, borderRadius: 20, padding: "6px 12px" }}>
        💾 自動保存（このブラウザ内）
      </div>

      <style>{`
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        input, textarea { font-family: inherit; }
      `}</style>
    </div>
  );
}
