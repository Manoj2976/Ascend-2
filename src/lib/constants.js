export const CATEGORIES = [
  { id: "DSA", color: "#5e5ce6" },
  { id: "Aptitude", color: "#ff9f0a" },
  { id: "Core CS", color: "#0a84ff" },
  { id: "Projects", color: "#bf5af2" },
  { id: "Communication", color: "#ff375f" },
  { id: "Placement", color: "#32ade6" },
  { id: "Health", color: "#30c85e" },
  { id: "Personal", color: "#8e8e93" },
];

export const catColor = (id) => (CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1]).color;

export const REPEATS = [
  { id: "none", label: "Never" },
  { id: "daily", label: "Every day" },
  { id: "weekdays", label: "Weekdays" },
  { id: "weekly", label: "Every week" },
];

export const MOODS = ["😫", "😕", "😐", "🙂", "🤩"];

export const APP_STATUSES = ["Wishlist", "Applied", "Online Test", "Interview", "Offer", "Rejected"];

export const STATUS_COLORS = {
  Wishlist: "#8e8e93",
  Applied: "#0a84ff",
  "Online Test": "#ff9f0a",
  Interview: "#bf5af2",
  Offer: "#30c85e",
  Rejected: "#ff453a",
};

// UUIDs, because the backend uses them as primary keys and keeps them across syncs
const hex = (n) => Math.floor(Math.random() * 16 ** n).toString(16).padStart(n, "0");
export const uid = () =>
  globalThis.crypto?.randomUUID?.() ||
  `${hex(8)}-${hex(4)}-4${hex(3)}-${(8 + Math.floor(Math.random() * 4)).toString(16)}${hex(3)}-${hex(12)}`;
export const isUuid = (s) => typeof s === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
