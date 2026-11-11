import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import Sheet, { Field } from "./Sheet";
import { useStore } from "../lib/store";
import { useUI } from "../lib/ui";
import { monthKey } from "../lib/dates";

const TITLES = { FINAL: "Final target", MONTHLY: "Monthly target", DAILY: "Daily target" };

const blank = (type) => ({
  type,
  title: "",
  unit: "",
  target: type === "FINAL" ? 100 : type === "DAILY" ? 3 : 10,
  progress: 0,
  month: monthKey(),
  deadline: "",
  parentId: "",
});

export default function GoalModal() {
  const { state, addGoal, updateGoal, deleteGoal } = useStore();
  const { goalModal, closeGoal } = useUI();
  const { open, goal, type, defaults } = goalModal;
  const [f, setF] = useState(blank("MONTHLY"));
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const kind = goal ? goal.type : type;

  useEffect(() => {
    if (!open) return;
    setF(goal ? { ...blank(goal.type), ...goal } : { ...blank(type), ...(defaults || {}) });
  }, [open, goal, type, defaults]);

  const finals = state.goals.filter((g) => g.type === "FINAL");
  const valid = f.title.trim().length > 0 && Number(f.target) > 0 && (kind !== "MONTHLY" || f.month);

  const save = () => {
    if (!valid) return;
    const data = { type: kind, title: f.title.trim(), unit: f.unit.trim(), target: Number(f.target) };
    if (kind === "MONTHLY") Object.assign(data, { month: f.month, parentId: f.parentId, progress: Number(f.progress) || 0 });
    if (kind === "FINAL") Object.assign(data, { deadline: f.deadline, progress: Number(f.progress) || 0 });
    if (goal) updateGoal(goal.id, data);
    else addGoal(data);
    closeGoal();
  };

  const remove = () => {
    if (window.confirm(`Delete this ${TITLES[kind].toLowerCase()}? Linked tasks are kept.`)) {
      deleteGoal(goal.id);
      closeGoal();
    }
  };

  return (
    <Sheet
      open={open}
      onClose={closeGoal}
      title={`${goal ? "Edit" : "New"} ${TITLES[kind].toLowerCase()}`}
      footer={
        <>
          {goal && (
            <button className="btn btn-danger" onClick={remove}>
              <Trash2 size={16} /> Delete
            </button>
          )}
          <span className="grow" />
          <button className="btn btn-ghost" onClick={closeGoal}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={save} disabled={!valid}>
            {goal ? "Save" : "Create"}
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
          <input
            className="input"
            autoFocus
            value={f.title}
            onChange={set("title")}
            placeholder={kind === "FINAL" ? "e.g. Get placed at a product company" : kind === "MONTHLY" ? "e.g. Solve 60 DSA problems" : "e.g. DSA problems"}
          />
        </Field>

        {kind === "FINAL" && (
          <div className="form-row">
            <Field label="Deadline">
              <input className="input" type="date" value={f.deadline} onChange={set("deadline")} />
            </Field>
            <Field label="Manual progress (%)" hint="Used only when no monthly target is linked">
              <input className="input" type="number" min="0" max="100" value={f.progress} onChange={(e) => setF((p) => ({ ...p, progress: e.target.value, target: 100 }))} />
            </Field>
          </div>
        )}

        {kind === "MONTHLY" && (
          <>
            <div className="form-row">
              <Field label="Month">
                <input className="input" type="month" value={f.month} onChange={set("month")} />
              </Field>
              <Field label="Part of final target">
                <select className="input" value={f.parentId} onChange={set("parentId")}>
                  <option value="">None</option>
                  {finals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="form-row three">
              <Field label="Goal">
                <input className="input" type="number" min="1" value={f.target} onChange={set("target")} />
              </Field>
              <Field label="Done so far">
                <input className="input" type="number" min="0" value={f.progress} onChange={set("progress")} />
              </Field>
              <Field label="Unit">
                <input className="input" placeholder="problems" value={f.unit} onChange={set("unit")} />
              </Field>
            </div>
          </>
        )}

        {kind === "DAILY" && (
          <div className="form-row">
            <Field label="Target per day">
              <input className="input" type="number" min="1" value={f.target} onChange={set("target")} />
            </Field>
            <Field label="Unit">
              <input className="input" placeholder="problems" value={f.unit} onChange={set("unit")} />
            </Field>
          </div>
        )}
        <button type="submit" hidden />
      </form>
    </Sheet>
  );
}
