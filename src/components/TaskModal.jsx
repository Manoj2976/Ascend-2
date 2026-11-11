import Select from "./Select";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import Sheet, { Field } from "./Sheet";
import { useStore } from "../lib/store";
import { useUI } from "../lib/ui";
import { CATEGORIES, REPEATS } from "../lib/constants";
import { monthLabel, todayKey } from "../lib/dates";

const blank = () => ({ title: "", date: todayKey(), time: "", category: "DSA", repeat: "none", goalId: "", notes: "" });

export default function TaskModal() {
  const { state, addTask, updateTask, deleteTask } = useStore();
  const { taskModal, closeTask } = useUI();
  const { open, task, defaults } = taskModal;
  const [f, setF] = useState(blank);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    if (!open) return;
    setF(task ? { ...blank(), ...task } : { ...blank(), ...(defaults || {}) });
  }, [open, task, defaults]);

  const monthly = state.goals.filter((g) => g.type === "MONTHLY");
  const valid = f.title.trim().length > 0;

  const save = () => {
    if (!valid) return;
    const data = { title: f.title.trim(), date: f.date, time: f.time, category: f.category, repeat: f.repeat, goalId: f.goalId, notes: f.notes };
    if (task) updateTask(task.id, data);
    else addTask(data);
    closeTask();
  };

  const remove = () => {
    const msg = task.repeat !== "none" ? "Delete this repeating task and all of its history?" : "Delete this task?";
    if (window.confirm(msg)) {
      deleteTask(task.id);
      closeTask();
    }
  };

  return (
    <Sheet
      open={open}
      onClose={closeTask}
      title={task ? "Edit task" : "New task"}
      footer={
        <>
          {task && (
            <button className="btn btn-danger" onClick={remove}>
              <Trash2 size={16} /> Delete
            </button>
          )}
          <span className="grow" />
          <button className="btn btn-ghost" onClick={closeTask}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={save} disabled={!valid}>
            {task ? "Save" : "Add task"}
          </button>
        </>
      }
    >
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <Field label="Title">
          <input className="input" autoFocus placeholder="e.g. Solve 2 LeetCode mediums" value={f.title} onChange={set("title")} />
        </Field>
        <div className="form-row">
          <Field label="Date">
            <input className="input" type="date" value={f.date} onChange={set("date")} required />
          </Field>
          <Field label="Time" hint={f.time ? "You'll be reminded at this time" : "Optional – set one to get reminders"}>
            <input className="input" type="time" value={f.time} onChange={set("time")} />
          </Field>
        </div>
        <div className="form-row">
          <Field label="Category">
            <Select className="input" value={f.category} onChange={set("category")}>
              {CATEGORIES.map((c) => (
                <option key={c.id}>{c.id}</option>
              ))}
            </Select>
          </Field>
          <Field label="Repeat">
            <Select className="input" value={f.repeat} onChange={set("repeat")}>
              {REPEATS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Count towards a monthly target" hint="Ticking this task moves that target's progress by 1">
          <Select className="input" value={f.goalId} onChange={set("goalId")}>
            <option value="">None</option>
            {monthly.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title} · {monthLabel(g.month, { month: "short", year: "numeric" })}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Notes">
          <textarea className="input" rows={3} placeholder="Optional details…" value={f.notes} onChange={set("notes")} />
        </Field>
        <button type="submit" hidden />
      </form>
    </Sheet>
  );
}
