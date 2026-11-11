import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { todayKey } from "./dates";
import { isUuid, uid } from "./constants";
import { makeSample } from "./sample";
import { DEFAULT_DIET, normalizeDiet } from "./diet";

// Data written before accounts existed lives under this key; it is also the "no account" (guest) store.
export const GUEST_KEY = "ascend:v1";

export const DEFAULT_SETTINGS = {
  name: "",
  theme: "light", // light | dark | auto
  windowMin: 30, // keep reminding for this long after the due time
  intervalMin: 5, // ...once every N minutes
  sound: true,
  notifications: true,
  streakThreshold: 80, // % of a day's tasks that must be done for the day to count
  apiBase: "",
};

const empty = () => ({
  tasks: [],
  goals: [],
  journal: {},
  applications: [],
  focus: {},
  timetable: [],
  diet: DEFAULT_DIET(),
  settings: { ...DEFAULT_SETTINGS },
});

// Older data used short random ids. The backend needs UUIDs, so convert once and keep links intact.
function uuidify(st) {
  const map = new Map();
  const fix = (id) => {
    if (isUuid(id)) return id;
    if (!id) return id;
    if (!map.has(id)) map.set(id, uid());
    return map.get(id);
  };
  if ([...st.tasks, ...st.goals, ...st.applications].every((x) => isUuid(x.id) && (!x.goalId || isUuid(x.goalId)) && (!x.parentId || isUuid(x.parentId)))) return st;
  return {
    ...st,
    goals: st.goals.map((g) => ({ ...g, id: fix(g.id), parentId: fix(g.parentId) })),
    tasks: st.tasks.map((t) => ({ ...t, id: fix(t.id), goalId: fix(t.goalId) })),
    applications: st.applications.map((a) => ({ ...a, id: fix(a.id) })),
  };
}

const normalize = (p) => uuidify(normalizeRaw(p));

const normalizeRaw = (p) => {
  const e = empty();
  return {
    ...e,
    ...p,
    tasks: Array.isArray(p?.tasks) ? p.tasks : [],
    goals: Array.isArray(p?.goals) ? p.goals : [],
    applications: Array.isArray(p?.applications) ? p.applications : [],
    journal: p?.journal && typeof p.journal === "object" ? p.journal : {},
    focus: p?.focus && typeof p.focus === "object" ? p.focus : {},
    timetable: Array.isArray(p?.timetable) ? p.timetable : [],
    diet: normalizeDiet(p?.diet),
    settings: { ...DEFAULT_SETTINGS, ...(p?.settings || {}) },
  };
};

function load(storageKey, seedName) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) return normalize(JSON.parse(raw));
  } catch {
    /* corrupted or blocked: start fresh */
  }
  const fresh = empty();
  if (seedName) fresh.settings.name = seedName; // first sign-in: greet them by the name they signed up with
  return fresh;
}

const patchDay = (diet, key, fn) => {
  const cur = diet.logs[key] || { items: [], water: 0 };
  return { ...diet, logs: { ...diet.logs, [key]: fn({ items: cur.items || [], water: cur.water || 0 }) } };
};

function reducer(s, a) {
  switch (a.type) {
    case "replace":
      return normalize(a.state);
    case "merge":
      return { ...s, ...a.patch };

    case "task/add":
      return { ...s, tasks: [...s.tasks, a.task] };
    case "task/update":
      return { ...s, tasks: s.tasks.map((t) => (t.id === a.id ? { ...t, ...a.patch } : t)) };
    case "task/delete":
      return { ...s, tasks: s.tasks.filter((t) => t.id !== a.id) };
    case "task/toggle": {
      const t = s.tasks.find((x) => x.id === a.id);
      if (!t) return s;
      const was = (t.doneDates || []).includes(a.key);
      const doneDates = was ? t.doneDates.filter((d) => d !== a.key) : [...(t.doneDates || []), a.key];
      // Ticking a linked task nudges its monthly target forward (and un-ticking rolls it back)
      const goals = t.goalId
        ? s.goals.map((g) => (g.id === t.goalId ? { ...g, progress: Math.max(0, (g.progress || 0) + (was ? -1 : 1)) } : g))
        : s.goals;
      return { ...s, goals, tasks: s.tasks.map((x) => (x.id === a.id ? { ...x, doneDates } : x)) };
    }

    case "goal/add":
      return { ...s, goals: [...s.goals, a.goal] };
    case "goal/update":
      return { ...s, goals: s.goals.map((g) => (g.id === a.id ? { ...g, ...a.patch } : g)) };
    case "goal/delete":
      return {
        ...s,
        goals: s.goals.filter((g) => g.id !== a.id).map((g) => (g.parentId === a.id ? { ...g, parentId: "" } : g)),
        tasks: s.tasks.map((t) => (t.goalId === a.id ? { ...t, goalId: "" } : t)),
      };
    case "goal/log":
      return {
        ...s,
        goals: s.goals.map((g) => {
          if (g.id !== a.id) return g;
          const logs = { ...(g.logs || {}) };
          logs[a.key] = Math.max(0, (logs[a.key] || 0) + a.delta);
          return { ...g, logs };
        }),
      };

    case "journal/save":
      return { ...s, journal: { ...s.journal, [a.key]: { ...(s.journal[a.key] || {}), ...a.entry } } };
    case "journal/delete": {
      const j = { ...s.journal };
      delete j[a.key];
      return { ...s, journal: j };
    }

    case "app/add":
      return { ...s, applications: [...s.applications, a.app] };
    case "app/update":
      return { ...s, applications: s.applications.map((x) => (x.id === a.id ? { ...x, ...a.patch } : x)) };
    case "app/delete":
      return { ...s, applications: s.applications.filter((x) => x.id !== a.id) };

    case "focus/add":
      return { ...s, focus: { ...s.focus, [a.key]: (s.focus[a.key] || 0) + a.minutes } };

    // ── Time table ──
    case "tt/add":
      return { ...s, timetable: [...s.timetable, ...a.entries] };
    case "tt/update":
      return { ...s, timetable: s.timetable.map((e) => (e.id === a.id ? { ...e, ...a.patch } : e)) };
    case "tt/delete":
      return { ...s, timetable: s.timetable.filter((e) => e.id !== a.id) };

    // ── Diet ──
    case "diet/addItem":
      return { ...s, diet: patchDay(s.diet, a.key, (l) => ({ ...l, items: [...l.items, a.item] })) };
    case "diet/updateItem":
      return { ...s, diet: patchDay(s.diet, a.key, (l) => ({ ...l, items: l.items.map((i) => (i.id === a.id ? { ...i, ...a.patch } : i)) })) };
    case "diet/deleteItem":
      return { ...s, diet: patchDay(s.diet, a.key, (l) => ({ ...l, items: l.items.filter((i) => i.id !== a.id) })) };
    case "diet/water":
      return { ...s, diet: patchDay(s.diet, a.key, (l) => ({ ...l, water: Math.min(30, Math.max(0, l.water + a.delta)) })) };
    case "diet/goals":
      return { ...s, diet: { ...s.diet, goals: { ...s.diet.goals, ...a.patch } } };
    case "diet/plan":
      return { ...s, diet: { ...s.diet, plan: { ...s.diet.plan, [a.day]: { ...(s.diet.plan[a.day] || {}), [a.meal]: a.text } } } };

    case "settings":
      return { ...s, settings: { ...s.settings, ...a.patch } };

    default:
      return s;
  }
}

const Ctx = createContext(null);

export function StoreProvider({ children, storageKey = GUEST_KEY, seedName = "" }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => load(storageKey, seedName));

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      /* storage full or blocked */
    }
  }, [state, storageKey]);

  const actions = useMemo(
    () => ({
      addTask: (data) => {
        const task = {
          id: uid(),
          title: "",
          date: todayKey(),
          time: "",
          category: "Personal",
          repeat: "none",
          goalId: "",
          notes: "",
          doneDates: [],
          ...data,
        };
        dispatch({ type: "task/add", task });
        return task.id;
      },
      updateTask: (id, patch) => dispatch({ type: "task/update", id, patch }),
      deleteTask: (id) => dispatch({ type: "task/delete", id }),
      toggleTask: (id, key) => dispatch({ type: "task/toggle", id, key }),

      addGoal: (data) => {
        const goal = { id: uid(), title: "", target: 1, progress: 0, parentId: "", logs: {}, ...data };
        dispatch({ type: "goal/add", goal });
        return goal.id;
      },
      updateGoal: (id, patch) => dispatch({ type: "goal/update", id, patch }),
      deleteGoal: (id) => dispatch({ type: "goal/delete", id }),
      logDaily: (id, key, delta) => dispatch({ type: "goal/log", id, key, delta }),

      saveJournal: (key, entry) => dispatch({ type: "journal/save", key, entry }),
      deleteJournal: (key) => dispatch({ type: "journal/delete", key }),

      addApp: (data) => dispatch({ type: "app/add", app: { id: uid(), status: "Wishlist", date: todayKey(), link: "", notes: "", ...data } }),
      updateApp: (id, patch) => dispatch({ type: "app/update", id, patch }),
      deleteApp: (id) => dispatch({ type: "app/delete", id }),

      addFocus: (minutes) => dispatch({ type: "focus/add", key: todayKey(), minutes }),

      // `days` is a list of weekday numbers (0 = Sunday): one entry is created per day
      addTimetable: (data, days) =>
        dispatch({
          type: "tt/add",
          entries: days.map((day) => ({ id: uid(), title: "", kind: "Class", place: "", notes: "", ...data, day })),
        }),
      updateTimetable: (id, patch) => dispatch({ type: "tt/update", id, patch }),
      deleteTimetable: (id) => dispatch({ type: "tt/delete", id }),

      addFood: (key, data) => dispatch({ type: "diet/addItem", key, item: { id: uid(), meal: "Breakfast", name: "", kcal: 0, protein: 0, carbs: 0, fat: 0, ...data } }),
      updateFood: (key, id, patch) => dispatch({ type: "diet/updateItem", key, id, patch }),
      deleteFood: (key, id) => dispatch({ type: "diet/deleteItem", key, id }),
      addWater: (key, delta) => dispatch({ type: "diet/water", key, delta }),
      setDietGoals: (patch) => dispatch({ type: "diet/goals", patch }),
      setMealPlan: (day, meal, text) => dispatch({ type: "diet/plan", day, meal, text }),

      setSettings: (patch) => dispatch({ type: "settings", patch }),

      loadSample: () => dispatch({ type: "replace", state: { ...makeSample(), settings: state.settings } }),
      exportData: () => JSON.stringify(state, null, 2),
      importData: (json) => {
        const parsed = JSON.parse(json);
        if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.tasks)) throw new Error("Not an Ascend backup file");
        dispatch({ type: "replace", state: parsed });
      },
      adoptState: (next) => dispatch({ type: "replace", state: next }),
      resetAll: () => dispatch({ type: "replace", state: { settings: state.settings } }),
    }),
    [state]
  );

  const value = useMemo(() => ({ state, ...actions }), [state, actions]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);
