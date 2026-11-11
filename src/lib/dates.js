export const pad = (n) => String(n).padStart(2, "0");

export const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromKey = (k) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const todayKey = () => toKey(new Date());
export const addDays = (key, n) => {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
};
export const monthKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
export const shiftMonth = (mKey, n) => {
  const [y, m] = mKey.split("-").map(Number);
  return monthKey(new Date(y, m - 1 + n, 1));
};
export const dowOf = (key) => fromKey(key).getDay(); // 0 = Sunday
export const daysBetween = (a, b) => Math.round((fromKey(b) - fromKey(a)) / 86400000);

export const fmtDate = (key, opts = { weekday: "short", month: "short", day: "numeric" }) =>
  fromKey(key).toLocaleDateString(undefined, opts);

export const monthLabel = (mKey, opts = { month: "long", year: "numeric" }) => {
  const [y, m] = mKey.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, opts);
};

export const fmtTime = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${pad(m)} ${h >= 12 ? "PM" : "AM"}`;
};

export const dueDate = (key, time) => {
  const d = fromKey(key);
  const [h, m] = (time || "00:00").split(":").map(Number);
  d.setHours(h, m, 0, 0);
  return d;
};

// 6 weeks x 7 days of date keys covering the month grid
export const monthMatrix = (year, month) => {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  const weeks = [];
  for (let w = 0; w < 6; w++) {
    const row = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + w * 7 + i);
      row.push(toKey(d));
    }
    weeks.push(row);
  }
  return weeks;
};

export const greeting = () => {
  const h = new Date().getHours();
  if (h < 5) return "Burning the midnight oil";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

export const mmss = (secs) => `${pad(Math.floor(secs / 60))}:${pad(secs % 60)}`;
