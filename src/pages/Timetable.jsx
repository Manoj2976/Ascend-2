import { useEffect, useMemo, useState } from "react";
import { Clock, MapPin, Plus } from "lucide-react";
import PageHeader, { Empty, Page } from "../components/PageHeader";
import { useStore } from "../lib/store";
import { useNow, useUI } from "../lib/ui";
import {
  DAY_LONG,
  DAY_ORDER,
  DAY_SHORT,
  entriesOn,
  fmtDur,
  duration,
  fromMin,
  gridRange,
  kindColor,
  layoutDay,
  nowNext,
  toMin,
  weekMinutesByKind,
} from "../lib/timetable";
import { fmtTime } from "../lib/dates";

const HOUR_PX = 60; // one pixel per minute keeps the maths trivial
const MIN_BLOCK = 24;

function useIsNarrow() {
  const q = "(max-width: 920px)";
  const [narrow, setNarrow] = useState(() => (typeof window !== "undefined" ? window.matchMedia(q).matches : false));
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setNarrow(mq.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return narrow;
}

function NowNextCard({ tt, now }) {
  const { current, next, minutesLeft, minutesUntil } = nowNext(tt, now);
  const { openTT } = useUI();
  return (
    <section className="card now-card">
      {current ? (
        <button className="now-row" onClick={() => openTT(current)}>
          <span className="now-dot" style={{ background: kindColor(current.kind) }} />
          <div className="grow">
            <span className="eyebrow">Happening now</span>
            <strong>{current.title}</strong>
            <span className="muted small">
              {fmtTime(current.start)} – {fmtTime(current.end)}
              {current.place ? ` · ${current.place}` : ""}
            </span>
          </div>
          <span className="pill">{fmtDur(minutesLeft)} left</span>
        </button>
      ) : next ? (
        <button className="now-row" onClick={() => openTT(next)}>
          <span className="now-dot idle" style={{ background: kindColor(next.kind) }} />
          <div className="grow">
            <span className="eyebrow">Up next</span>
            <strong>{next.title}</strong>
            <span className="muted small">
              {fmtTime(next.start)} – {fmtTime(next.end)}
              {next.place ? ` · ${next.place}` : ""}
            </span>
          </div>
          <span className="pill">in {fmtDur(minutesUntil)}</span>
        </button>
      ) : (
        <div className="now-row static">
          <span className="now-dot idle" />
          <div className="grow">
            <span className="eyebrow">Today</span>
            <strong>{entriesOn(tt, now.getDay()).length ? "That's everything for today" : "Nothing scheduled today"}</strong>
          </div>
        </div>
      )}
    </section>
  );
}

function WeekGrid({ tt, now, onAdd, onEdit }) {
  const range = useMemo(() => gridRange(tt), [tt]);
  const hours = range.end - range.start;
  const height = hours * HOUR_PX;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const today = now.getDay();

  const clickColumn = (day) => (e) => {
    if (e.target !== e.currentTarget) return;
    const y = e.clientY - e.currentTarget.getBoundingClientRect().top;
    const mins = range.start * 60 + Math.floor(y / 30) * 30;
    onAdd(day, fromMin(Math.min(mins, 23 * 60)));
  };

  return (
    <div className="tt-scroll">
      <div className="tt-grid">
        <div className="tt-corner" />
        {DAY_ORDER.map((d) => (
          <div key={d} className={`tt-dayhead ${d === today ? "today" : ""}`}>
            {DAY_SHORT[d]}
          </div>
        ))}

        <div className="tt-times" style={{ height }}>
          {Array.from({ length: hours }, (_, i) => (
            <span key={i} style={{ top: i * HOUR_PX }}>
              {fmtTime(fromMin((range.start + i) * 60))}
            </span>
          ))}
        </div>

        {DAY_ORDER.map((d) => (
          <div
            key={d}
            className={`tt-col ${d === today ? "today" : ""}`}
            style={{ height, backgroundSize: `100% ${HOUR_PX}px` }}
            onClick={clickColumn(d)}
            role="presentation"
          >
            {layoutDay(entriesOn(tt, d)).map(({ entry: e, lane, lanes }) => {
              const top = toMin(e.start) - range.start * 60;
              const h = Math.max(MIN_BLOCK, duration(e));
              const color = kindColor(e.kind);
              return (
                <button
                  key={e.id}
                  className="tt-block"
                  style={{ top, height: h - 2, left: `calc(${(lane / lanes) * 100}% + 2px)`, width: `calc(${100 / lanes}% - 4px)`, "--c": color }}
                  onClick={() => onEdit(e)}
                  title={`${e.title}\n${e.start}–${e.end}${e.place ? `\n${e.place}` : ""}`}
                >
                  <strong>{e.title}</strong>
                  {h >= 44 && (
                    <span>
                      {fmtTime(e.start)}
                      {e.place ? ` · ${e.place}` : ""}
                    </span>
                  )}
                </button>
              );
            })}
            {d === today && nowMin >= range.start * 60 && nowMin <= range.end * 60 && <i className="tt-now" style={{ top: nowMin - range.start * 60 }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function DayList({ tt, day, now, onAdd, onEdit }) {
  const list = entriesOn(tt, day);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const isToday = day === now.getDay();
  if (!list.length) {
    return <Empty icon={<Clock size={22} />} title={`Nothing on ${DAY_LONG[day]}`} text="A free day. Add a class, a study block or a break." action={<button className="btn btn-primary btn-sm" onClick={() => onAdd(day)}>Add entry</button>} />;
  }
  return (
    <div className="list">
      {list.map((e) => {
        const live = isToday && toMin(e.start) <= nowMin && nowMin < toMin(e.end);
        const past = isToday && toMin(e.end) <= nowMin;
        return (
          <button key={e.id} className={`tt-row ${live ? "live" : ""} ${past ? "past" : ""}`} style={{ "--c": kindColor(e.kind) }} onClick={() => onEdit(e)}>
            <div className="tt-time">
              <strong>{fmtTime(e.start)}</strong>
              <span>{fmtTime(e.end)}</span>
            </div>
            <i className="tt-bar" />
            <div className="grow">
              <div className="tt-title">{e.title}</div>
              <div className="task-meta">
                <span className="chip chip-cat">
                  <i style={{ background: kindColor(e.kind) }} />
                  {e.kind}
                </span>
                <span className="chip">{fmtDur(duration(e))}</span>
                {e.place && (
                  <span className="chip">
                    <MapPin size={12} />
                    {e.place}
                  </span>
                )}
              </div>
            </div>
            {live && <span className="badge badge-alert">Now</span>}
          </button>
        );
      })}
    </div>
  );
}

export default function Timetable() {
  const { state } = useStore();
  const { openTT } = useUI();
  const now = useNow();
  const narrow = useIsNarrow();
  const tt = state.timetable;

  const [view, setView] = useState(narrow ? "day" : "week");
  const [day, setDay] = useState(now.getDay());

  // follow the screen size until the person picks a view themselves
  const [picked, setPicked] = useState(false);
  useEffect(() => {
    if (!picked) setView(narrow ? "day" : "week");
  }, [narrow, picked]);

  const onAdd = (d = day, start) => {
    const defaults = { day: d };
    if (start) Object.assign(defaults, { start, end: fromMin(Math.min(toMin(start) + 60, 24 * 60 - 1)) });
    openTT(null, defaults);
  };
  const stats = weekMinutesByKind(tt);

  return (
    <Page>
      <PageHeader
        title="Time Table"
        subtitle="Your weekly classes, labs and study blocks"
        actions={
          <>
            <div className="seg seg-sm" role="tablist" aria-label="View">
              {["day", "week"].map((v) => (
                <button
                  key={v}
                  role="tab"
                  aria-selected={view === v}
                  className={view === v ? "on" : ""}
                  onClick={() => {
                    setPicked(true);
                    setView(v);
                  }}
                >
                  {v === "day" ? "Day" : "Week"}
                </button>
              ))}
            </div>
            <button className="btn btn-primary" onClick={() => onAdd(day)}>
              <Plus size={16} /> Add
            </button>
          </>
        }
      />

      <NowNextCard tt={tt} now={now} />

      {stats.length > 0 && (
        <div className="chips tt-stats" aria-label="Hours per week">
          {stats.map((s) => (
            <span key={s.id} className="chip chip-cat">
              <i style={{ background: kindColor(s.id) }} />
              {s.id} {fmtDur(s.minutes)}/wk
            </span>
          ))}
        </div>
      )}

      {tt.length === 0 ? (
        <div className="card">
          <Empty
            icon={<Clock size={24} />}
            title="Build your weekly timetable"
            text="Add your classes and labs first, then fill the gaps with study blocks. Tip: in the week view, tap an empty slot to add an entry there."
            action={
              <button className="btn btn-primary btn-sm" onClick={() => onAdd()}>
                Add first entry
              </button>
            }
          />
        </div>
      ) : view === "week" ? (
        <section className="card tt-card">
          <WeekGrid tt={tt} now={now} onAdd={onAdd} onEdit={(e) => openTT(e)} />
        </section>
      ) : (
        <section className="card">
          <div className="day-tabs" role="tablist" aria-label="Day">
            {DAY_ORDER.map((d) => (
              <button key={d} role="tab" aria-selected={day === d} className={`${day === d ? "on" : ""} ${d === now.getDay() ? "today" : ""}`} onClick={() => setDay(d)}>
                {DAY_SHORT[d]}
              </button>
            ))}
          </div>
          <h4 className="day-label">{DAY_LONG[day]}</h4>
          <DayList tt={tt} day={day} now={now} onAdd={onAdd} onEdit={(e) => openTT(e)} />
        </section>
      )}
    </Page>
  );
}
