import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { stateApi } from "./api";
import { useAuth } from "./auth";
import { useStore } from "./store";

// Keeps this device and the backend in step.
//  - every change is saved to the server a couple of seconds later
//  - on login and when you come back to the tab, newer data from another device is pulled in
//  - a revision number stops an old device from overwriting newer data; if both sides changed you choose
// localStorage stays the working copy, so the app keeps working offline and syncs when it can.

const SyncCtx = createContext({ status: "off", syncNow: () => {}, conflict: null, resolve: () => {}, lastSynced: null });
const SAVE_DELAY = 2000;
const RETRY_MS = 30000;

const hasData = (s) =>
  s.tasks.length > 0 ||
  s.goals.length > 0 ||
  s.applications.length > 0 ||
  s.timetable.length > 0 ||
  Object.keys(s.journal).length > 0 ||
  Object.keys(s.focus).length > 0 ||
  Object.keys(s.diet.logs || {}).length > 0;

const readMeta = (key) => {
  try {
    const m = JSON.parse(localStorage.getItem(key) || "null");
    if (m && typeof m === "object") return { rev: Number.isInteger(m.rev) ? m.rev : null, dirty: !!m.dirty };
  } catch {
    /* ignore */
  }
  return { rev: null, dirty: false };
};

export function SyncProvider({ children, storageKey }) {
  const { auth, logout } = useAuth();
  const { state, adoptState } = useStore();
  const enabled = auth.status === "user";
  const token = auth.token;
  const metaKey = `${storageKey}:sync`;

  const [status, setStatus] = useState(enabled ? "syncing" : "off"); // off | syncing | synced | offline | conflict | error
  const [conflict, setConflict] = useState(null); // the server's copy, while the user decides
  const [lastSynced, setLastSynced] = useState(null);

  const stateRef = useRef(state);
  stateRef.current = state;
  const meta = useRef(readMeta(metaKey));
  const version = useRef(0); // counts local edits
  const lastSeen = useRef(state);
  const busy = useRef(false);
  const timer = useRef(null);
  const conflictRef = useRef(null);

  const saveMeta = (m) => {
    meta.current = m;
    try {
      localStorage.setItem(metaKey, JSON.stringify(m));
    } catch {
      /* storage blocked */
    }
  };

  const onApiError = useCallback(
    (e) => {
      if (e.status === 401) {
        logout(); // token expired: back to the login page, local data is kept
        return;
      }
      setStatus(e.status === 0 ? "offline" : "error");
    },
    [logout]
  );

  const adopt = useCallback(
    (server) => {
      const next = {
        tasks: server.tasks || [],
        goals: server.goals || [],
        journal: server.journal || {},
        applications: server.applications || [],
        focus: server.focus || {},
        timetable: server.timetable || [],
        diet: server.diet || undefined,
        settings: { ...stateRef.current.settings, ...(server.settings || {}), apiBase: stateRef.current.settings.apiBase },
      };
      lastSeen.current = null; // the next state change is ours, not an edit
      adoptState(next);
      saveMeta({ rev: server.revision, dirty: false });
      setConflict(null);
      conflictRef.current = null;
      setStatus("synced");
      setLastSynced(Date.now());
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [adoptState]
  );

  const push = useCallback(
    async (baseRev) => {
      const v = version.current;
      const body = { ...stateRef.current, revision: baseRev };
      const saved = await stateApi.put(token, body);
      saveMeta({ rev: saved.revision, dirty: version.current !== v });
      setLastSynced(Date.now());
      if (version.current !== v) schedule(); // edited while saving
      else setStatus("synced");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [token]
  );

  // Compare with the server, then pull, push or ask.
  const reconcile = useCallback(async () => {
    if (!enabled || busy.current || conflictRef.current) return;
    busy.current = true;
    setStatus("syncing");
    try {
      const server = await stateApi.get(token);
      const m = meta.current;
      const local = stateRef.current;
      const serverEmpty = server.revision === 0;
      if (serverEmpty) {
        if (hasData(local)) await push(0);
        else {
          saveMeta({ rev: 0, dirty: false });
          setStatus("synced");
          setLastSynced(Date.now());
        }
      } else if (m.rev === server.revision) {
        if (m.dirty) await push(server.revision);
        else {
          setStatus("synced");
          setLastSynced(Date.now());
        }
      } else if (!hasData(local) || (m.rev !== null && !m.dirty)) {
        adopt(server); // nothing here worth keeping, or this device had no unsynced edits
      } else {
        conflictRef.current = server;
        setConflict(server);
        setStatus("conflict");
      }
    } catch (e) {
      if (e.status === 409) {
        busy.current = false;
        saveMeta({ ...meta.current, rev: -1 }); // force a fresh comparison
        return reconcile();
      }
      onApiError(e);
    } finally {
      busy.current = false;
    }
  }, [enabled, token, push, adopt, onApiError]);

  const schedule = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => reconcile(), SAVE_DELAY);
  }, [reconcile]);

  // First sync when the account opens
  useEffect(() => {
    if (enabled) reconcile();
    return () => clearTimeout(timer.current);
  }, [enabled, reconcile]);

  // Every local edit marks the data as unsynced and queues a save
  useEffect(() => {
    if (!enabled) return;
    if (state === lastSeen.current) return;
    if (lastSeen.current === null) {
      lastSeen.current = state; // result of adopting server data
      return;
    }
    lastSeen.current = state;
    version.current += 1;
    saveMeta({ ...meta.current, dirty: true });
    if (!conflictRef.current) schedule();
  }, [state, enabled, schedule]);

  // Retry while offline, and pick up other devices' changes when you return to the tab
  useEffect(() => {
    if (!enabled) return undefined;
    const again = () => document.visibilityState !== "hidden" && reconcile();
    const id = setInterval(() => (status === "offline" || status === "error") && reconcile(), RETRY_MS);
    window.addEventListener("online", again);
    window.addEventListener("focus", again);
    document.addEventListener("visibilitychange", again);
    return () => {
      clearInterval(id);
      window.removeEventListener("online", again);
      window.removeEventListener("focus", again);
      document.removeEventListener("visibilitychange", again);
    };
  }, [enabled, status, reconcile]);

  const resolve = useCallback(
    async (choice) => {
      const server = conflictRef.current;
      if (!server) return;
      if (choice === "cloud") return adopt(server);
      // keep this device: overwrite the cloud copy
      conflictRef.current = null;
      setConflict(null);
      busy.current = true;
      setStatus("syncing");
      try {
        await push(server.revision);
      } catch (e) {
        onApiError(e);
      } finally {
        busy.current = false;
      }
    },
    [adopt, push, onApiError]
  );

  const value = useMemo(() => ({ status: enabled ? status : "off", conflict, lastSynced, syncNow: reconcile, resolve }), [enabled, status, conflict, lastSynced, reconcile, resolve]);
  return <SyncCtx.Provider value={value}>{children}</SyncCtx.Provider>;
}

export const useSync = () => useContext(SyncCtx);
