import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Timer } from "lucide-react";
import Ring from "./Ring";
import { useStore } from "../lib/store";
import { mmss, todayKey } from "../lib/dates";
import { beep, showNotification } from "../lib/reminders";

const MODES = {
  focus: { label: "Focus", mins: 25, from: "#ff375f", to: "#ff9f0a" },
  break: { label: "Break", mins: 5, from: "#30c85e", to: "#32ade6" },
};

export default function FocusTimer() {
  const { state, addFocus } = useStore();
  const [mode, setMode] = useState("focus");
  const [left, setLeft] = useState(MODES.focus.mins * 60);
  const [running, setRunning] = useState(false);
  const endAt = useRef(0);
  const m = MODES[mode];

  // timestamp-based so it stays accurate when the tab is throttled
  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => {
      const remaining = Math.max(0, Math.round((endAt.current - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining === 0) {
        setRunning(false);
        if (mode === "focus") addFocus(MODES.focus.mins);
        if (state.settings.sound) beep();
        showNotification(mode === "focus" ? "Focus session complete 🎉" : "Break over", mode === "focus" ? "Take a 5 minute break." : "Ready for the next session?", "focus-timer");
        const next = mode === "focus" ? "break" : "focus";
        setMode(next);
        setLeft(MODES[next].mins * 60);
      }
    }, 250);
    return () => clearInterval(id);
  }, [running, mode, addFocus, state.settings.sound]);

  const toggle = () => {
    if (!running) endAt.current = Date.now() + left * 1000;
    setRunning((r) => !r);
  };
  const reset = () => {
    setRunning(false);
    setLeft(m.mins * 60);
  };
  const switchMode = (k) => {
    setMode(k);
    setRunning(false);
    setLeft(MODES[k].mins * 60);
  };

  return (
    <div className="card focus">
      <div className="card-head">
        <h3>
          <Timer size={16} /> Focus timer
        </h3>
        <div className="seg seg-sm">
          {Object.entries(MODES).map(([k, v]) => (
            <button key={k} className={mode === k ? "on" : ""} onClick={() => switchMode(k)}>
              {v.label}
            </button>
          ))}
        </div>
      </div>
      <div className="focus-body">
        <Ring pct={1 - left / (m.mins * 60)} size={104} stroke={10} from={m.from} to={m.to}>
          <span className="focus-time">{mmss(left)}</span>
        </Ring>
        <div className="focus-controls">
          <button className="btn btn-primary" onClick={toggle}>
            {running ? <Pause size={16} /> : <Play size={16} />} {running ? "Pause" : "Start"}
          </button>
          <button className="btn btn-ghost" onClick={reset}>
            <RotateCcw size={16} /> Reset
          </button>
          <span className="muted small">Today: {state.focus[todayKey()] || 0} min focused</span>
        </div>
      </div>
    </div>
  );
}
