import Select from "./Select";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import Sheet, { Field } from "./Sheet";
import { useStore } from "../lib/store";
import { useUI } from "../lib/ui";
import { DAY_LONG, DAY_ORDER, DAY_SHORT, KINDS, overlaps, toMin } from "../lib/timetable";

const blank = () => ({ title: "", kind: "Class", days: [new Date().getDay()], start: "09:00", end: "10:00", place: "", notes: "" });

export default function TimetableModal() {
  const { state, addTimetable, updateTimetable, deleteTimetable } = useStore();
  const { ttModal, closeTT } = useUI();
  const { open, entry, defaults } = ttModal;
  const [f, setF] = useState(blank);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    if (!open) return;
    if (entry) setF({ ...blank(), ...entry, days: [entry.day] });
    else setF({ ...blank(), ...(defaults || {}), days: defaults?.day != null ? [defaults.day] : blank().days });
  }, [open, entry, defaults]);

  const toggleDay = (d) =>
    setF((p) => {
      if (entry) return { ...p, days: [d] }; // editing moves one entry; it can't fan out
      const has = p.days.includes(d);
      return { ...p, days: has ? (p.days.length > 1 ? p.days.filter((x) => x !== d) : p.days) : [...p.days, d] };
    });

  const timeOk = f.start && f.end && toMin(f.end) > toMin(f.start);
  const valid = f.title.trim().length > 0 && timeOk;

  const clashes = useMemo(() => {
    if (!timeOk) return [];
    return f.days.flatMap((day) => overlaps(state.timetable, { day, start: f.start, end: f.end }, entry?.id).map((e) => ({ ...e, day })));
  }, [state.timetable, f.days, f.start, f.end, timeOk, entry]);

  const save = () => {
    if (!valid) return;
    const data = { title: f.title.trim(), kind: f.kind, start: f.start, end: f.end, place: f.place.trim(), notes: f.notes.trim() };
    if (entry) updateTimetable(entry.id, { ...data, day: f.days[0] });
    else addTimetable(data, f.days);
    closeTT();
  };

  const remove = () => {
    if (window.confirm("Delete this entry?")) {
      deleteTimetable(entry.id);
      closeTT();
    }
  };

  return (
    <Sheet
      open={open}
      onClose={closeTT}
      title={entry ? "Edit entry" : "New entry"}
      footer={
        <>
          {entry && (
            <button className="btn btn-danger" onClick={remove}>
              <Trash2 size={16} /> Delete
            </button>
          )}
          <span className="grow" />
          <button className="btn btn-ghost" onClick={closeTT}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={save} disabled={!valid}>
            {entry ? "Save" : f.days.length > 1 ? `Add to ${f.days.length} days` : "Add"}
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
          <input className="input" autoFocus placeholder="e.g. Operating Systems" value={f.title} onChange={set("title")} />
        </Field>

        <div className="field">
          <span className="field-label">{entry ? "Day" : "Days"}</span>
          <div className="day-chips" role="group" aria-label="Days">
            {DAY_ORDER.map((d) => (
              <button type="button" key={d} className={f.days.includes(d) ? "on" : ""} aria-pressed={f.days.includes(d)} aria-label={DAY_LONG[d]} onClick={() => toggleDay(d)}>
                {DAY_SHORT[d]}
              </button>
            ))}
          </div>
          {!entry && <span className="field-hint">Pick several days to add the same slot to each of them.</span>}
        </div>

        <div className="form-row">
          <Field label="Starts">
            <input className="input" type="time" value={f.start} onChange={set("start")} required />
          </Field>
          <Field label="Ends">
            <input className={`input ${f.start && f.end && !timeOk ? "bad" : ""}`} type="time" value={f.end} onChange={set("end")} required />
          </Field>
        </div>
        {f.start && f.end && !timeOk && <span className="field-err">End time must be after the start time.</span>}

        <div className="form-row">
          <Field label="Type">
            <Select className="input" value={f.kind} onChange={set("kind")}>
              {KINDS.map((k) => (
                <option key={k.id}>{k.id}</option>
              ))}
            </Select>
          </Field>
          <Field label="Room / place">
            <input className="input" placeholder="e.g. Block B, 204" value={f.place} onChange={set("place")} />
          </Field>
        </div>
        <Field label="Notes">
          <textarea className="input" rows={2} placeholder="Faculty, syllabus, things to bring…" value={f.notes} onChange={set("notes")} />
        </Field>

        {clashes.length > 0 && (
          <div className="warn" role="status">
            <AlertTriangle size={16} />
            <span>
              Overlaps with{" "}
              {clashes
                .slice(0, 3)
                .map((c) => `${c.title} (${DAY_SHORT[c.day]} ${c.start}–${c.end})`)
                .join(", ")}
              {clashes.length > 3 ? ` and ${clashes.length - 3} more` : ""}. You can still save it.
            </span>
          </div>
        )}
        <button type="submit" hidden />
      </form>
    </Sheet>
  );
}
