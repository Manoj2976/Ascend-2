import { CloudOff, RefreshCw } from "lucide-react";
import { useSync } from "../lib/sync";

const count = (s) => (s?.tasks?.length || 0) + (s?.goals?.length || 0) + (s?.timetable?.length || 0) + Object.keys(s?.journal || {}).length;

// Shown only when this device and the cloud copy both changed, so nothing is overwritten silently.
export default function SyncBanner() {
  const { status, conflict, resolve } = useSync();
  if (status !== "conflict" || !conflict) return null;
  return (
    <div className="sync-banner glass" role="alertdialog" aria-label="Choose which data to keep">
      <RefreshCw size={20} />
      <div className="grow">
        <strong>Your cloud data and this device don't match</strong>
        <span>
          The cloud has {conflict.tasks.length} tasks and {conflict.timetable?.length || 0} timetable slots. Pick the copy to keep; the other one is replaced.
        </span>
      </div>
      <div className="row gap">
        <button className="btn btn-ghost btn-sm" onClick={() => resolve("cloud")}>
          Use cloud data
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => resolve("device")}>
          Keep this device
        </button>
      </div>
    </div>
  );
}

export const syncLabel = (status) =>
  ({ syncing: "Saving…", synced: "Synced to your account", offline: "Offline. Will retry", error: "Sync problem. Will retry", conflict: "Needs your choice", off: "Data stays on this device" })[status] || "";

export function SyncDot({ status }) {
  return status === "offline" || status === "error" ? <CloudOff size={12} /> : null;
}
