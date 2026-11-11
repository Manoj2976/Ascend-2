import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import AuthLayout, { PasswordInput } from "../components/AuthLayout";
import { useAuth } from "../lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A short, honest hint rather than a fake "strength meter"
const hint = (p) => {
  if (!p) return "At least 8 characters.";
  if (p.length < 8) return `${8 - p.length} more character${8 - p.length === 1 ? "" : "s"} needed.`;
  if (p.length < 12) return "Good. A longer passphrase is even better.";
  return "Strong length.";
};

export default function Signup() {
  const { signup, continueAsGuest } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState({});

  useEffect(() => {
    if (!busy) {
      setSlow(false);
      return undefined;
    }
    const id = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(id);
  }, [busy]);

  const validate = () => {
    const f = {};
    if (!EMAIL_RE.test(email.trim())) f.email = "Enter a valid email address.";
    if (password.length < 8) f.password = "Use at least 8 characters.";
    if (confirm !== password) f.confirm = "The passwords don't match.";
    return f;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const f = validate();
    setFields(f);
    setError("");
    if (Object.keys(f).length) return;
    setBusy(true);
    try {
      await signup(name, email, password);
    } catch (err) {
      if (err.fields && Object.keys(err.fields).length) setFields(err.fields);
      setError(err.status === 409 ? "That email is already registered. Try signing in." : err.status === 403 ? "Sign-ups are closed on this server." : err.message);
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Track targets, tasks and your placement journey, every day."
      footer={
        <>
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
          <button type="button" className="link-btn" onClick={continueAsGuest}>
            Continue without an account
          </button>
        </>
      }
    >
      <form className="form" onSubmit={submit} noValidate>
        <label className="field">
          <span className="field-label">Name</span>
          <input className="input" autoComplete="name" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="What should we call you?" maxLength={80} />
        </label>
        <label className="field">
          <span className="field-label">Email</span>
          <input className={`input ${fields.email ? "bad" : ""}`} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          {fields.email && <span className="field-err">{fields.email}</span>}
        </label>
        <label className="field">
          <span className="field-label">Password</span>
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} show={show} onToggle={() => setShow((s) => !s)} autoComplete="new-password" placeholder="At least 8 characters" />
          {fields.password ? <span className="field-err">{fields.password}</span> : <span className="field-hint">{hint(password)}</span>}
        </label>
        <label className="field">
          <span className="field-label">Confirm password</span>
          <input className={`input ${fields.confirm ? "bad" : ""}`} type={show ? "text" : "password"} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat your password" />
          {fields.confirm && <span className="field-err">{fields.confirm}</span>}
        </label>

        <div className="auth-msg" role="alert" aria-live="assertive">
          {error}
        </div>

        <button className="btn btn-primary btn-block" disabled={busy || !email.trim() || !password}>
          {busy ? <Loader2 size={17} className="spin" /> : null}
          {busy ? "Creating account…" : "Create account"}
        </button>
        {slow && <p className="small muted center">Waking the server up. The first request can take up to a minute.</p>}
      </form>
    </AuthLayout>
  );
}
