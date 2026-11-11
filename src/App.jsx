import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { StoreProvider, useStore } from "./lib/store";
import { AuthProvider, useAuth } from "./lib/auth";
import { NowProvider, UIProvider, useUI } from "./lib/ui";
import { Fab, Sidebar, TabBar, Background } from "./components/Layout";
import ReminderEngine from "./components/ReminderEngine";
import ReminderBanner from "./components/ReminderBanner";
import SyncBanner from "./components/SyncBanner";
import { SyncProvider } from "./lib/sync";
import TaskModal from "./components/TaskModal";
import GoalModal from "./components/GoalModal";
import AppModal from "./components/AppModal";
import TimetableModal from "./components/TimetableModal";
import FoodModal from "./components/FoodModal";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import Timetable from "./pages/Timetable";
import Targets from "./pages/Targets";
import Journal from "./pages/Journal";
import Diet from "./pages/Diet";
import Insights from "./pages/Insights";
import Placement from "./pages/Placement";
import Settings from "./pages/Settings";
import More from "./pages/More";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// light | dark | auto (follow the OS)
function useTheme(theme) {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "auto" && mq.matches);
      document.documentElement.dataset.theme = dark ? "dark" : "light";
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#0b0d14" : "#eef2ff");
    };
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, [theme]);
}

function Shell() {
  const { state } = useStore();
  const { openTask } = useUI();
  useTheme(state.settings.theme);

  // "N" opens a new task from anywhere
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || e.target?.isContentEditable) return;
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        openTask();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openTask]);

  return (
    <div className="app">
      <Background />
      <Sidebar />
      <main className="main">
        <SyncBanner />
        <ReminderBanner />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/timetable" element={<Timetable />} />
          <Route path="/targets" element={<Targets />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/diet" element={<Diet />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/placement" element={<Placement />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/more" element={<More />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/signup" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <TabBar />
      <Fab />
      <ReminderEngine />
      <TaskModal />
      <GoalModal />
      <AppModal />
      <TimetableModal />
      <FoodModal />
    </div>
  );
}

// Logged-out visitors only ever see the two account pages
function AuthRoutes() {
<<<<<<< HEAD
  useTheme("light");
=======
  useTheme("auto");
>>>>>>> 6e9173cad89b7b53fed34d11013f586fd91d429b
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function Root() {
  const { auth, storageKey } = useAuth();
  if (auth.status === "out") return <AuthRoutes />;
  // key: switching accounts remounts the store so it loads that account's data
  return (
    <StoreProvider key={storageKey} storageKey={storageKey} seedName={auth.status === "user" ? auth.name : ""}>
      <NowProvider>
        <SyncProvider storageKey={storageKey}>
          <UIProvider>
            <Shell />
          </UIProvider>
        </SyncProvider>
      </NowProvider>
    </StoreProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}
