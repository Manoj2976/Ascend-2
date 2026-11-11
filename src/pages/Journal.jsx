import { useMemo, useState } from "react";
import { Check, Trash2 } from "lucide-react";
import PageHeader, { Empty, Page } from "../components/PageHeader";
import { useStore } from "../lib/store";
import { MOODS } from "../lib/constants";
import { addDays, fmtDate, todayKey } from "../lib/dates";
import { isDone, tasksOn } from "../lib/tasks";

export default function Journal() {
  const { state, saveJournal, deleteJournal } = useStore();
  const today = todayKey();
  const [sel, setSel] = useState(today);

  const entry = state.journal[sel] || {};
  const dates = useMemo(() => {
    const set = new Set(Object.keys(state.journal));
    set.add(today);
    return [...set].sort().reverse();
  }, [state.journal, today]);

  const doneToday = tasksOn(state.tasks, sel).filter((t) => isDone(t, sel));
  const patch = (k) => (e) => saveJournal(sel, { [k]: e.target.value });
  const words = (entry.text || "").trim().split(/\s+/).filter(Boolean).length;
  const hasContent = Boolean(entry.text || entry.learned || entry.plan || entry.mood != null);

  return (
    <Page>
      <PageHeader title="Journal" subtitle="Record every part of the journey" />
      <div className="grid journal-grid">
        <aside className="card j-list">
          <div className="stack-sm">
            {dates.map((d) => {
              const e = state.journal[d];
              return (
                <button key={d} className={`j-item ${d === sel ? "on" : ""}`} onClick={() => setSel(d)}>
                  <span className="j-mood">{e?.mood != null ? MOODS[e.mood] : "📝"}</span>
                  <span>
                    <strong>{d === today ? "Today" : d === addDays(today, -1) ? "Yesterday" : fmtDate(d)}</strong>
                    <small>{e?.text ? e.text.slice(0, 44) + (e.text.length > 44 ? "…" : "") : "No entry yet"}</small>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="card j-edit">
          <div className="card-head">
            <div>
              <h3>{fmtDate(sel, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</h3>
              <span className="muted small">Saved automatically · {words} words</span>
            </div>
            {hasContent && sel !== today && (
              <button className="icon-btn" onClick={() => window.confirm("Delete this entry?") && deleteJournal(sel)} aria-label="Delete entry">
                <Trash2 size={17} />
              </button>
            )}
          </div>

          <div className="mood-row" role="radiogroup" aria-label="Mood">
            <span className="field-label">How was the day?</span>
            <div className="moods">
              {MOODS.map((m, i) => (
                <button key={m} role="radio" aria-checked={entry.mood === i} className={entry.mood === i ? "on" : ""} onClick={() => saveJournal(sel, { mood: entry.mood === i ? null : i })}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {doneToday.length > 0 && (
            <div className="done-recap">
              <span className="field-label">Completed that day</span>
              <div className="chips">
                {doneToday.map((t) => (
                  <span key={t.id} className="chip">
                    <Check size={12} /> {t.title}
                  </span>
                ))}
              </div>
            </div>
          )}

          <label className="field">
            <span className="field-label">What I did</span>
            <textarea className="input" rows={5} value={entry.text || ""} onChange={patch("text")} placeholder="Wins, struggles, how focus felt…" />
          </label>
          <label className="field">
            <span className="field-label">What I learned</span>
            <textarea className="input" rows={3} value={entry.learned || ""} onChange={patch("learned")} placeholder="Concepts, patterns, mistakes to avoid…" />
          </label>
          <label className="field">
            <span className="field-label">Plan for tomorrow</span>
            <textarea className="input" rows={3} value={entry.plan || ""} onChange={patch("plan")} placeholder="Top 3 priorities…" />
          </label>
          {!hasContent && <Empty title="Start writing" text="Even two lines a day builds a record you'll be proud of." />}
        </section>
      </div>
    </Page>
  );
}
