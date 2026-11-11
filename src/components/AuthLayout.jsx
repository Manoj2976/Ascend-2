import { motion } from "framer-motion";
import { Background } from "./Layout";

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-wrap">
      <Background />
      <motion.main
        className="auth-card glass"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
      >
        <div className="auth-brand">
          <img src="/icon.svg" alt="" width="44" height="44" />
          <span>Ascend</span>
        </div>
        <h1>{title}</h1>
        <p className="muted auth-sub">{subtitle}</p>
        {children}
        {footer && <div className="auth-foot">{footer}</div>}
      </motion.main>
    </div>
  );
}

export function PasswordInput({ value, onChange, show, onToggle, autoComplete, id, placeholder }) {
  return (
    <div className="pw">
      <input
        id={id}
        className="input"
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required
      />
      <button type="button" className="pw-toggle" onClick={onToggle} aria-label={show ? "Hide password" : "Show password"}>
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}
