import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BellRing, Check } from "lucide-react";
import { useStore } from "../lib/store";
import { useNow } from "../lib/ui";
import { isDone, taskStatus, tasksOn } from "../lib/tasks";
import { fmtTime, mmss, toKey } from "../lib/dates";

// Sticky in-app alarm: stays on screen until the task is ticked or the reminder window closes
export default function ReminderBanner() {
  const { state, toggleTask } = useStore();
  const now = useNow();
  const key = toKey(now);

  const ringing = tasksOn(state.tasks, key)
    .filter((t) => t.time && !isDone(t, key))
    .map((t) => ({ t, st: taskStatus(t, key, now, state.settings.windowMin) }))
    .filter((x) => x.st.state === "ringing");

  const first = ringing[0]?.t.title;
  useEffect(() => {
    if (!first) return undefined;
    const original = document.title;
    document.title = `🔔 ${first}`;
    return () => {
      document.title = original;
    };
  }, [first]);

  return (
    <div className="banners" aria-live="assertive">
      <AnimatePresence>
        {ringing.map(({ t, st }) => (
          <motion.div
            key={t.id}
            layout
            className="banner"
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
          >
            <span className="banner-icon">
              <BellRing size={20} />
            </span>
            <div className="banner-text">
              <strong>{t.title}</strong>
              <span>
                Due {fmtTime(t.time)} · reminding for {mmss(Math.max(0, Math.round((st.end - now) / 1000)))} more
              </span>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => toggleTask(t.id, key)}>
              <Check size={16} /> Done
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
