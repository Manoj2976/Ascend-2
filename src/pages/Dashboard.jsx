import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ArrowRight, CalendarClock, Flame, Minus, Mountain, Plus, Sparkles, Zap } from "lucide-react";
import { Page, Empty } from "../components/PageHeader";
import Ring, { Bar } from "../components/Ring";
import TaskItem from "../components/TaskItem";
import FocusTimer from "../components/FocusTimer";
import { useStore } from "../lib/store";
import { useUI } from "../lib/ui";
import { dayStats, isDone, overdueTasks, tasksOn } from "../lib/tasks";
import { currentStreak, weekBars } from "../lib/stats";
import { dailyCount, dailyPct, finalPct, pct } from "../lib/goals";
import { parseQuickAdd } from "../lib/quickadd";
import { daysBetween, fmtDate, fmtTime, greeting, monthKey, monthLabel, todayKey } from "../lib/dates";

export default function Dashboard() {
  const { state, addTask, updateTask, logDaily } = useStore();
  const { openTask, openGoal } = useUI();
  const [quick, setQuick] = useState("");

  const today = todayKey();
  const { tasks, goals, settings } = state;
  const list = tasksOn(tasks, today);
  const stats = dayStats(tasks, today);
  const streak = currentStreak(tasks, today, settings.streakThreshold);
  const overdue = overdueTasks(tasks, today);
  const monthly = goals.filter((g) => g.type === "MONTHLY" && g.month === monthKey());
  const finals = goals.filter((g) => g.type === "FINAL");
  const daily = goals.filter((g) => g.type === "DAILY");
  const week = weekBars(tasks, today);
  const next = list.find((t) => t.time && !isDone(t, today) && t.time >= new Date().toTimeString().slice(0, 5));
  const fresh = !tasks.length && !goals.length;

  const submitQuick = (e) => {
    e.preventDefault();
    const p = parseQuickAdd(quick);
    if (!p.title) return;
    addTask(p);
    setQuick("");
  };

  return (
    <Page>
      <header className="hero">
        <div>
          <p className="eyebrow">{fmtDate(today, { weekday: "long", month: "long", day: "numeric" })}</p>
          <h1>
            {greeting()}
            {settings.name ? `, ${settings.name}` : ""}
          </h1>
        </div>
        <form className="quick" onSubmit={submitQuick}>
          <Sparkles size={16} />
          <input value={quick} onChange={(e) => setQuick(e.target.value)} placeholder='Quick add — "Bath 9pm daily", "Study OS 7pm tomorrow"' aria-label="Quick add a task" />
          <button className="btn btn-primary btn-sm" disabled={!quick.trim()}>
            Add
          </button>
        </form>
      </header>

      {fresh && (
        <div className="card welcome">
          <Mountain size={28} />
          <div className="grow">
            <strong>Welcome to Ascend</strong>
            <p className="muted">Start by setting your final target, then break it into monthly and daily targets.</p>
          </div>
          <div className="row gap">
            <button className="btn btn-primary" onClick={() => openGoal(null, "FINAL")}>
              Set final target
            </button>
          </div>
        </div>
      )}

      <div className="grid dash">
        {/* Today ring */}
        <section className="card today-card">
          <div className="card-head">
            <h3>Today</h3>
            <span className={`pill ${streak ? "pill-fire" : ""}`}>
              <Flame size={14} /> {streak} day streak
            </span>
          </div>
          <div className="today-body">
            <Ring pct={stats.pct} size={132} stroke={14}>
              <div className="ring-big">
                <strong>{Math.round(stats.pct * 100)}%</strong>
                <span>
                  {stats.done}/{stats.total} done
                </span>
              </div>
            </Ring>
            <div className="today-side">
              {stats.total === 0 ? (
                <p className="muted">Nothing planned yet. Add your first task.</p>
              ) : stats.done === stats.total ? (
                <p className="win">All done — great work today 🎉</p>
              ) : next ? (
                <>
                  <span className="eyebrow">Up next</span>
                  <strong>{next.title}</strong>
                  <span className="muted">
                    <CalendarClock size={13} /> {fmtTime(next.time)}
                  </span>
                </>
              ) : (
                <p className="muted">{stats.total - stats.done} task(s) left today.</p>
              )}
            </div>
          </div>
          <div className="week-strip" aria-label="Last 7 days">
            {week.map((d) => (
              <div key={d.key} className={`wk ${d.key === today ? "today" : ""}`} title={`${d.done}/${d.total}`}>
                <div className="wk-bar">
                  <div className="wk-fill" style={{ height: `${Math.round(d.pct * 100)}%` }} />
                </div>
                <span>{d.label.slice(0, 1)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Final target */}
        <section className="card final-card">
          <div className="card-head">
            <h3>Final target</h3>
            <Link to="/targets" className="link">
              All targets <ArrowRight size={14} />
            </Link>
          </div>
          {finals.length === 0 ? (
            <Empty icon={<Mountain size={22} />} title="No final target yet" text="What does success look like at the end of placements?" action={<button className="btn btn-primary btn-sm" onClick={() => openGoal(null, "FINAL")}>Set final target</button>} />
          ) : (
            finals.slice(0, 2).map((g) => {
              const p = finalPct(g, goals);
              const left = g.deadline ? daysBetween(today, g.deadline) : null;
              return (
                <div key={g.id} className="final" onClick={() => openGoal(g)}>
                  <div className="final-top">
                    <strong>{g.title}</strong>
                    <span className="big-num">{Math.round(p * 100)}%</span>
                  </div>
                  <Bar pct={p} color="linear-gradient(90deg,#4f6bff,#8b5cf6,#ec4899)" height={10} />
                  <span className="muted small">{left == null ? "No deadline set" : left >= 0 ? `${left} days left · ${fmtDate(g.deadline, { month: "short", day: "numeric", year: "numeric" })}` : `Deadline passed ${-left} days ago`}</span>
                </div>
              );
            })
          )}
        </section>

        {/* Monthly */}
        <section className="card monthly-card">
          <div className="card-head">
            <h3>{monthLabel(monthKey(), { month: "long" })} targets</h3>
            <button className="icon-btn" onClick={() => openGoal(null, "MONTHLY")} aria-label="Add monthly target">
              <Plus size={18} />
            </button>
          </div>
          {monthly.length === 0 ? (
            <p className="muted">No monthly targets for this month.</p>
          ) : (
            <div className="stack">
              {monthly.map((g) => (
                <div key={g.id} className="mt" onClick={() => openGoal(g)}>
                  <div className="row between">
                    <span>{g.title}</span>
                    <span className="muted small">
                      {g.progress || 0}/{g.target} {g.unit}
                    </span>
                  </div>
                  <Bar pct={pct(g)} color="var(--accent)" />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Tasks */}
        <section className="card tasks-card">
          <div className="card-head">
            <h3>Today's tasks</h3>
            <button className="btn btn-primary btn-sm" onClick={() => openTask()}>
              <Plus size={15} /> New
            </button>
          </div>
          {list.length === 0 ? (
            <Empty icon={<Zap size={22} />} title="A clean slate" text="Use quick add above or tap New." />
          ) : (
            <div className="list">
              <AnimatePresence initial={false}>
                {list.map((t) => (
                  <TaskItem key={t.id} task={t} dateKey={today} />
                ))}
              </AnimatePresence>
            </div>
          )}

          {overdue.length > 0 && (
            <div className="overdue">
              <div className="row between">
                <h4>Carried over ({overdue.length})</h4>
              </div>
              {overdue.slice(0, 4).map((t) => (
                <div key={t.id} className="od-row">
                  <span>
                    {t.title} <span className="muted small">· {fmtDate(t.date)}</span>
                  </span>
                  <button className="btn btn-ghost btn-sm" onClick={() => updateTask(t.id, { date: today, time: "" })}>
                    Move to today
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Daily targets + focus */}
        <div className="col-stack">
          <section className="card daily-card">
            <div className="card-head">
              <h3>Daily targets</h3>
              <button className="icon-btn" onClick={() => openGoal(null, "DAILY")} aria-label="Add daily target">
                <Plus size={18} />
              </button>
            </div>
            {daily.length === 0 ? (
              <p className="muted">Add a daily target like "3 DSA problems".</p>
            ) : (
              <div className="stack">
                {daily.map((g) => {
                  const n = dailyCount(g, today);
                  return (
                    <div key={g.id} className="dt">
                      <Ring pct={dailyPct(g, today)} size={46} stroke={6} from="#30c85e" to="#32ade6">
                        <span className="tiny">{n}</span>
                      </Ring>
                      <div className="grow" onClick={() => openGoal(g)}>
                        <strong>{g.title}</strong>
                        <span className="muted small">
                          {n}/{g.target} {g.unit}
                        </span>
                      </div>
                      <div className="stepper">
                        <button onClick={() => logDaily(g.id, today, -1)} aria-label="Decrease">
                          <Minus size={14} />
                        </button>
                        <button onClick={() => logDaily(g.id, today, 1)} aria-label="Increase">
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
          <FocusTimer />
        </div>
      </div>
    </Page>
  );
}
