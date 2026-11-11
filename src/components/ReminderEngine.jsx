import { useEffect, useRef } from "react";
import { useStore } from "../lib/store";
import { useNow } from "../lib/ui";
import { isDone, taskStatus, tasksOn } from "../lib/tasks";
import { addDays, toKey } from "../lib/dates";
import { beep, readNotified, showNotification, writeNotified } from "../lib/reminders";

/**
 * Fires the first notification at the task's time, then repeats every `intervalMin`
 * until the task is ticked or `windowMin` has passed. Runs while the app is open.
 * (Closed-app delivery needs the backend + Web Push; sw.js already handles that side.)
 */
export default function ReminderEngine() {
  const { state } = useStore();
  const now = useNow();
  const fired = useRef(readNotified());
  const { tasks, settings } = state;

  useEffect(() => {
    const key = toKey(now);
    const everyMs = Math.max(1, settings.intervalMin) * 60000;
    let changed = false;

    for (const t of tasksOn(tasks, key)) {
      if (!t.time || isDone(t, key)) continue;
      const st = taskStatus(t, key, now, settings.windowMin);
      if (st.state !== "ringing") continue;

      const id = `${t.id}:${key}`;
      if (now.getTime() - (fired.current[id] || 0) < everyMs - 500) continue;

      fired.current[id] = now.getTime();
      changed = true;
      const attempt = Math.floor((now - st.due) / everyMs) + 1;
      const minsLeft = Math.max(0, Math.ceil((st.end - now) / 60000));
      if (settings.notifications) {
        showNotification(
          attempt === 1 ? `⏰ ${t.title}` : `⏰ Still pending: ${t.title}`,
          attempt === 1 ? "It's time. Tick it off when you're done." : `Reminder ${attempt} · ${minsLeft} min left in the window`,
          id
        );
      }
      if (settings.sound) beep();
    }

    if (changed) {
      // drop entries older than yesterday so storage stays tiny
      const keep = [key, addDays(key, -1)];
      for (const k of Object.keys(fired.current)) if (!keep.some((d) => k.endsWith(`:${d}`))) delete fired.current[k];
      writeNotified(fired.current);
    }
  }, [now, tasks, settings]);

  return null;
}
