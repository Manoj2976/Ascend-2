<<<<<<< HEAD
import Select from "./Select";
=======
>>>>>>> 6e9173cad89b7b53fed34d11013f586fd91d429b
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import Sheet, { Field } from "./Sheet";
import { useStore } from "../lib/store";
import { useUI } from "../lib/ui";
import { APP_STATUSES } from "../lib/constants";
import { todayKey } from "../lib/dates";

const blank = () => ({ company: "", role: "", status: "Wishlist", date: todayKey(), link: "", notes: "" });

export default function AppModal() {
  const { addApp, updateApp, deleteApp } = useStore();
  const { appModal, closeApp } = useUI();
  const { open, app, defaults } = appModal;
  const [f, setF] = useState(blank);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    if (!open) return;
    setF(app ? { ...blank(), ...app } : { ...blank(), ...(defaults || {}) });
  }, [open, app, defaults]);

  const valid = f.company.trim().length > 0;

  const save = () => {
    if (!valid) return;
    const data = { company: f.company.trim(), role: f.role.trim(), status: f.status, date: f.date, link: f.link.trim(), notes: f.notes };
    if (app) updateApp(app.id, data);
    else addApp(data);
    closeApp();
  };

  const remove = () => {
    if (window.confirm("Delete this application?")) {
      deleteApp(app.id);
      closeApp();
    }
  };

  return (
    <Sheet
      open={open}
      onClose={closeApp}
      title={app ? "Edit application" : "New application"}
      footer={
        <>
          {app && (
            <button className="btn btn-danger" onClick={remove}>
              <Trash2 size={16} /> Delete
            </button>
          )}
          <span className="grow" />
          <button className="btn btn-ghost" onClick={closeApp}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={save} disabled={!valid}>
            {app ? "Save" : "Add"}
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
        <div className="form-row">
          <Field label="Company">
            <input className="input" autoFocus value={f.company} onChange={set("company")} placeholder="e.g. Acme Systems" />
          </Field>
          <Field label="Role">
            <input className="input" value={f.role} onChange={set("role")} placeholder="e.g. SDE Intern" />
          </Field>
        </div>
        <div className="form-row">
          <Field label="Status">
<<<<<<< HEAD
            <Select className="input" value={f.status} onChange={set("status")}>
              {APP_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
=======
            <select className="input" value={f.status} onChange={set("status")}>
              {APP_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
>>>>>>> 6e9173cad89b7b53fed34d11013f586fd91d429b
          </Field>
          <Field label="Date">
            <input className="input" type="date" value={f.date} onChange={set("date")} />
          </Field>
        </div>
        <Field label="Link">
          <input className="input" type="url" value={f.link} onChange={set("link")} placeholder="https://…" />
        </Field>
        <Field label="Notes">
          <textarea className="input" rows={3} value={f.notes} onChange={set("notes")} placeholder="Referral, test date, rounds…" />
        </Field>
        <button type="submit" hidden />
      </form>
    </Sheet>
  );
}
