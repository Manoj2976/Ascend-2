import { addDays, monthKey, todayKey } from "./dates";
import { uid } from "./constants";

// Deterministic pseudo-random so the demo data looks the same every time
const rng = (seed) => () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);

export function makeSample() {
  const rand = rng(7);
  const today = todayKey();
  const month = monthKey();
  const year = new Date().getFullYear();

  const finalId = uid();
  const m1 = uid();
  const m2 = uid();
  const m3 = uid();
  const d1 = uid();
  const d2 = uid();

  const goals = [
    { id: finalId, type: "FINAL", title: "Get placed at a product-based company", deadline: `${year + 1}-06-30`, target: 100, progress: 0, parentId: "" },
    { id: m1, type: "MONTHLY", title: "Solve 60 DSA problems", month, unit: "problems", target: 60, progress: 18, parentId: finalId },
    { id: m2, type: "MONTHLY", title: "Ship the Task Manager project", month, unit: "milestones", target: 10, progress: 4, parentId: finalId },
    { id: m3, type: "MONTHLY", title: "Finish 4 aptitude mock tests", month, unit: "tests", target: 4, progress: 1, parentId: finalId },
    { id: d1, type: "DAILY", title: "DSA problems", unit: "problems", target: 3, logs: { [today]: 1, [addDays(today, -1)]: 3, [addDays(today, -2)]: 3 } },
    { id: d2, type: "DAILY", title: "Read one tech article", unit: "article", target: 1, logs: { [addDays(today, -1)]: 1 } },
  ];

  const base = (o) => ({ id: uid(), time: "", category: "Personal", repeat: "none", goalId: "", notes: "", doneDates: [], date: today, ...o });

  // Habit task with ~75% completion over the last 70 days so the heatmap has something to show
  const habitStart = addDays(today, -70);
  const habitDone = [];
  for (let i = 70; i >= 1; i--) if (rand() < 0.78) habitDone.push(addDays(today, -i));

  const tasks = [
    base({ title: "Revise yesterday's notes", time: "07:00", category: "Core CS", repeat: "daily", date: habitStart, doneDates: habitDone }),
    base({ title: "Morning workout", time: "06:30", category: "Health", repeat: "daily", date: addDays(today, -30), doneDates: habitDone.filter(() => rand() < 0.8) }),
    base({ title: "Solve 2 LeetCode mediums", time: "10:00", category: "DSA", goalId: m1 }),
    base({ title: "Aptitude practice set", time: "14:00", category: "Aptitude", goalId: m3 }),
    base({ title: "Task Manager: build calendar view", time: "16:30", category: "Projects", goalId: m2 }),
    base({ title: "Update resume", time: "18:00", category: "Placement" }),
    base({ title: "Bath", time: "21:00", category: "Health", repeat: "daily", date: addDays(today, -10), doneDates: Array.from({ length: 10 }, (_, i) => addDays(today, -(i + 1))) }),
    base({ title: "Mock interview with friend", date: addDays(today, 2), time: "17:00", category: "Communication" }),
    base({ title: "Apply to 3 companies", date: addDays(today, 1), category: "Placement" }),
    base({ title: "Finish OS chapter 5", date: addDays(today, -1), category: "Core CS" }), // overdue
    base({ title: "Weekly review", time: "20:00", category: "Personal", repeat: "weekly", date: addDays(today, -21) }),
  ];

  const journal = {
    [addDays(today, -1)]: {
      mood: 4,
      text: "Finished the OS notes and solved 3 DSA problems. Focus was good in the morning, slipped after lunch.",
      learned: "Two pointers pattern for sorted arrays; paging vs segmentation.",
      plan: "Start the calendar view of the task manager.",
    },
    [addDays(today, -2)]: {
      mood: 3,
      text: "Average day. Spent too long on one hard problem.",
      learned: "Time-box problems to 30 minutes before looking at hints.",
      plan: "Aptitude set + two DSA problems.",
    },
  };

  const applications = [
    { id: uid(), company: "Acme Systems", role: "Software Engineer Intern", status: "Applied", date: addDays(today, -5), link: "", notes: "Referred by a senior." },
    { id: uid(), company: "Nimbus Labs", role: "Backend Developer", status: "Online Test", date: addDays(today, -2), link: "", notes: "OA on Saturday, 90 mins." },
    { id: uid(), company: "Orbit Pay", role: "SDE-1", status: "Wishlist", date: today, link: "", notes: "" },
  ];

  const focus = { [addDays(today, -1)]: 100, [addDays(today, -2)]: 75, [addDays(today, -3)]: 50, [today]: 25 };

  const slot = (day, start, end, title, kind, place = "") => ({ id: uid(), day, start, end, title, kind, place, notes: "" });
  const timetable = [];
  for (const d of [1, 2, 3, 4, 5]) timetable.push(slot(d, "13:00", "14:00", "Lunch break", "Break"), slot(d, "19:00", "20:30", "DSA practice", "Practice", "Library"));
  timetable.push(
    slot(1, "09:00", "10:00", "Operating Systems", "Class", "Block B, 204"),
    slot(1, "10:00", "11:00", "DBMS", "Class", "Block B, 204"),
    slot(2, "09:00", "10:00", "Computer Networks", "Class", "Block A, 110"),
    slot(2, "14:00", "17:00", "DBMS Lab", "Lab", "Lab 3"),
    slot(3, "09:00", "10:00", "Operating Systems", "Class", "Block B, 204"),
    slot(3, "11:00", "12:00", "Aptitude & Reasoning", "Class", "Seminar Hall"),
    slot(4, "10:00", "11:00", "Computer Networks", "Class", "Block A, 110"),
    slot(4, "14:00", "16:00", "Project work", "Study", "Library"),
    slot(5, "09:00", "10:00", "DBMS", "Class", "Block B, 204"),
    slot(5, "15:00", "16:00", "Mock interview", "Practice", "Placement cell"),
    slot(6, "10:00", "12:00", "Weekly revision", "Study", "Home"),
    slot(0, "11:00", "12:30", "Mock test", "Practice", "Home")
  );

  const meal = (m, name, kcal, protein, carbs, fat) => ({ id: uid(), meal: m, name, kcal, protein, carbs, fat });
  const dayItems = (variant) => [
    meal("Breakfast", variant ? "Poha with peanuts" : "Oats with banana", variant ? 300 : 320, variant ? 8 : 11, variant ? 48 : 58, variant ? 9 : 6),
    meal("Lunch", "Dal, rice, sabzi, curd", 650, 24, 105, 14),
    meal("Snacks", variant ? "Fruit and nuts" : "Sprouts chaat", variant ? 220 : 180, variant ? 6 : 10, variant ? 20 : 28, variant ? 12 : 3),
    meal("Dinner", variant ? "Roti, paneer bhurji" : "Roti, dal, salad", variant ? 580 : 480, variant ? 28 : 20, variant ? 55 : 70, variant ? 24 : 10),
  ];
  const diet = {
    goals: { calories: 2100, protein: 70, water: 8 },
    logs: {
      [addDays(today, -3)]: { items: dayItems(0), water: 7 },
      [addDays(today, -2)]: { items: dayItems(1), water: 8 },
      [addDays(today, -1)]: { items: dayItems(0).slice(0, 3), water: 6 },
      [today]: { items: dayItems(1).slice(0, 1), water: 2 },
    },
    plan: {
      1: { Breakfast: "Oats with banana", Lunch: "Dal, rice, sabzi", Snacks: "Sprouts chaat", Dinner: "Roti, dal, salad" },
      2: { Breakfast: "Poha with peanuts", Lunch: "Rajma rice", Snacks: "Fruit and nuts", Dinner: "Roti, paneer bhurji" },
      3: { Breakfast: "Idli sambar", Lunch: "Veg pulao, raita", Snacks: "Roasted chana", Dinner: "Khichdi, curd" },
    },
  };

  return { tasks, goals, journal, applications, focus, timetable, diet };
}
