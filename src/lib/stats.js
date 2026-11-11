import { addDays, fromKey, toKey, monthLabel } from "./dates";
import { dayStats, tasksOn, isDone } from "./tasks";

// A day "counts" when enough of its scheduled tasks were completed
export const goodDay = (s, thr) => s.total > 0 && s.pct * 100 >= thr - 1e-9;

export function currentStreak(tasks, today, thr = 100) {
  let key = today;
  if (!goodDay(dayStats(tasks, key), thr)) key = addDays(key, -1); // today never breaks a streak
  let n = 0;
  while (n < 3650 && goodDay(dayStats(tasks, key), thr)) {
    n++;
    key = addDays(key, -1);
  }
  return n;
}

export function bestStreak(tasks, today, thr = 100) {
  if (!tasks.length) return 0;
  const first = tasks.reduce((m, t) => (t.date < m ? t.date : m), today);
  let best = 0;
  let run = 0;
  let key = first;
  while (key <= today) {
    if (goodDay(dayStats(tasks, key), thr)) {
      run++;
      best = Math.max(best, run);
    } else run = 0;
    key = addDays(key, 1);
  }
  return best;
}

export const totalDone = (tasks) => tasks.reduce((a, t) => a + (t.doneDates || []).length, 0);

export function completionRate(tasks, today, days = 30) {
  let done = 0;
  let total = 0;
  for (let i = 0; i < days; i++) {
    const s = dayStats(tasks, addDays(today, -i));
    done += s.done;
    total += s.total;
  }
  return total ? done / total : 0;
}

export function weekBars(tasks, today, n = 7) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const key = addDays(today, -i);
    const s = dayStats(tasks, key);
    out.push({
      key,
      label: fromKey(key).toLocaleDateString(undefined, { weekday: "short" }),
      ...s,
    });
  }
  return out;
}

export function categoryDone(tasks, today, days = 30) {
  const map = {};
  for (let i = 0; i < days; i++) {
    const key = addDays(today, -i);
    for (const t of tasksOn(tasks, key)) {
      if (isDone(t, key)) map[t.category] = (map[t.category] || 0) + 1;
    }
  }
  return Object.entries(map)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count);
}

// GitHub-style grid: columns are weeks (Sun..Sat), oldest first
export function heatmap(tasks, today, weeks = 26) {
  const end = fromKey(today);
  const start = new Date(end);
  start.setDate(end.getDate() - end.getDay() - (weeks - 1) * 7);
  const columns = [];
  const months = [];
  let lastMonth = -1;
  for (let w = 0; w < weeks; w++) {
    const col = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(start);
      day.setDate(start.getDate() + w * 7 + d);
      const key = toKey(day);
      const future = key > today;
      const s = future ? { total: 0, done: 0, pct: 0 } : dayStats(tasks, key);
      let level = 0;
      if (s.total > 0 && s.done > 0) level = s.pct >= 1 ? 4 : s.pct >= 0.67 ? 3 : s.pct >= 0.34 ? 2 : 1;
      col.push({ key, future, level, ...s });
      if (d === 0 && day.getMonth() !== lastMonth) {
        lastMonth = day.getMonth();
        months.push({ col: w, label: monthLabel(`${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}`, { month: "short" }) });
      }
    }
    columns.push(col);
  }
  return { columns, months };
}
