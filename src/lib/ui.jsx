import { createContext, useContext, useEffect, useMemo, useState } from "react";

// Modal state + the shared one-second clock

const UICtx = createContext(null);
const NowCtx = createContext(new Date());

export function NowProvider({ children }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
<<<<<<< HEAD
    // every 10s is plenty (the UI shows minutes) and avoids re-rendering every task and the timetable each second
    const id = setInterval(() => document.visibilityState !== "hidden" && setNow(new Date()), 10000);
=======
    const id = setInterval(() => setNow(new Date()), 1000);
>>>>>>> 6e9173cad89b7b53fed34d11013f586fd91d429b
    return () => clearInterval(id);
  }, []);
  return <NowCtx.Provider value={now}>{children}</NowCtx.Provider>;
}

export const useNow = () => useContext(NowCtx);

export function UIProvider({ children }) {
  const [taskModal, setTaskModal] = useState({ open: false, task: null, defaults: null });
  const [goalModal, setGoalModal] = useState({ open: false, goal: null, type: "MONTHLY", defaults: null });
  const [appModal, setAppModal] = useState({ open: false, app: null, defaults: null });
  const [ttModal, setTtModal] = useState({ open: false, entry: null, defaults: null });
  const [foodModal, setFoodModal] = useState({ open: false, item: null, dateKey: "", defaults: null });

  const value = useMemo(
    () => ({
      taskModal,
      goalModal,
      appModal,
      ttModal,
      foodModal,
      openTask: (task = null, defaults = null) => setTaskModal({ open: true, task, defaults }),
      closeTask: () => setTaskModal((m) => ({ ...m, open: false })),
      openGoal: (goal = null, type = "MONTHLY", defaults = null) => setGoalModal({ open: true, goal, type, defaults }),
      closeGoal: () => setGoalModal((m) => ({ ...m, open: false })),
      openApp: (app = null, defaults = null) => setAppModal({ open: true, app, defaults }),
      closeApp: () => setAppModal((m) => ({ ...m, open: false })),
      openTT: (entry = null, defaults = null) => setTtModal({ open: true, entry, defaults }),
      closeTT: () => setTtModal((m) => ({ ...m, open: false })),
      openFood: (dateKey, item = null, defaults = null) => setFoodModal({ open: true, item, dateKey, defaults }),
      closeFood: () => setFoodModal((m) => ({ ...m, open: false })),
    }),
    [taskModal, goalModal, appModal, ttModal, foodModal]
  );

  return <UICtx.Provider value={value}>{children}</UICtx.Provider>;
}

export const useUI = () => useContext(UICtx);
