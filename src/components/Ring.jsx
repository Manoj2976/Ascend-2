import { useId } from "react";
import { motion } from "framer-motion";

export default function Ring({ pct = 0, size = 120, stroke = 12, from = "#4f6bff", to = "#8b5cf6", children }) {
  const id = useId();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.min(1, Math.max(0, pct));
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={from} />
            <stop offset="1" stopColor={to} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--ring-track)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - p) }}
          transition={{ type: "spring", stiffness: 60, damping: 18 }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="ring-center">{children}</div>
    </div>
  );
}

export function Bar({ pct = 0, color = "var(--accent)", height = 8 }) {
  const p = Math.min(1, Math.max(0, pct));
  return (
    <div className="bar" style={{ height }}>
      <motion.div
        className="bar-fill"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${p * 100}%` }}
        transition={{ type: "spring", stiffness: 70, damping: 18 }}
      />
    </div>
  );
}
