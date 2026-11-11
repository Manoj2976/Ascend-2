import { motion } from "framer-motion";
import { Bell, Link2, Repeat } from "lucide-react";
import Check from "./Check";
import { useStore } from "../lib/store";
import { useNow, useUI } from "../lib/ui";
import { taskStatus, isDone } from "../lib/tasks";
import { catColor } from "../lib/constants";
import { fmtTime, mmss } from "../lib/dates";

export default function TaskItem({ task, dateKey, showDate = false }) {
  const { state, toggleTask } = useStore();
  const { openTask } = useUI();
  const now = useNow();
  const done = isDone(task, dateKey);
  const st = taskStatus(task, dateKey, now, state.settings.windowMin);
  const goal = task.goalId ? state.goals.find((g) => g.id === task.goalId) : null;
  const color = catColor(task.category);
  const left = st.state === "ringing" ? Math.max(0, Math.round((st.end - now) / 1000)) : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 420, damping: 34 }}
      className={`task ${done ? "is-done" : ""} ${st.state === "ringing" ? "is-ringing" : ""}`}
      onClick={() => openTask(task)}
    >
      <Check checked={done} color={color} onChange={() => toggleTask(task.id, dateKey)} />
      <div className="task-main">
        <div className="task-title">{task.title}</div>
        <div className="task-meta">
          {showDate && <span className="chip">{dateKey}</span>}
          {task.time && (
            <span className={`chip ${st.state === "ringing" ? "chip-alert" : st.state === "missed" ? "chip-miss" : ""}`}>
              {st.state === "ringing" ? <Bell size={12} /> : null}
              {fmtTime(task.time)}
            </span>
          )}
          <span className="chip chip-cat">
            <i style={{ background: color }} />
            {task.category}
          </span>
          {task.repeat !== "none" && (
            <span className="chip" title={`Repeats ${task.repeat}`}>
              <Repeat size={12} />
            </span>
          )}
          {goal && (
            <span className="chip" title="Linked target">
              <Link2 size={12} />
              {goal.title}
            </span>
          )}
        </div>
      </div>
      {st.state === "ringing" && <span className="badge badge-alert">Due now · {mmss(left)}</span>}
      {st.state === "missed" && <span className="badge badge-miss">Missed</span>}
    </motion.div>
  );
}
