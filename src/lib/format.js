export const yen = (n) => "¥" + Math.round(Number(n) || 0).toLocaleString("ja-JP");

export const clock = (d = new Date()) =>
  [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map((v) => String(v).padStart(2, "0"))
    .join(":");

const WD = ["日", "月", "火", "水", "木", "金", "土"];
export const jpDate = (iso) => {
  const d = iso ? new Date(iso + "T00:00:00") : new Date();
  return `${d.getMonth() + 1}/${d.getDate()}（${WD[d.getDay()]}）`;
};

export const todayISO = (d = new Date()) => {
  const p = (v) => String(v).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export const hhmm = (ts) => {
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? "" : clock(d).slice(0, 5);
};
