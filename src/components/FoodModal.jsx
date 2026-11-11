import Select from "./Select";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import Sheet, { Field } from "./Sheet";
import { useStore } from "../lib/store";
import { useUI } from "../lib/ui";
import { MEALS } from "../lib/diet";

const blank = () => ({ meal: "Breakfast", name: "", kcal: "", protein: "", carbs: "", fat: "" });
const n = (v) => (v === "" || v == null ? 0 : Math.max(0, Number(v) || 0));

export default function FoodModal() {
  const { addFood, updateFood, deleteFood } = useStore();
  const { foodModal, closeFood } = useUI();
  const { open, item, dateKey, defaults } = foodModal;
  const [f, setF] = useState(blank);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    if (!open) return;
    const src = item || defaults || {};
    setF({
      ...blank(),
      ...src,
      kcal: src.kcal ? String(src.kcal) : "",
      protein: src.protein ? String(src.protein) : "",
      carbs: src.carbs ? String(src.carbs) : "",
      fat: src.fat ? String(src.fat) : "",
    });
  }, [open, item, defaults]);

  const valid = f.name.trim().length > 0;

  const save = () => {
    if (!valid) return;
    const data = { meal: f.meal, name: f.name.trim(), kcal: n(f.kcal), protein: n(f.protein), carbs: n(f.carbs), fat: n(f.fat) };
    if (item) updateFood(dateKey, item.id, data);
    else addFood(dateKey, data);
    closeFood();
  };

  const remove = () => {
    deleteFood(dateKey, item.id);
    closeFood();
  };

  const num = (k, label, unit) => (
    <Field label={`${label} (${unit})`}>
      <input className="input" type="number" inputMode="decimal" min="0" step="any" value={f[k]} onChange={set(k)} placeholder="0" />
    </Field>
  );

  return (
    <Sheet
      open={open}
      onClose={closeFood}
      title={item ? "Edit food" : "Add food"}
      footer={
        <>
          {item && (
            <button className="btn btn-danger" onClick={remove}>
              <Trash2 size={16} /> Delete
            </button>
          )}
          <span className="grow" />
          <button className="btn btn-ghost" onClick={closeFood}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={save} disabled={!valid}>
            {item ? "Save" : "Add"}
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
          <Field label="Meal">
            <Select className="input" value={f.meal} onChange={set("meal")}>
              {MEALS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </Select>
          </Field>
          <Field label="Food">
            <input className="input" autoFocus placeholder="e.g. Oats with banana" value={f.name} onChange={set("name")} />
          </Field>
        </div>
        <div className="form-row">
          {num("kcal", "Calories", "kcal")}
          {num("protein", "Protein", "g")}
        </div>
        <div className="form-row">
          {num("carbs", "Carbs", "g")}
          {num("fat", "Fat", "g")}
        </div>
        <span className="field-hint">Everything except the name is optional. Rough numbers are fine.</span>
        <button type="submit" hidden />
      </form>
    </Sheet>
  );
}
