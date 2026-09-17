// ── JOURNAL FORM DEFINITIONS ──────────────────────────────────
// 4つのGoogleフォーム（日次 / 週次 / 月次 / PDCA）をアプリ内に統合したもの。
//
// `header` は送信先スプレッドシート「ジャーナル」の各タブ1行目の見出しと
// 一致させてある。Apps Script 側は列位置ではなく見出し名で書き込み先を
// 決めるため、シートの列を入れ替えても壊れない。
// 見出しを編集した場合は、ここの `header` も同じ文字列に直すこと。

export const SCALE_MIN = 1;
export const SCALE_MAX = 10;

export const JOURNAL_FORMS = [
  {
    id: "daily",
    label: "日次",
    icon: "🌙",
    color: "#6366F1",
    sheet: "daily",
    title: "今日のジャーナル",
    hint: "毎日ねる前に。3分で終わります。",
    fields: [
      { key:"q1",  type:"scale", header:"Q1. 今日の幸福度は何点？",   label:"今日の幸福度は何点？" },
      { key:"q2",  type:"scale", header:"Q2. 今日のエネルギーは何点？", label:"今日のエネルギーは何点？" },
      { key:"q3",  type:"text",  header:"Q3. 今日、一番良かったことは？", label:"今日、一番良かったことは？", rows:2, placeholder:"事業譲渡候補先と話が進んだ" },
      { key:"q4",  type:"text",  header:"Q4. 今日、自分が「よくやった」と思えることは？", label:"今日、自分が「よくやった」と思えることは？", rows:2 },
      { key:"q5",  type:"text",  header:"Q5. 今日、誰か・何かに感謝するとしたら？", label:"今日、誰か・何かに感謝するとしたら？", rows:2 },
      { key:"q6",  type:"text",  header:"Q6. 今日、気づいたこと・学んだことは？", label:"今日、気づいたこと・学んだことは？", rows:2 },
      { key:"q7",  type:"text",  header:"Q7. 今日の自分が、明日の自分に教えてあげられることは？", label:"今日の自分が、明日の自分に教えてあげられることは？", rows:2 },
      { key:"q8",  type:"text",  header:"Q8. 今日、モヤモヤしたこと・嫌だったことは？", label:"今日、モヤモヤしたこと・嫌だったことは？", rows:2 },
      { key:"q9",  type:"text",  header:"Q9. 明日、楽しみにしていることは？", label:"明日、楽しみにしていることは？", rows:2 },
      { key:"q10", type:"text",  header:"Q10. 明日、自分がやる「小さな一歩」は？", label:"明日、自分がやる「小さな一歩」は？", rows:2 },
      { key:"q11", type:"text",  header:"Q11. 今日の自分に一言かけるなら？", label:"今日の自分に一言かけるなら？", rows:2 },
    ],
  },
  {
    id: "weekly",
    label: "週次",
    icon: "📅",
    color: "#10B981",
    sheet: "weekly",
    title: "今週のふりかえり",
    hint: "日曜の夜に。1週間をまとめて振り返ります。",
    fields: [
      { key:"q1", type:"scale", header:"Q1. 今週の幸福度は？", label:"今週の幸福度は？" },
      { key:"q2", type:"text",  header:"Q2. 今週、一番良かった出来事は？", label:"今週、一番良かった出来事は？", rows:2 },
      { key:"q3", type:"text",  header:"Q3. 今週、自分が一番成長したことは？", label:"今週、自分が一番成長したことは？", rows:2 },
      { key:"q4", type:"text",  header:"Q4. 今週、自分が「よくやった」と思えることは？", label:"今週、自分が「よくやった」と思えることは？", rows:2 },
      { key:"q5", type:"text",  header:"Q5. 今週、何に感謝した？", label:"今週、何に感謝した？", rows:2 },
      { key:"q6", type:"text",  header:"Q6. 今週、モヤモヤしたことから何を学んだ？", label:"今週、モヤモヤしたことから何を学んだ？", rows:2 },
      { key:"q7", type:"text",  header:"Q7. 来週、もっと良くしたいことは？", label:"来週、もっと良くしたいことは？", rows:2 },
      { key:"q8", type:"text",  header:"Q8. 来週の「小さな一歩」は？", label:"来週の「小さな一歩」は？", rows:2 },
    ],
  },
  {
    id: "monthly",
    label: "月次",
    icon: "🗓",
    color: "#EC4899",
    sheet: "monthly",
    title: "今月のふりかえり",
    hint: "月末に。1ヶ月の棚卸しと来月の方針。",
    fields: [
      { key:"q1",  type:"scale", header:"Q1. 今月の幸福度は？",     label:"今月の幸福度は？" },
      { key:"q2",  type:"scale", header:"Q2. 今月の人生満足度は？", label:"今月の人生満足度は？" },
      { key:"q3",  type:"text",  header:"Q3. 今月、一番良かったことは？", label:"今月、一番良かったことは？", rows:2 },
      { key:"q4",  type:"text",  header:"Q4. 今月、一番成長したことは？", label:"今月、一番成長したことは？", rows:2 },
      { key:"q5",  type:"text",  header:"Q5. 今月、自分について分かったことは？", label:"今月、自分について分かったことは？", rows:2 },
      { key:"q6",  type:"text",  header:"Q6. 今月、繰り返し出てきた悩み・問題は？", label:"今月、繰り返し出てきた悩み・問題は？", rows:2 },
      { key:"q7",  type:"text",  header:"Q7. 今月、その問題から何を学んだ？", label:"今月、その問題から何を学んだ？", rows:2 },
      { key:"q8",  type:"text",  header:"Q8. 今月の自分にとって、一番大切だったものは何？", label:"今月の自分にとって、一番大切だったものは何？", rows:2 },
      { key:"q9",  type:"text",  header:"Q9. 来月、もっと良い人生にするために何を変える？", label:"来月、もっと良い人生にするために何を変える？", rows:2 },
      { key:"q10", type:"text",  header:"Q10. 来月の自分に約束する「小さな一歩」は？", label:"来月の自分に約束する「小さな一歩」は？", rows:2 },
    ],
  },
  {
    id: "pdca",
    label: "PDCA",
    icon: "🔁",
    color: "#F0B429",
    // 既存フォームの回答先タブ名。タブ名を変えた場合はここも変える。
    sheet: "フォームの回答 1",
    title: "PDCA日記",
    hint: "仕事の回し方の記録。日次ジャーナルとは別物。",
    fields: [
      { key:"date", type:"date", header:"日付", label:"日付" },
      { key:"plan",   type:"text", header:"Plan(今日やろうと決めたこと)", label:"Plan（今日やろうと決めたこと）", rows:2 },
      { key:"do",     type:"text", header:"Do(実際にやったこと)",       label:"Do（実際にやったこと）", rows:3 },
      { key:"check",  type:"text", header:"Check(気づき・振り返り)",     label:"Check（気づき・振り返り）", rows:3 },
      { key:"action", type:"text", header:"Action(次に活かすこと)",      label:"Action（次に活かすこと）", rows:3 },
      { key:"mood",   type:"text", header:"一言日記(気分・感情)",        label:"一言日記（気分・感情）", rows:2 },
    ],
  },
];

export const getForm = (id) => JOURNAL_FORMS.find(f => f.id === id) || JOURNAL_FORMS[0];

/**
 * その日に書くべきフォームを返す。
 * 月末なら月次、日曜なら週次、それ以外は日次。
 */
export function suggestedFormId(now = new Date()) {
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  if (now.getDate() === lastDayOfMonth) return "monthly";
  if (now.getDay() === 0) return "weekly";
  return "daily";
}
