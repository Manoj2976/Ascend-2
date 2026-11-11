<<<<<<< HEAD
import Select from "../components/Select";
import { useRef, useState } from "react";
import { Bell, BellRing, Download, LogOut, RefreshCw, Smartphone, Trash2, Upload, UserRound } from "lucide-react";
=======
import { useRef, useState } from "react";
import { Bell, BellRing, Download, LogOut, RefreshCw, Smartphone, Sparkles, Trash2, Upload, UserRound } from "lucide-react";
>>>>>>> 6e9173cad89b7b53fed34d11013f586fd91d429b
import PageHeader, { Page } from "../components/PageHeader";
import { useStore } from "../lib/store";
import { useAuth } from "../lib/auth";
import TelegramCard from "../components/TelegramCard";
import { useSync } from "../lib/sync";
import { syncLabel } from "../components/SyncBanner";
import { beep, ensurePermission, notificationsSupported, showNotification } from "../lib/reminders";

const Row = ({ title, hint, children }) => (
  <div className="set-row">
    <div>
      <strong>{title}</strong>
      {hint && <span className="muted small">{hint}</span>}
    </div>
    <div>{children}</div>
  </div>
);

const Switch = ({ on, onChange, label }) => (
  <button role="switch" aria-checked={on} aria-label={label} className={`switch ${on ? "on" : ""}`} onClick={() => onChange(!on)}>
    <i />
  </button>
);

export default function Settings() {
<<<<<<< HEAD
  const { state, setSettings, exportData, importData, resetAll } = useStore();
=======
  const { state, setSettings, exportData, importData, loadSample, resetAll } = useStore();
>>>>>>> 6e9173cad89b7b53fed34d11013f586fd91d429b
  const { auth, logout } = useAuth();
  const { status, syncNow } = useSync();
  const s = state.settings;
  const fileRef = useRef(null);
  const [perm, setPerm] = useState(notificationsSupported() ? Notification.permission : "unsupported");
  const [msg, setMsg] = useState("");

  const enable = async () => setPerm(await ensurePermission());

  const test = async () => {
    const p = await ensurePermission();
    setPerm(p);
    if (s.sound) beep();
    const ok = await showNotification("⏰ Test reminder", "If you can see this, reminders will reach you.", "ascend-test");
    setMsg(ok ? "Sent. Check your notifications." : p === "denied" ? "Notifications are blocked. Allow them in your browser's site settings." : "Notifications aren't available in this browser.");
  };

  const download = () => {
    const blob = new Blob([exportData()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ascend-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const upload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      importData(await file.text());
      setMsg("Backup restored.");
    } catch (err) {
      setMsg(`Couldn't import: ${err.message}`);
    }
  };

  return (
    <Page>
      <PageHeader title="Settings" subtitle="Make Ascend work the way you do" />

      <section className="card set">
        <h3>
          <UserRound size={17} /> Account
        </h3>
        {auth.status === "user" ? (
          <Row title={auth.name || "Signed in"} hint={auth.email}>
            <button className="btn btn-ghost btn-sm" onClick={logout}>
              <LogOut size={15} /> Log out
            </button>
          </Row>
        ) : null}
        {auth.status === "user" ? (
          <Row title="Cloud sync" hint={syncLabel(status)}>
            <button className="btn btn-ghost btn-sm" onClick={() => syncNow()} disabled={status === "syncing"}>
              <RefreshCw size={15} /> Sync now
            </button>
          </Row>
        ) : (
          <Row title="Using Ascend without an account" hint="Your data stays on this device only">
            <button className="btn btn-primary btn-sm" onClick={logout}>
              Sign in or sign up
            </button>
          </Row>
        )}
      </section>

      <section className="card set">
        <h3>Profile & appearance</h3>
        <Row title="Your name" hint="Shown in the greeting">
          <input className="input input-sm" value={s.name} onChange={(e) => setSettings({ name: e.target.value })} placeholder="Name" />
        </Row>
        <Row title="Theme">
          <div className="seg seg-sm">
            {["light", "dark", "auto"].map((t) => (
              <button key={t} className={s.theme === t ? "on" : ""} onClick={() => setSettings({ theme: t })}>
                {t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </Row>
        <Row title="Streak threshold" hint="A day counts when this much of it is done">
          <div className="row gap">
            <input type="range" min="50" max="100" step="10" value={s.streakThreshold} onChange={(e) => setSettings({ streakThreshold: Number(e.target.value) })} />
            <span className="small">{s.streakThreshold}%</span>
          </div>
        </Row>
      </section>

      <section className="card set">
        <h3>
          <BellRing size={17} /> Reminders
        </h3>
        <Row title="Notifications" hint={perm === "granted" ? "Allowed in this browser" : perm === "denied" ? "Blocked — change in browser site settings" : perm === "unsupported" ? "Not supported here" : "Permission needed"}>
          <div className="row gap">
            {perm !== "granted" && perm !== "unsupported" && perm !== "denied" && (
              <button className="btn btn-primary btn-sm" onClick={enable}>
                <Bell size={15} /> Allow
              </button>
            )}
            <Switch on={s.notifications} onChange={(v) => setSettings({ notifications: v })} label="Notifications" />
          </div>
        </Row>
        <Row title="Remind me for" hint="After a task's time, keep reminding for this long">
<<<<<<< HEAD
          <Select className="input input-sm" value={s.windowMin} onChange={(e) => setSettings({ windowMin: Number(e.target.value) })}>
=======
          <select className="input input-sm" value={s.windowMin} onChange={(e) => setSettings({ windowMin: Number(e.target.value) })}>
>>>>>>> 6e9173cad89b7b53fed34d11013f586fd91d429b
            {[10, 15, 30, 45, 60, 90].map((m) => (
              <option key={m} value={m}>
                {m} minutes
              </option>
            ))}
<<<<<<< HEAD
          </Select>
        </Row>
        <Row title="Repeat every" hint="Until the task is ticked">
          <Select className="input input-sm" value={s.intervalMin} onChange={(e) => setSettings({ intervalMin: Number(e.target.value) })}>
=======
          </select>
        </Row>
        <Row title="Repeat every" hint="Until the task is ticked">
          <select className="input input-sm" value={s.intervalMin} onChange={(e) => setSettings({ intervalMin: Number(e.target.value) })}>
>>>>>>> 6e9173cad89b7b53fed34d11013f586fd91d429b
            {[1, 2, 3, 5, 10, 15].map((m) => (
              <option key={m} value={m}>
                {m} minute{m > 1 ? "s" : ""}
              </option>
            ))}
<<<<<<< HEAD
          </Select>
=======
          </select>
>>>>>>> 6e9173cad89b7b53fed34d11013f586fd91d429b
        </Row>
        <Row title="Sound">
          <Switch on={s.sound} onChange={(v) => setSettings({ sound: v })} label="Sound" />
        </Row>
        <Row title="Send a test" hint={msg || "Checks that notifications reach you"}>
          <button className="btn btn-ghost btn-sm" onClick={test}>
            Test now
          </button>
        </Row>
        <div className="note">
          <Smartphone size={16} />
          <p>
            Reminders fire while Ascend is open (a pinned tab or installed app works best). On iPhone, tap <strong>Share → Add to Home Screen</strong> first (iOS 16.4+). Reminders that reach you with the app closed need the backend's Web Push — the service worker is already wired for it.
          </p>
        </div>
      </section>

      {auth.status === "user" && <TelegramCard />}

      <section className="card set">
        <h3>Your data</h3>
        <Row title="Storage" hint={auth.status === "user" ? "Working copy lives in this browser and syncs to your account. Export now and then for a backup." : "Saved in this browser (localStorage). Export regularly."}>
          <div className="row gap">
            <button className="btn btn-ghost btn-sm" onClick={download}>
              <Download size={15} /> Export
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()}>
              <Upload size={15} /> Import
            </button>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={upload} />
          </div>
        </Row>
<<<<<<< HEAD
=======
        <Row title="Sample data" hint="Replaces your current data with a demo">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => window.confirm("Replace all current data with sample data?") && loadSample()}
          >
            <Sparkles size={15} /> Load
          </button>
        </Row>
>>>>>>> 6e9173cad89b7b53fed34d11013f586fd91d429b
        <Row title="Reset everything" hint="Deletes tasks, targets, journal and applications">
          <button className="btn btn-danger btn-sm" onClick={() => window.confirm("Delete ALL data? This can't be undone.") && resetAll()}>
            <Trash2 size={15} /> Reset
          </button>
        </Row>
      </section>
    </Page>
  );
}
