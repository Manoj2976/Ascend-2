import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  Briefcase,
  CalendarDays,
  Flame,
  Clock,
  Home,
  ListChecks,
  LogOut,
  MoreHorizontal,
  Plus,
  Salad,
  Settings,
  Target,
} from "lucide-react";
import { useStore } from "../lib/store";
import { useAuth } from "../lib/auth";
import { useUI } from "../lib/ui";
import { useSync } from "../lib/sync";
import { syncLabel } from "./SyncBanner";
import { currentStreak } from "../lib/stats";
import { todayKey } from "../lib/dates";

export const NAV = [
  { to: "/", icon: Home, label: "Today", end: true },
  { to: "/tasks", icon: ListChecks, label: "Tasks" },
  { to: "/calendar", icon: CalendarDays, label: "Calendar" },
  { to: "/timetable", icon: Clock, label: "Time Table" },
  { to: "/targets", icon: Target, label: "Targets" },
  { to: "/journal", icon: BookOpen, label: "Journal" },
  { to: "/diet", icon: Salad, label: "Diet" },
  { to: "/insights", icon: BarChart3, label: "Insights" },
  { to: "/placement", icon: Briefcase, label: "Placement" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function Background() {
  return (
    <div className="bg" aria-hidden="true">
      <span className="blob b1" />
      <span className="blob b2" />
      <span className="blob b3" />
      <span className="blob b4" />
    </div>
  );
}

export function Sidebar() {
  const { state } = useStore();
  const { auth, logout } = useAuth();
  const { status } = useSync();
  const who = auth.status === "user" ? auth.name || auth.email : "Guest";
  const streak = currentStreak(state.tasks, todayKey(), state.settings.streakThreshold);
  return (
    <aside className="sidebar glass">
      <div className="brand">
        <img src="/icon.svg" alt="" width="34" height="34" />
        <div>
          <strong>Ascend</strong>
          <span>Placement journey</span>
        </div>
      </div>
      <nav>
        {NAV.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="side-foot">
        <div className="streak-card">
          <Flame size={20} />
          <div>
            <strong>{streak} day streak</strong>
            <span>{streak ? "Keep it going" : "Finish today to start one"}</span>
          </div>
        </div>
        <div className="acct">
          <span className="avatar" aria-hidden="true">
            {who.trim().charAt(0).toUpperCase() || "?"}
          </span>
          <span className="grow acct-text">
            <strong>{who}</strong>
            <small className={`sync-${status}`}>{auth.status === "user" ? syncLabel(status) : "Data stays on this device"}</small>
          </span>
          <button className="icon-btn" onClick={logout} aria-label={auth.status === "user" ? "Log out" : "Sign in"} title={auth.status === "user" ? "Log out" : "Sign in"}>
            <LogOut size={17} />
          </button>
        </div>
        <span className="kbd-hint">
          Press <kbd>N</kbd> for a new task
        </span>
      </div>
    </aside>
  );
}

const TABS = [
  { to: "/", icon: Home, label: "Today", end: true },
  { to: "/tasks", icon: ListChecks, label: "Tasks" },
  { to: "/calendar", icon: CalendarDays, label: "Calendar" },
  { to: "/targets", icon: Target, label: "Targets" },
];
const MORE_PATHS = ["/more", "/timetable", "/diet", "/journal", "/insights", "/placement", "/settings"];

export function TabBar() {
  const { pathname } = useLocation();
  const moreActive = MORE_PATHS.includes(pathname);
  return (
    <nav className="tabbar glass" aria-label="Main">
      {TABS.map(({ to, icon: Icon, label, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>
          <Icon size={22} />
          <span>{label}</span>
        </NavLink>
      ))}
      <NavLink to="/more" className={`tab ${moreActive ? "active" : ""}`}>
        <MoreHorizontal size={22} />
        <span>More</span>
      </NavLink>
    </nav>
  );
}

export function Fab() {
  const { openTask } = useUI();
  return (
    <motion.button className="fab" whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} onClick={() => openTask()} aria-label="New task">
      <Plus size={26} />
    </motion.button>
  );
}
