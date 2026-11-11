import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import PageHeader, { Empty, Page } from "../components/PageHeader";
import TaskItem from "../components/TaskItem";
import { useStore } from "../lib/store";
import { useUI } from "../lib/ui";
import { dayStats, tasksOn } from "../lib/tasks";
import { catColor } from "../lib/constants";
import { fmtDate, fromKey, monthKey, monthLabel, monthMatrix, shiftMonth, todayKey } from "../lib/dates";

const DOW = ["S", "M", "T", "W", "T", "F", "S"];

export default function Calendar() {
  const { state } = useStore();
  const { openTask } = useUI();
  const today = todayKey();
  const [month, setMonth] = useState(monthKey());
  const [selected, setSelected] = useState(today);

  const [y, m] = month.split("-").map(Number);
  const weeks = useMemo(() => monthMatrix(y, m - 1), [y, m]);
  const dayTasks = tasksOn(state.tasks, selected);
  const sStats = dayStats(state.tasks, selected);

  const go = (n) => setMonth((p) => shiftMonth(p, n));
  const jumpToday = () => {
    setMonth(monthKey());
    setSelected(today);
  };

  return (
    <Page>
      <PageHeader
        title="Calendar"
        subtitle="Tap a day to see or plan its tasks"
        actions={
          <button className="btn btn-primary" onClick={() => openTask(null, { date: selected })}>
            <Plus size={16} /> Add to {fmtDate(selected, { month: "short", day: "numeric" })}
          </button>
        }
      />
      <div className="grid cal-grid">
        <section className="card cal">
          <div className="cal-head">
            <h3>{monthLabel(month)}</h3>
            <div className="row gap">
              <button className="btn btn-ghost btn-sm" onClick={jumpToday}>
                Today
              </button>
              <button className="icon-btn" onClick={() => go(-1)} aria-label="Previous month">
                <ChevronLeft size={18} />
              </button>
              <button className="icon-btn" onClick={() => go(1)} aria-label="Next month">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div className="cal-dow">
            {DOW.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
          <div className="cal-body">
            {weeks.flat().map((key) => {
              const inMonth = key.slice(0, 7) === month;
              const s = dayStats(state.tasks, key);
              const cats = [...new Set(tasksOn(state.tasks, key).map((t) => t.category))].slice(0, 3);
              const cls = ["cal-day", !inMonth && "out", key === today && "is-today", key === selected && "sel", s.total > 0 && s.done === s.total && "all-done"]
                .filter(Boolean)
                .join(" ");
              return (
                <button key={key} className={cls} onClick={() => setSelected(key)} aria-label={`${fmtDate(key)}: ${s.done} of ${s.total} done`}>
                  <span className="cal-num">{fromKey(key).getDate()}</span>
                  <span className="cal-dots">
                    {cats.map((c) => (
                      <i key={c} style={{ background: catColor(c) }} />
                    ))}
                  </span>
                  {s.total > 0 && (
                    <span className="cal-prog">
                      <b style={{ width: `${s.pct * 100}%` }} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section className="card cal-side">
          <div className="card-head">
            <div>
              <h3>{fmtDate(selected, { weekday: "long", month: "long", day: "numeric" })}</h3>
              <span className="muted small">
                {sStats.total ? `${sStats.done}/${sStats.total} completed` : "No tasks"}
              </span>
            </div>
          </div>
          {dayTasks.length === 0 ? (
            <Empty title="Free day" text="Nothing scheduled." action={<button className="btn btn-ghost btn-sm" onClick={() => openTask(null, { date: selected })}>Plan something</button>} />
          ) : (
            <div className="list">
              <AnimatePresence initial={false}>
                {dayTasks.map((t) => (
                  <TaskItem key={t.id} task={t} dateKey={selected} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </div>
    </Page>
  );
}
