import { addDays, dowOf, pad, todayKey } from "./dates";
import { guessCategory } from "./tasks";

const DAY_NAMES = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

// "Study OS 7pm tomorrow"  ->  { title: "Study OS", time: "19:00", date: <tomorrow> }
// "Bath at 9:00 pm daily" ->  { title: "Bath", time: "21:00", repeat: "daily" }
export function parseQuickAdd(input) {
  let text = ` ${input.trim()} `;
  let date = todayKey();
  let time = "";
  let repeat = "none";

  text = text.replace(/\b(?:every\s*day|daily)\b/i, () => ((repeat = "daily"), " "));
  text = text.replace(/\bweekdays\b/i, () => ((repeat = "weekdays"), " "));
  text = text.replace(/\b(?:every\s*week|weekly)\b/i, () => ((repeat = "weekly"), " "));

  text = text.replace(/\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i, (_, h, m, ap) => {
    let hh = Number(h) % 12;
    if (ap.toLowerCase() === "pm") hh += 12;
    time = `${pad(hh)}:${m || "00"}`;
    return " ";
  });
  if (!time) {
    text = text.replace(/\b(?:at\s+)?([01]?\d|2[0-3]):([0-5]\d)\b/, (_, h, m) => {
      time = `${pad(Number(h))}:${m}`;
      return " ";
    });
  }

  text = text.replace(/\btomorrow\b/i, () => ((date = addDays(todayKey(), 1)), " "));
  text = text.replace(/\btoday\b/i, () => " ");
  text = text.replace(
    /\b(?:on\s+|next\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday|sun|mon|tues|tue|wed|thurs|thur|thu|fri|sat)\b/i,
    (_, d) => {
      const target = DAY_NAMES.indexOf(d.toLowerCase().slice(0, 3));
      let diff = (target - dowOf(todayKey()) + 7) % 7;
      if (diff === 0) diff = 7;
      date = addDays(todayKey(), diff);
      return " ";
    }
  );

  const title = text
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^(at|on)\s+/i, "")
    .replace(/\s+(at|on)$/i, "");

  return { title, date, time, repeat, category: guessCategory(title) };
}
