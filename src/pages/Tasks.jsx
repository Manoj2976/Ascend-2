<<<<<<< HEAD
import Select from "../components/Select";
=======
>>>>>>> 6e9173cad89b7b53fed34d11013f586fd91d429b
import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ListChecks, Plus, Search } from "lucide-react";
import { Empty, Page } from "../components/PageHeader";
import PageHeader from "../components/PageHeader";
import TaskItem from "../components/TaskItem";
import { useStore } from "../lib/store";
import { useUI } from "../lib/ui";
import { isDone, occursOn } from "../lib/tasks";
import { addDays, fmtDate, todayKey } from "../lib/dates";
import { CATEGORIES } from "../lib/constants";

const FILTERS = ["Upcoming", "Today", "Overdue", "Completed", "All"];

export default function Tasks() {
  const { state } = useStore();
  const { openTask } = useUI();
  const [filter, setFilter] = useState("Upcoming");
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const today = todayKey();

  // Expand tasks into dated occurrences for the next 14 days (and the past 14 for overdue / completed)
  const rows = useMemo(() => {
    const out = [];
    const needle = q.trim().toLowerCase();
    const push = (t, key) => {
      if (cat !== "All" && t.category !== cat) return;
      if (needle && !t.title.toLowerCase().includes(needle)) return;
      out.push({ t, key, done: isDone(t, key) });
    };
    for (const t of state.tasks) {
      for (let i = -14; i <= 14; i++) {
        const key = addDays(today, i);
        if (occursOn(t, key)) push(t, key);
      }
    }
    const byDate = (a, b) => a.key.localeCompare(b.key) || (a.t.time || "99").localeCompare(b.t.time || "99");
    switch (filter) {
      case "Today":
        return out.filter((r) => r.key === today).sort(byDate);
      case "Upcoming":
        return out.filter((r) => r.key >= today && !r.done).sort(byDate);
      case "Overdue":
        return out.filter((r) => r.key < today && !r.done).sort(byDate);
      case "Completed":
        return out.filter((r) => r.done).sort((a, b) => b.key.localeCompare(a.key));
      default:
        return out.sort(byDate);
    }
  }, [state.tasks, filter, cat, q, today]);

  const groups = useMemo(() => {
    const m = new Map();
    for (const r of rows) {
      if (!m.has(r.key)) m.set(r.key, []);
      m.get(r.key).push(r);
    }
    return [...m.entries()];
  }, [rows]);

  const label = (key) => (key === today ? "Today" : key === addDays(today, 1) ? "Tomorrow" : key === addDays(today, -1) ? "Yesterday" : fmtDate(key, { weekday: "long", month: "short", day: "numeric" }));

  return (
    <Page>
      <PageHeader
        title="Tasks"
        subtitle="Everything planned within ±2 weeks"
        actions={
          <button className="btn btn-primary" onClick={() => openTask()}>
            <Plus size={16} /> New task
          </button>
        }
      />
      <div className="toolbar">
        <div className="seg">
          {FILTERS.map((f) => (
            <button key={f} className={filter === f ? "on" : ""} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
        <div className="row gap grow end">
<<<<<<< HEAD
          <Select className="input input-sm" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Filter by category">
=======
          <select className="input input-sm" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Filter by category">
>>>>>>> 6e9173cad89b7b53fed34d11013f586fd91d429b
            <option>All</option>
            {CATEGORIES.map((c) => (
              <option key={c.id}>{c.id}</option>
            ))}
<<<<<<< HEAD
          </Select>
=======
          </select>
>>>>>>> 6e9173cad89b7b53fed34d11013f586fd91d429b
          <div className="search">
            <Search size={15} />
            <input placeholder="Search tasks" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="card">
          <Empty icon={<ListChecks size={24} />} title="Nothing here" text="No tasks match this view." />
        </div>
      ) : (
        groups.map(([key, items]) => (
          <section key={key} className="card day-group">
            <h4 className="day-label">
              {label(key)} <span className="muted small">{items.filter((r) => r.done).length}/{items.length}</span>
            </h4>
            <div className="list">
              <AnimatePresence initial={false}>
                {items.map(({ t }) => (
                  <TaskItem key={`${t.id}:${key}`} task={t} dateKey={key} />
                ))}
              </AnimatePresence>
            </div>
          </section>
        ))
      )}
    </Page>
  );
}
