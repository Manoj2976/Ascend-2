import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Droplets, Minus, Plus, Salad } from "lucide-react";
import PageHeader, { Empty, Page } from "../components/PageHeader";
import Ring, { Bar } from "../components/Ring";
import { useStore } from "../lib/store";
import { useUI } from "../lib/ui";
import { DAY_LONG, DAY_ORDER } from "../lib/timetable";
import { MEALS, MEAL_COLORS, dayLog, lastDaysKcal, mealItems, plannedFor, recentFoods, totals } from "../lib/diet";
import { addDays, fmtDate, todayKey } from "../lib/dates";

const round = (v) => Math.round(v * 10) / 10;

function MealCard({ meal, log, dateKey, planned }) {
  const { openFood } = useUI();
  const { addFood } = useStore();
  const items = mealItems(log, meal);
  const kcal = items.reduce((a, i) => a + (Number(i.kcal) || 0), 0);
  return (
    <section className="card meal">
      <div className="card-head">
        <h3>
          <i className="meal-dot" style={{ background: MEAL_COLORS[meal] }} />
          {meal}
        </h3>
        <span className="muted small">{kcal ? `${Math.round(kcal)} kcal` : ""}</span>
      </div>

      {items.length > 0 && (
        <div className="stack-sm">
          {items.map((i) => (
            <button key={i.id} className="food" onClick={() => openFood(dateKey, i)}>
              <span className="grow">
                <strong>{i.name}</strong>
                <small>
                  {i.protein ? `${round(i.protein)}g protein` : ""}
                  {i.protein && (i.carbs || i.fat) ? " · " : ""}
                  {i.carbs ? `${round(i.carbs)}g carbs` : ""}
                  {i.carbs && i.fat ? " · " : ""}
                  {i.fat ? `${round(i.fat)}g fat` : ""}
                </small>
              </span>
              <span className="muted">{i.kcal ? `${round(i.kcal)} kcal` : ""}</span>
            </button>
          ))}
        </div>
      )}

      {planned && (
        <div className="planned">
          <span className="grow">
            <small className="eyebrow">Planned</small>
            <span>{planned}</span>
          </span>
          <button className="btn btn-ghost btn-sm" onClick={() => addFood(dateKey, { meal, name: planned })} title="Add the planned meal as eaten">
            Log it
          </button>
        </div>
      )}

      <button className="btn btn-ghost btn-sm add-food" onClick={() => openFood(dateKey, null, { meal })}>
        <Plus size={15} /> Add food
      </button>
    </section>
  );
}

function WeekChart({ diet, today, target }) {
  const days = lastDaysKcal(diet, today, 7);
  const max = Math.max(target * 1.15, ...days.map((d) => d.kcal), 1);
  return (
    <section className="card">
      <div className="card-head">
        <h3>Last 7 days</h3>
        <span className="muted small">Calories · dashed line is your target</span>
      </div>
      <div className="bars diet-bars" role="img" aria-label="Calories logged over the last 7 days">
        {days.map((d) => (
          <div key={d.key} className={`bcol ${d.key === today ? "today" : ""}`}>
            <span className="bval">{d.logged ? Math.round(d.kcal) : "–"}</span>
            <div className="btrack">
              <i className="t-mark" style={{ bottom: `${(target / max) * 100}%` }} />
              <div className="bfill" style={{ height: `${d.logged ? Math.max(4, (d.kcal / max) * 100) : 0}%` }} />
            </div>
            <span className="blabel">{fmtDate(d.key, { weekday: "short" })}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function LogTab({ dateKey }) {
  const { state, addFood, addWater } = useStore();
  const { openFood } = useUI();
  const diet = state.diet;
  const log = dayLog(diet, dateKey);
  const t = totals(log);
  const goals = diet.goals;
  const recent = useMemo(() => recentFoods(diet, 8), [diet]);
  const left = Math.round(goals.calories - t.kcal);
  const glasses = Math.max(goals.water, log.water);

  return (
    <>
      <div className="grid diet-top">
        <section className="card kcal-card">
          <div className="card-head">
            <h3>Calories</h3>
          </div>
          <div className="today-body">
            <Ring pct={goals.calories ? t.kcal / goals.calories : 0} size={124} stroke={13} from="#ff9f0a" to="#ff375f">
              <div className="ring-big">
                <strong>{Math.round(t.kcal)}</strong>
                <span>of {goals.calories} kcal</span>
              </div>
            </Ring>
            <div className="today-side">
              <span className="eyebrow">{left >= 0 ? "Remaining" : "Above target"}</span>
              <strong>{Math.abs(left)} kcal</strong>
              <span className="muted small">{log.items.length} item{log.items.length === 1 ? "" : "s"} logged</span>
            </div>
          </div>
        </section>

        <section className="card macros-card">
          <div className="card-head">
            <h3>Macros</h3>
          </div>
          <div className="stack">
            <div>
              <div className="row between small">
                <span>Protein</span>
                <span className="muted">
                  {round(t.protein)} / {goals.protein} g
                </span>
              </div>
              <Bar pct={goals.protein ? t.protein / goals.protein : 0} color="#5e5ce6" height={9} />
            </div>
            <div className="row between small">
              <span>Carbs</span>
              <span className="muted">{round(t.carbs)} g</span>
            </div>
            <div className="row between small">
              <span>Fat</span>
              <span className="muted">{round(t.fat)} g</span>
            </div>
          </div>
        </section>

        <section className="card water-card">
          <div className="card-head">
            <h3>
              <Droplets size={17} /> Water
            </h3>
            <div className="stepper">
              <button onClick={() => addWater(dateKey, -1)} aria-label="Remove a glass">
                <Minus size={14} />
              </button>
              <button onClick={() => addWater(dateKey, 1)} aria-label="Add a glass">
                <Plus size={14} />
              </button>
            </div>
          </div>
          <div className="glasses" role="group" aria-label={`${log.water} of ${goals.water} glasses`}>
            {Array.from({ length: glasses }, (_, i) => (
              <button key={i} className={i < log.water ? "on" : ""} onClick={() => addWater(dateKey, i < log.water ? -(log.water - i) : i + 1 - log.water)} aria-label={`Set to ${i + 1} glasses`} />
            ))}
          </div>
          <span className="muted small">
            {log.water} of {goals.water} glasses
          </span>
        </section>
      </div>

      <div className="grid g2 meals">
        {MEALS.map((m) => (
          <MealCard key={m} meal={m} log={log} dateKey={dateKey} planned={plannedFor(diet, dateKey, m)} />
        ))}
      </div>

      {recent.length > 0 && (
        <section className="card">
          <div className="card-head">
            <h3>Quick add</h3>
            <span className="muted small">Your recent foods, one tap to log again today</span>
          </div>
          <div className="chips">
            {recent.map((r) => (
              <button key={`${r.name}-${r.meal}`} className="chip chip-btn" onClick={() => addFood(dateKey, r)}>
                <Plus size={12} /> {r.name}
                {r.kcal ? <span className="muted"> · {Math.round(r.kcal)}</span> : null}
              </button>
            ))}
          </div>
        </section>
      )}

      <WeekChart diet={diet} today={todayKey()} target={goals.calories} />

      {log.items.length === 0 && (
        <p className="muted small center">
          Nothing logged for {fmtDate(dateKey, { weekday: "long" })} yet.{" "}
          <button className="link-btn" onClick={() => openFood(dateKey)}>
            Add your first food
          </button>
        </p>
      )}
    </>
  );
}

function PlanTab() {
  const { state, setDietGoals, setMealPlan } = useStore();
  const { goals, plan } = state.diet;
  const setGoal = (k, min, max) => (e) => {
    const v = Number(e.target.value);
    if (Number.isFinite(v)) setDietGoals({ [k]: Math.min(max, Math.max(min, Math.round(v))) });
  };
  const today = new Date().getDay();

  return (
    <>
      <section className="card">
        <div className="card-head">
          <h3>Daily targets</h3>
          <span className="muted small">Set what suits you</span>
        </div>
        <div className="form-row three">
          <label className="field">
            <span className="field-label">Calories (kcal)</span>
            <input className="input" type="number" min="500" max="6000" value={goals.calories} onChange={setGoal("calories", 500, 6000)} />
          </label>
          <label className="field">
            <span className="field-label">Protein (g)</span>
            <input className="input" type="number" min="0" max="400" value={goals.protein} onChange={setGoal("protein", 0, 400)} />
          </label>
          <label className="field">
            <span className="field-label">Water (glasses)</span>
            <input className="input" type="number" min="1" max="20" value={goals.water} onChange={setGoal("water", 1, 20)} />
          </label>
        </div>
      </section>

      <div className="section-head">
        <h2>Weekly meal plan</h2>
        <span className="muted small">Saved as you type. Planned meals show up on that day's log.</span>
      </div>
      <div className="grid g3 plan-grid">
        {DAY_ORDER.map((d) => (
          <section key={d} className={`card plan-day ${d === today ? "today" : ""}`}>
            <h4 className="day-label">{DAY_LONG[d]}</h4>
            {MEALS.map((m) => (
              <label key={m} className="field">
                <span className="field-label">
                  <i className="meal-dot" style={{ background: MEAL_COLORS[m] }} />
                  {m}
                </span>
                <textarea className="input" rows={2} value={(plan[String(d)] || {})[m] || ""} onChange={(e) => setMealPlan(String(d), m, e.target.value)} placeholder="e.g. Poha + curd" />
              </label>
            ))}
          </section>
        ))}
      </div>
    </>
  );
}

export default function Diet() {
  const { state } = useStore();
  const { openFood } = useUI();
  const today = todayKey();
  const [tab, setTab] = useState("log");
  const [dateKey, setDateKey] = useState(today);

  return (
    <Page>
      <PageHeader
        title="Diet"
        subtitle="Log meals, watch your targets, plan the week"
        actions={
          <>
            <div className="seg seg-sm" role="tablist" aria-label="Diet sections">
              {[
                ["log", "Log"],
                ["plan", "Plan"],
              ].map(([id, label]) => (
                <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? "on" : ""} onClick={() => setTab(id)}>
                  {label}
                </button>
              ))}
            </div>
            {tab === "log" && (
              <button className="btn btn-primary" onClick={() => openFood(dateKey)}>
                <Plus size={16} /> Add food
              </button>
            )}
          </>
        }
      />

      {tab === "log" ? (
        <>
          <div className="date-nav">
            <button className="icon-btn" onClick={() => setDateKey((k) => addDays(k, -1))} aria-label="Previous day">
              <ChevronLeft size={18} />
            </button>
            <strong>{dateKey === today ? "Today" : fmtDate(dateKey, { weekday: "long", month: "short", day: "numeric" })}</strong>
            <button className="icon-btn" onClick={() => setDateKey((k) => addDays(k, 1))} disabled={dateKey >= today} aria-label="Next day">
              <ChevronRight size={18} />
            </button>
            {dateKey !== today && (
              <button className="btn btn-ghost btn-sm" onClick={() => setDateKey(today)}>
                Back to today
              </button>
            )}
          </div>
          <LogTab dateKey={dateKey} />
        </>
      ) : (
        <PlanTab />
      )}

      {Object.keys(state.diet.logs).length === 0 && tab === "log" && (
        <div className="card">
          <Empty icon={<Salad size={24} />} title="Start with one meal" text="Log what you ate, even roughly. Set your own targets in the Plan tab." />
        </div>
      )}

      <p className="muted small center diet-note">A tracking tool only. For medical or weight goals, talk to a doctor or dietitian.</p>
    </Page>
  );
}
