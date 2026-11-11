import { Link } from "react-router-dom";
import { BarChart3, BookOpen, Briefcase, ChevronRight, Clock, Salad, Settings } from "lucide-react";
import PageHeader, { Page } from "../components/PageHeader";

const ITEMS = [
  { to: "/timetable", icon: Clock, label: "Time Table", hint: "Weekly classes, labs and study blocks", tint: "#5e5ce6" },
  { to: "/diet", icon: Salad, label: "Diet", hint: "Meals, calories, water and a weekly plan", tint: "#ff375f" },
  { to: "/journal", icon: BookOpen, label: "Journal", hint: "Daily log of your journey", tint: "#ff9f0a" },
  { to: "/insights", icon: BarChart3, label: "Insights", hint: "Streaks, heatmap, weekly review", tint: "#30c85e" },
  { to: "/placement", icon: Briefcase, label: "Placement", hint: "Companies and application stages", tint: "#0a84ff" },
  { to: "/settings", icon: Settings, label: "Settings", hint: "Account, reminders, theme, backup", tint: "#8e8e93" },
];

export default function More() {
  return (
    <Page>
      <PageHeader title="More" />
      <div className="card menu">
        {ITEMS.map(({ to, icon: Icon, label, hint, tint }) => (
          <Link key={to} to={to} className="menu-item">
            <span className="tile-icon" style={{ background: `${tint}22`, color: tint }}>
              <Icon size={19} />
            </span>
            <span className="grow">
              <strong>{label}</strong>
              <small>{hint}</small>
            </span>
            <ChevronRight size={18} className="muted" />
          </Link>
        ))}
      </div>
    </Page>
  );
}
