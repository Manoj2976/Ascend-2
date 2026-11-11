import { Clock, Flame, Target as TargetIcon, Trophy } from "lucide-react";
import PageHeader, { Page } from "../components/PageHeader";
import Heatmap from "../components/Heatmap";
import { Bar } from "../components/Ring";
import { useStore } from "../lib/store";
import { bestStreak, categoryDone, completionRate, currentStreak, totalDone, weekBars } from "../lib/stats";
import { addDays, fmtDate, todayKey } from "../lib/dates";
import { catColor } from "../lib/constants";

export default function Insights() {
  const { state } = useStore();
  const { tasks, focus, settings } = state;
  const today = todayKey();
  const thr = settings.streakThreshold;

  const streak = currentStreak(tasks, today, thr);
  const best = bestStreak(tasks, today, thr);
  const rate = completionRate(tasks, today, 30);
  const week = weekBars(tasks, today, 7);
  const cats = categoryDone(tasks, today, 30);
  const maxCat = Math.max(1, ...cats.map((c) => c.count));
  const focusWeek = Array.from({ length: 7 }, (_, i) => focus[addDays(today, -i)] || 0).reduce((a, b) => a + b, 0);

  const withTasks = week.filter((d) => d.total > 0);
  const bestDay = withTasks.length ? withTasks.reduce((a, b) => (b.pct > a.pct || (b.pct === a.pct && b.done > a.done) ? b : a)) : null;
  const worstDay = withTasks.length ? withTasks.reduce((a, b) => (b.pct < a.pct ? b : a)) : null;
  const weekDone = week.reduce((a, d) => a + d.done, 0);
  const weekTotal = week.reduce((a, d) => a + d.total, 0);
  const missed = weekTotal - weekDone;

  const tiles = [
    { icon: Flame, label: "Current streak", value: `${streak}d`, tint: "#ff9f0a" },
    { icon: Trophy, label: "Best streak", value: `${best}d`, tint: "#bf5af2" },
    { icon: TargetIcon, label: "30-day completion", value: `${Math.round(rate * 100)}%`, tint: "#30c85e" },
    { icon: Clock, label: "Focus this week", value: `${(focusWeek / 60).toFixed(1)}h`, tint: "#32ade6" },
  ];

  return (
    <Page>
      <PageHeader title="Insights" subtitle={`${totalDone(tasks)} tasks completed all-time · a day counts at ≥ ${thr}% done`} />

      <div className="grid g4 tiles">
        {tiles.map(({ icon: Icon, label, value, tint }) => (
          <div key={label} className="card tile">
            <span className="tile-icon" style={{ background: `${tint}22`, color: tint }}>
              <Icon size={18} />
            </span>
            <strong>{value}</strong>
            <span className="muted small">{label}</span>
          </div>
        ))}
      </div>

      <section className="card">
        <div className="card-head">
          <h3>Consistency</h3>
          <span className="muted small">Last 26 weeks</span>
        </div>
        <Heatmap tasks={tasks} />
      </section>

      <div className="grid g2">
        <section className="card">
          <div className="card-head">
            <h3>Last 7 days</h3>
            <span className="muted small">
              {weekDone}/{weekTotal} tasks
            </span>
          </div>
          <div className="bars">
            {week.map((d) => (
              <div key={d.key} className={`bcol ${d.key === today ? "today" : ""}`}>
                <span className="bval">{d.total ? `${Math.round(d.pct * 100)}%` : "–"}</span>
                <div className="btrack">
                  <div className="bfill" style={{ height: `${Math.max(d.total ? 4 : 0, d.pct * 100)}%` }} />
                </div>
                <span className="blabel">{d.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <h3>Where your time goes</h3>
            <span className="muted small">Completed, last 30 days</span>
          </div>
          {cats.length === 0 ? (
            <p className="muted">Complete some tasks to see your split.</p>
          ) : (
            <div className="stack">
              {cats.map((c) => (
                <div key={c.id}>
                  <div className="row between small">
                    <span>{c.id}</span>
                    <span className="muted">{c.count}</span>
                  </div>
                  <Bar pct={c.count / maxCat} color={catColor(c.id)} height={8} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="card review">
        <div className="card-head">
          <h3>Weekly review</h3>
          <span className="muted small">
            {fmtDate(week[0].key, { month: "short", day: "numeric" })} – {fmtDate(today, { month: "short", day: "numeric" })}
          </span>
        </div>
        {weekTotal === 0 ? (
          <p className="muted">No tasks were scheduled this week.</p>
        ) : (
          <ul className="review-list">
            <li>
              You completed <strong>{weekDone}</strong> of <strong>{weekTotal}</strong> tasks ({Math.round((weekDone / weekTotal) * 100)}%).
            </li>
            {bestDay && (
              <li>
                Best day: <strong>{fmtDate(bestDay.key, { weekday: "long" })}</strong> ({bestDay.done}/{bestDay.total}).
              </li>
            )}
            {worstDay && worstDay.pct < 1 && (
              <li>
                Toughest day: <strong>{fmtDate(worstDay.key, { weekday: "long" })}</strong> ({worstDay.done}/{worstDay.total}). Plan a lighter load there next week.
              </li>
            )}
            {missed > 0 && (
              <li>
                <strong>{missed}</strong> task{missed > 1 ? "s were" : " was"} left undone. Reschedule or drop them so they stop weighing on you.
              </li>
            )}
            {cats[0] && (
              <li>
                Most time went into <strong>{cats[0].id}</strong>
                {cats.length > 1 ? `, least into ${cats[cats.length - 1].id}` : ""}.
              </li>
            )}
          </ul>
        )}
      </section>
    </Page>
  );
}
