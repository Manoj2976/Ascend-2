import { useState } from "react";
import { ChevronLeft, ChevronRight, Flame, Minus, Mountain, Pencil, Plus } from "lucide-react";
import PageHeader, { Empty, Page } from "../components/PageHeader";
import Ring, { Bar } from "../components/Ring";
import { useStore } from "../lib/store";
import { useUI } from "../lib/ui";
import { children, dailyCount, dailyPct, dailyStreak, finalPct, pct } from "../lib/goals";
import { addDays, daysBetween, fmtDate, monthKey, monthLabel, shiftMonth, todayKey } from "../lib/dates";

export default function Targets() {
  const { state, logDaily, updateGoal } = useStore();
  const { openGoal } = useUI();
  const today = todayKey();
  const [month, setMonth] = useState(monthKey());

  const finals = state.goals.filter((g) => g.type === "FINAL");
  const monthly = state.goals.filter((g) => g.type === "MONTHLY" && g.month === month);
  const daily = state.goals.filter((g) => g.type === "DAILY");

  const bump = (g, d) => updateGoal(g.id, { progress: Math.max(0, (g.progress || 0) + d) });

  return (
    <Page>
      <PageHeader title="Targets" subtitle="Final goal → monthly milestones → daily habits" />

      {/* FINAL */}
      <section className="section">
        <div className="section-head">
          <h2>Final target</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => openGoal(null, "FINAL")}>
            <Plus size={15} /> Add
          </button>
        </div>
        {finals.length === 0 ? (
          <div className="card">
            <Empty icon={<Mountain size={24} />} title="Define where you're headed" text="Your final target keeps every daily task pointed at the same outcome." action={<button className="btn btn-primary btn-sm" onClick={() => openGoal(null, "FINAL")}>Set final target</button>} />
          </div>
        ) : (
          <div className="grid g2">
            {finals.map((g) => {
              const p = finalPct(g, state.goals);
              const kids = children(g, state.goals);
              const left = g.deadline ? daysBetween(today, g.deadline) : null;
              return (
                <div key={g.id} className="card final-big">
                  <div className="card-head">
                    <h3>{g.title}</h3>
                    <button className="icon-btn" onClick={() => openGoal(g)} aria-label="Edit">
                      <Pencil size={16} />
                    </button>
                  </div>
                  <div className="final-body">
                    <Ring pct={p} size={110} stroke={12} from="#4f6bff" to="#ec4899">
                      <strong className="big-num">{Math.round(p * 100)}%</strong>
                    </Ring>
                    <div className="stack grow">
                      <span className="muted">{left == null ? "No deadline" : left >= 0 ? `${left} days to go` : `${-left} days past deadline`}</span>
                      {g.deadline && <span className="small muted">Deadline {fmtDate(g.deadline, { month: "long", day: "numeric", year: "numeric" })}</span>}
                      <span className="small">{kids.length ? `${kids.length} monthly target${kids.length > 1 ? "s" : ""} linked` : "Link monthly targets to track this automatically"}</span>
                    </div>
                  </div>
                  {kids.length > 0 && (
                    <div className="stack kids">
                      {kids.map((k) => (
                        <div key={k.id}>
                          <div className="row between small">
                            <span>{k.title}</span>
                            <span className="muted">{monthLabel(k.month, { month: "short" })} · {Math.round(pct(k) * 100)}%</span>
                          </div>
                          <Bar pct={pct(k)} height={6} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* MONTHLY */}
      <section className="section">
        <div className="section-head">
          <h2>Monthly targets</h2>
          <div className="row gap">
            <button className="icon-btn" onClick={() => setMonth((m) => shiftMonth(m, -1))} aria-label="Previous month">
              <ChevronLeft size={18} />
            </button>
            <strong className="month-chip">{monthLabel(month)}</strong>
            <button className="icon-btn" onClick={() => setMonth((m) => shiftMonth(m, 1))} aria-label="Next month">
              <ChevronRight size={18} />
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => openGoal(null, "MONTHLY", { month })}>
              <Plus size={15} /> Add
            </button>
          </div>
        </div>
        {monthly.length === 0 ? (
          <div className="card">
            <Empty title="No targets for this month" text="Break your final target into something you can finish in 30 days." action={<button className="btn btn-primary btn-sm" onClick={() => openGoal(null, "MONTHLY", { month })}>Add monthly target</button>} />
          </div>
        ) : (
          <div className="grid g3">
            {monthly.map((g) => {
              const linked = state.tasks.filter((t) => t.goalId === g.id).length;
              return (
                <div key={g.id} className="card goal">
                  <div className="card-head">
                    <h3>{g.title}</h3>
                    <button className="icon-btn" onClick={() => openGoal(g)} aria-label="Edit">
                      <Pencil size={16} />
                    </button>
                  </div>
                  <div className="goal-num">
                    <strong>{g.progress || 0}</strong>
                    <span className="muted">
                      / {g.target} {g.unit}
                    </span>
                    <span className="pct">{Math.round(pct(g) * 100)}%</span>
                  </div>
                  <Bar pct={pct(g)} height={10} />
                  <div className="row between">
                    <span className="small muted">{linked ? `${linked} linked task${linked > 1 ? "s update" : " updates"} this automatically` : "Adjust manually"}</span>
                    <div className="stepper">
                      <button onClick={() => bump(g, -1)} aria-label="Decrease">
                        <Minus size={14} />
                      </button>
                      <button onClick={() => bump(g, 1)} aria-label="Increase">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* DAILY */}
      <section className="section">
        <div className="section-head">
          <h2>Daily targets</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => openGoal(null, "DAILY")}>
            <Plus size={15} /> Add
          </button>
        </div>
        {daily.length === 0 ? (
          <div className="card">
            <Empty title="No daily targets" text='Small repeatable wins, like "3 DSA problems" or "1 aptitude set".' action={<button className="btn btn-primary btn-sm" onClick={() => openGoal(null, "DAILY")}>Add daily target</button>} />
          </div>
        ) : (
          <div className="grid g3">
            {daily.map((g) => {
              const n = dailyCount(g, today);
              const streak = dailyStreak(g, today, addDays);
              const last7 = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
              return (
                <div key={g.id} className="card goal">
                  <div className="card-head">
                    <h3>{g.title}</h3>
                    <button className="icon-btn" onClick={() => openGoal(g)} aria-label="Edit">
                      <Pencil size={16} />
                    </button>
                  </div>
                  <div className="dt big">
                    <Ring pct={dailyPct(g, today)} size={72} stroke={9} from="#30c85e" to="#32ade6">
                      <strong>{n}</strong>
                    </Ring>
                    <div className="grow">
                      <strong>
                        {n}/{g.target} {g.unit}
                      </strong>
                      <span className="small muted">today</span>
                      {streak > 0 && (
                        <span className="pill pill-fire">
                          <Flame size={13} /> {streak}d
                        </span>
                      )}
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
                  <div className="dots7" aria-label="Last 7 days">
                    {last7.map((k) => (
                      <span key={k} title={`${fmtDate(k)}: ${dailyCount(g, k)}/${g.target}`} className={dailyCount(g, k) >= g.target ? "hit" : dailyCount(g, k) > 0 ? "part" : ""} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </Page>
  );
}
