import { motion } from "framer-motion";

export default function Check({ checked, onChange, color = "var(--green)" }) {
  return (
    <motion.button
      type="button"
      className={`check ${checked ? "on" : ""}`}
      style={{ "--c": color }}
      aria-pressed={checked}
      aria-label={checked ? "Mark as not done" : "Mark as done"}
      whileTap={{ scale: 0.82 }}
      animate={{ scale: checked ? [1, 1.18, 1] : 1 }}
      transition={{ duration: 0.28 }}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <motion.path
          d="M5 12.5l4.5 4.5L19 7.5"
          fill="none"
          stroke="#fff"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={{ duration: 0.22 }}
        />
      </svg>
    </motion.button>
  );
}
