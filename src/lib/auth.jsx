import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "./api";
import { GUEST_KEY } from "./store";

// status: "out" (show login) | "guest" (local only, no account) | "user" (signed in)
const KEY = "ascend:auth";
const AuthCtx = createContext(null);

function loadAuth() {
  try {
    const a = JSON.parse(localStorage.getItem(KEY) || "null");
    if (a?.guest) return { status: "guest" };
    if (a?.token && a?.email) return { status: "user", token: a.token, email: a.email, name: a.name || "" };
  } catch {
    /* corrupted value: fall through to logged out */
  }
  return { status: "out" };
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(loadAuth);

  useEffect(() => {
    try {
      if (auth.status === "out") localStorage.removeItem(KEY);
      else if (auth.status === "guest") localStorage.setItem(KEY, JSON.stringify({ guest: true }));
      else localStorage.setItem(KEY, JSON.stringify({ token: auth.token, email: auth.email, name: auth.name }));
    } catch {
      /* storage blocked */
    }
  }, [auth]);

  const signIn = (r) => setAuth({ status: "user", token: r.token, email: r.email, name: r.name || "" });

  const login = useCallback(async (email, password) => signIn(await authApi.login(email.trim(), password)), []);
  const signup = useCallback(async (name, email, password) => signIn(await authApi.register(name.trim(), email.trim(), password)), []);
  const continueAsGuest = useCallback(() => setAuth({ status: "guest" }), []);
  const logout = useCallback(() => setAuth({ status: "out" }), []);

  // Each account keeps its own data on this device, so two people (or two accounts) never mix.
  const storageKey = auth.status === "user" ? `${GUEST_KEY}:u:${auth.email.toLowerCase()}` : GUEST_KEY;

  const value = useMemo(() => ({ auth, storageKey, login, signup, continueAsGuest, logout }), [auth, storageKey, login, signup, continueAsGuest, logout]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
