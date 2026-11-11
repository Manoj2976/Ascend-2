import { useMemo } from "react";
import { fmtDate, todayKey } from "../lib/dates";
import { heatmap } from "../lib/stats";

const CELL = 14;
const GAP = 4;

export default function Heatmap({ tasks, weeks = 26 }) {
  const { columns, months } = useMemo(() => heatmap(tasks, todayKey(), weeks), [tasks, weeks]);
  const width = weeks * (CELL + GAP);
  const height = 7 * (CELL + GAP) + 20;

  return (
    <div className="heat-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="heat" role="img" aria-label="Task completion heatmap">
        {months.map((m) => (
          <text key={m.col} x={m.col * (CELL + GAP)} y={10} className="heat-label">
            {m.label}
          </text>
        ))}
        {columns.map((col, w) =>
          col.map((c, d) =>
            c.future ? null : (
              <rect
                key={c.key}
                x={w * (CELL + GAP)}
                y={20 + d * (CELL + GAP)}
                width={CELL}
                height={CELL}
                rx={4}
                className={`heat-cell heat-${c.level}`}
              >
                <title>{`${fmtDate(c.key, { weekday: "short", month: "short", day: "numeric" })}: ${c.done}/${c.total} done`}</title>
              </rect>
            )
          )
        )}
      </svg>
      <div className="heat-legend">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <svg key={l} width="14" height="14">
            <rect width="14" height="14" rx="4" className={`heat-cell heat-${l}`} />
          </svg>
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
