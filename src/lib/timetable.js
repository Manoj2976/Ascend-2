import { pad } from "./dates";

export const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Monday first
export const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const KINDS = [
  { id: "Class", color: "#0a84ff" },
  { id: "Lab", color: "#bf5af2" },
  { id: "Study", color: "#5e5ce6" },
  { id: "Practice", color: "#ff9f0a" },
  { id: "Break", color: "#30c85e" },
  { id: "Other", color: "#8e8e93" },
];
export const kindColor = (id) => (KINDS.find((k) => k.id === id) || KINDS[KINDS.length - 1]).color;

export const toMin = (t) => {
  const [h, m] = (t || "0:0").split(":").map(Number);
  return h * 60 + m;
};
export const fromMin = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
export const duration = (e) => toMin(e.end) - toMin(e.start);

export const entriesOn = (tt, dow) => tt.filter((e) => e.day === dow).sort((a, b) => toMin(a.start) - toMin(b.start) || toMin(a.end) - toMin(b.end));

// Entries on the same day whose time ranges intersect the candidate's
export const overlaps = (tt, cand, ignoreId) =>
  tt.filter((e) => e.id !== ignoreId && e.day === cand.day && toMin(e.start) < toMin(cand.end) && toMin(cand.start) < toMin(e.end));

/**
 * Side-by-side lanes for overlapping entries of one day.
 * Returns [{ entry, lane, lanes }] where lanes is the width divisor shared by the overlapping cluster.
 */
export function layoutDay(entries) {
  const sorted = [...entries].sort((a, b) => toMin(a.start) - toMin(b.start) || toMin(b.end) - toMin(a.end));
  const out = [];
  let cluster = [];
  let clusterEnd = -1;
  const flush = () => {
    if (!cluster.length) return;
    const laneEnds = [];
    const placed = cluster.map((entry) => {
      let lane = laneEnds.findIndex((end) => end <= toMin(entry.start));
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(0);
      }
      laneEnds[lane] = toMin(entry.end);
      return { entry, lane };
    });
    placed.forEach((p) => out.push({ ...p, lanes: laneEnds.length }));
    cluster = [];
  };
  for (const e of sorted) {
    if (cluster.length && toMin(e.start) >= clusterEnd) flush();
    cluster.push(e);
    clusterEnd = Math.max(cluster.length === 1 ? 0 : clusterEnd, toMin(e.end));
  }
  flush();
  return out;
}

// Visible hour range for the week grid (at least 8:00 to 18:00)
export function gridRange(tt) {
  let lo = 8;
  let hi = 18;
  for (const e of tt) {
    lo = Math.min(lo, Math.floor(toMin(e.start) / 60));
    hi = Math.max(hi, Math.ceil(toMin(e.end) / 60));
  }
  return { start: Math.max(0, lo), end: Math.min(24, hi) };
}

export function nowNext(tt, now) {
  const m = now.getHours() * 60 + now.getMinutes();
  const list = entriesOn(tt, now.getDay());
  const current = list.find((e) => toMin(e.start) <= m && m < toMin(e.end)) || null;
  const next = list.find((e) => toMin(e.start) > m) || null;
  return { current, next, minutesLeft: current ? toMin(current.end) - m : 0, minutesUntil: next ? toMin(next.start) - m : 0 };
}

export function weekMinutesByKind(tt) {
  const map = {};
  for (const e of tt) if (e.kind !== "Break") map[e.kind] = (map[e.kind] || 0) + duration(e);
  return KINDS.map((k) => ({ id: k.id, minutes: map[k.id] || 0 })).filter((x) => x.minutes > 0);
}

export const fmtDur = (min) => (min >= 60 ? `${Math.floor(min / 60)}h${min % 60 ? ` ${min % 60}m` : ""}` : `${min}m`);
