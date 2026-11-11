import { dowOf, dueDate, toKey } from "./dates";

// Does this task have an occurrence on the given day?
export const occursOn = (t, key) => {
  switch (t.repeat) {
    case "daily":
      return key >= t.date;
    case "weekdays": {
      if (key < t.date) return false;
      const d = dowOf(key);
      return d >= 1 && d <= 5;
    }
    case "weekly":
      return key >= t.date && dowOf(key) === dowOf(t.date);
    default:
      return key === t.date;
  }
};

export const isDone = (t, key) => (t.doneDates || []).includes(key);

const byTime = (a, b) => (a.time || "99:99").localeCompare(b.time || "99:99") || a.title.localeCompare(b.title);

export const tasksOn = (tasks, key) => tasks.filter((t) => occursOn(t, key)).sort(byTime);

export const dayStats = (tasks, key) => {
  const list = tasksOn(tasks, key);
  const done = list.filter((t) => isDone(t, key)).length;
  return { total: list.length, done, pct: list.length ? done / list.length : 0 };
};

// open | upcoming | ringing | missed | done
export function taskStatus(t, key, now, windowMin) {
  if (isDone(t, key)) return { state: "done" };
  const today = toKey(now);
  if (!t.time) return { state: key < today ? "missed" : "open" };
  const due = dueDate(key, t.time);
  const end = new Date(due.getTime() + windowMin * 60000);
  if (now < due) return { state: "upcoming", due, end };
  if (now <= end) return { state: "ringing", due, end };
  return { state: "missed", due, end };
}

// Non-repeating tasks from earlier days that were never ticked
export const overdueTasks = (tasks, today) =>
  tasks.filter((t) => (!t.repeat || t.repeat === "none") && t.date < today && !isDone(t, t.date));

const CAT_HINTS = [
  [/leetcode|dsa|array|graph|tree|dp\b|problem|algorithm|hackerrank|codeforces/i, "DSA"],
  [/aptitude|quant|reasoning|verbal/i, "Aptitude"],
  [/\bos\b|dbms|cn\b|oops|sql|operating|network|system design/i, "Core CS"],
  [/project|build|deploy|feature|bug|commit|github/i, "Projects"],
  [/mock|speak|english|presentation|communication|gd\b/i, "Communication"],
  [/resume|interview|apply|application|referral|linkedin/i, "Placement"],
  [/bath|gym|workout|run|walk|sleep|water|yoga|meditat/i, "Health"],
];

export const guessCategory = (title) => {
  for (const [re, cat] of CAT_HINTS) if (re.test(title)) return cat;
  return "Personal";
};
