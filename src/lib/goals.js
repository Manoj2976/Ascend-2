// Progress helpers for the three target levels

export const pct = (g) => (g.target > 0 ? Math.min(1, (g.progress || 0) / g.target) : 0);

export const dailyCount = (g, key) => (g.logs && g.logs[key]) || 0;

export const dailyPct = (g, key) => (g.target > 0 ? Math.min(1, dailyCount(g, key) / g.target) : 0);

export const children = (final, goals) => goals.filter((x) => x.type === "MONTHLY" && x.parentId === final.id);

// A final target is the average of the monthly targets linked to it,
// or its own manual progress when nothing is linked yet.
export const finalPct = (final, goals) => {
  const kids = children(final, goals);
  if (kids.length) return kids.reduce((a, k) => a + pct(k), 0) / kids.length;
  return pct(final);
};

export const dailyStreak = (g, today, addDays) => {
  let key = today;
  if (dailyCount(g, key) < g.target) key = addDays(key, -1);
  let n = 0;
  while (n < 3650 && dailyCount(g, key) >= g.target && g.target > 0) {
    n++;
    key = addDays(key, -1);
  }
  return n;
};
