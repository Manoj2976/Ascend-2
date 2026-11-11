import { addDays, dowOf } from "./dates";

export const MEALS = ["Breakfast", "Lunch", "Snacks", "Dinner"];
export const MEAL_COLORS = { Breakfast: "#ff9f0a", Lunch: "#30c85e", Snacks: "#bf5af2", Dinner: "#0a84ff" };

export const DEFAULT_DIET = () => ({
  goals: { calories: 2000, protein: 60, water: 8 }, // starting points only: the user edits these
  logs: {}, // { "2026-11-10": { items: [{ id, meal, name, kcal, protein, carbs, fat }], water: 3 } }
  plan: {}, // { "1": { Breakfast: "Oats + banana", ... } }  keyed by weekday, 0 = Sunday
});

export const normalizeDiet = (d) => {
  const base = DEFAULT_DIET();
  return {
    goals: { ...base.goals, ...(d?.goals || {}) },
    logs: d?.logs && typeof d.logs === "object" ? d.logs : {},
    plan: d?.plan && typeof d.plan === "object" ? d.plan : {},
  };
};

export const dayLog = (diet, key) => {
  const l = diet.logs[key];
  return { items: l?.items || [], water: l?.water || 0 };
};

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

export const totals = (log) =>
  log.items.reduce(
    (t, i) => ({ kcal: t.kcal + num(i.kcal), protein: t.protein + num(i.protein), carbs: t.carbs + num(i.carbs), fat: t.fat + num(i.fat) }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

export const mealItems = (log, meal) => log.items.filter((i) => i.meal === meal);

// The foods you log most recently, one entry per name, for one-tap re-adding
export function recentFoods(diet, limit = 8) {
  const seen = new Set();
  const out = [];
  const dates = Object.keys(diet.logs).sort().reverse();
  for (const d of dates) {
    const items = diet.logs[d]?.items || [];
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      const k = (it.name || "").trim().toLowerCase();
      if (!k || seen.has(k)) continue;
      seen.add(k);
      out.push({ meal: it.meal, name: it.name, kcal: it.kcal, protein: it.protein, carbs: it.carbs, fat: it.fat });
      if (out.length >= limit) return out;
    }
  }
  return out;
}

export function lastDaysKcal(diet, today, n = 7) {
  return Array.from({ length: n }, (_, i) => {
    const key = addDays(today, i - (n - 1));
    return { key, kcal: totals(dayLog(diet, key)).kcal, logged: dayLog(diet, key).items.length > 0 };
  });
}

export const plannedFor = (diet, key, meal) => (diet.plan[String(dowOf(key))] || {})[meal] || "";
