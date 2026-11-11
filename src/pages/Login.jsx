import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import AuthLayout, { PasswordInput } from "../components/AuthLayout";
import { useAuth } from "../lib/auth";

export default function Login() {
  const { login, continueAsGuest } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState("");

  // free hosting can take a while to wake up: tell people instead of leaving a silent spinner
  useEffect(() => {
    if (!busy) {
      setSlow(false);
      return undefined;
    }
    const id = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(id);
  }, [busy]);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.status === 401 ? "Wrong email or password." : err.message);
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue your placement journey."
      footer={
        <>
          <p>
            New here? <Link to="/signup">Create an account</Link>
          </p>
          <button type="button" className="link-btn" onClick={continueAsGuest}>
            Continue without an account
          </button>
          <span className="small muted">Your data then stays on this device only.</span>
        </>
      }
    >
      <form className="form" onSubmit={submit} noValidate>
        <label className="field">
          <span className="field-label">Email</span>
          <input className="input" type="email" autoComplete="email" autoFocus required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </label>
        <label className="field">
          <span className="field-label">Password</span>
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} show={show} onToggle={() => setShow((s) => !s)} autoComplete="current-password" placeholder="Your password" />
        </label>

        <div className="auth-msg" role="alert" aria-live="assertive">
          {error}
        </div>

        <button className="btn btn-primary btn-block" disabled={busy || !email.trim() || !password}>
          {busy ? <Loader2 size={17} className="spin" /> : null}
          {busy ? "Signing in…" : "Sign in"}
        </button>
        {slow && <p className="small muted center">Waking the server up. The first sign-in can take up to a minute.</p>}
      </form>
    </AuthLayout>
  );
}
