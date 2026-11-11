import { ArrowLeft, ArrowRight, Briefcase, ExternalLink, Plus } from "lucide-react";
import PageHeader, { Empty, Page } from "../components/PageHeader";
import { useStore } from "../lib/store";
import { useUI } from "../lib/ui";
import { APP_STATUSES, STATUS_COLORS } from "../lib/constants";
import { fmtDate } from "../lib/dates";

export default function Placement() {
  const { state, updateApp } = useStore();
  const { openApp } = useUI();
  const apps = state.applications;

  const move = (a, dir) => {
    const i = APP_STATUSES.indexOf(a.status) + dir;
    if (i >= 0 && i < APP_STATUSES.length) updateApp(a.id, { status: APP_STATUSES[i] });
  };

  const count = (s) => apps.filter((a) => a.status === s).length;
  const active = apps.filter((a) => !["Rejected", "Offer"].includes(a.status)).length;

  return (
    <Page>
      <PageHeader
        title="Placement tracker"
        subtitle={`${apps.length} companies · ${active} in progress · ${count("Offer")} offer${count("Offer") === 1 ? "" : "s"}`}
        actions={
          <button className="btn btn-primary" onClick={() => openApp()}>
            <Plus size={16} /> Add company
          </button>
        }
      />
      {apps.length === 0 ? (
        <div className="card">
          <Empty icon={<Briefcase size={24} />} title="Track every application" text="Add companies you're targeting and move them through Applied → Test → Interview → Offer." action={<button className="btn btn-primary btn-sm" onClick={() => openApp()}>Add your first company</button>} />
        </div>
      ) : (
        <div className="kanban">
          {APP_STATUSES.map((s) => (
            <div key={s} className="kcol">
              <div className="kcol-head">
                <i style={{ background: STATUS_COLORS[s] }} />
                <strong>{s}</strong>
                <span className="muted small">{count(s)}</span>
              </div>
              <div className="kcol-body">
                {apps
                  .filter((a) => a.status === s)
                  .map((a) => (
                    <div key={a.id} className="kcard" onClick={() => openApp(a)}>
                      <strong>{a.company}</strong>
                      {a.role && <span className="muted small">{a.role}</span>}
                      {a.notes && <p className="small knote">{a.notes}</p>}
                      <div className="row between kfoot">
                        <span className="muted tiny">{fmtDate(a.date, { month: "short", day: "numeric" })}</span>
                        <div className="row gap-sm" onClick={(e) => e.stopPropagation()}>
                          {a.link && (
                            <a className="icon-btn sm" href={a.link} target="_blank" rel="noreferrer" aria-label="Open link">
                              <ExternalLink size={14} />
                            </a>
                          )}
                          <button className="icon-btn sm" disabled={APP_STATUSES.indexOf(s) === 0} onClick={() => move(a, -1)} aria-label="Move back">
                            <ArrowLeft size={14} />
                          </button>
                          <button className="icon-btn sm" disabled={APP_STATUSES.indexOf(s) === APP_STATUSES.length - 1} onClick={() => move(a, 1)} aria-label="Move forward">
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}
