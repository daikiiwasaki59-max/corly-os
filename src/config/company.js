// ── CORLY OS 会社定義 ────────────────────────────────────────────
// 部署・AI社員・収益チャネルの定義。ここを編集すれば会社の構成が変わる。
// バックエンド (backend/gas/00_Config.gs) の DEPARTMENTS と id を揃えること。

export const COMPANY = {
  name: "AIカンパニー",
  ceo: { name: "社長", avatar: "🧑‍💼", room: "社長室" },
  supervisor: { id: "fable", name: "Fable", role: "監督", avatar: "F", color: "#7C3AED" },
};

export const DEPARTMENTS = [
  {
    id: "affiliate",
    name: "アフィリエイト部",
    icon: "🔗",
    tagline: "記事×案件で稼ぐ",
    color: "#8B5CF6",
    // 収益がどこから来るか（レポート取り込みの識別子）
    sources: ["a8", "moshimo", "rakuten", "amazon"],
    staff: [
      { id: "sol", name: "Sol", role: "分析・改善", avatar: "S" },
      { id: "ren", name: "Ren", role: "記事執筆", avatar: "R" },
    ],
    // このAI社員が扱う投稿チャネル
    channels: ["blog", "x"],
  },
  {
    id: "note",
    name: "note販売部",
    icon: "📝",
    tagline: "記事が24時間売れる",
    color: "#10B981",
    sources: ["note"],
    staff: [
      { id: "nao", name: "Nao", role: "分析・改善", avatar: "N" },
      { id: "yui", name: "Yui", role: "記事執筆", avatar: "Y" },
    ],
    channels: ["note", "x"],
  },
  {
    id: "content",
    name: "コンテンツ販売部",
    icon: "📦",
    tagline: "自動で決済が走る",
    color: "#F59E0B",
    sources: ["stripe", "booth", "tips"],
    staff: [
      { id: "kai", name: "Kai", role: "分析・改善", avatar: "K" },
      { id: "mio", name: "Mio", role: "LP改善", avatar: "M" },
    ],
    channels: ["lp", "x", "threads"],
  },
];

// 投稿チャネル定義。auto=true は API で自動投稿できるもの。
// 詳細と制約は docs/INTEGRATIONS.md を参照。
export const CHANNELS = {
  x:       { label: "X",         icon: "✖️", color: "#1D9BF0", auto: true  },
  threads: { label: "Threads",   icon: "@",  color: "#000000", auto: true  },
  blog:    { label: "ブログ",     icon: "🌐", color: "#0EA5E9", auto: true  },
  lp:      { label: "LP",        icon: "🖥", color: "#F59E0B", auto: true  },
  note:    { label: "note",      icon: "📝", color: "#10B981", auto: false },
  instagram:{label: "Instagram", icon: "📷", color: "#EC4899", auto: true  },
};

export const DEPT_BY_ID = Object.fromEntries(DEPARTMENTS.map((d) => [d.id, d]));

export const ALL_STAFF = DEPARTMENTS.flatMap((d) =>
  d.staff.map((s) => ({ ...s, deptId: d.id, color: d.color }))
);
