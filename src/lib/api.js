// Tiny fetch wrapper for the Ascend backend (Spring Boot).
// Set VITE_API_URL in .env (local) or in Vercel's environment variables (production).

export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(status, message, fields = {}) {
    super(message);
    this.status = status;
    this.fields = fields; // { email: "must be a well-formed email address", ... }
  }
}

// Render's free tier can take about a minute to wake up, so be patient.
const TIMEOUT_MS = 75000;

export async function request(path, { method = "GET", body, token } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: ctrl.signal,
    });
  } catch (e) {
    throw new ApiError(0, e.name === "AbortError" ? "The server took too long to answer. Try again in a moment." : "Can't reach the server. Check your connection, or that the backend is running.");
  } finally {
    clearTimeout(timer);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty or non-JSON body */
  }
  if (!res.ok) {
    throw new ApiError(res.status, data?.error || `Request failed (${res.status})`, data?.fields || {});
  }
  return data;
}

export const authApi = {
  login: (email, password) => request("/api/auth/login", { method: "POST", body: { email, password } }),
  register: (name, email, password) => request("/api/auth/register", { method: "POST", body: { name, email, password } }),
};

export const stateApi = {
  get: (token) => request("/api/state", { token }),
  put: (token, state) => request("/api/state", { method: "PUT", token, body: state }),
};

export const notifyApi = {
  settings: (token) => request("/api/settings", { token }),
  telegramLinkCode: (token) => request("/api/telegram/link-code", { method: "POST", token }),
  telegramUnlink: (token) => request("/api/telegram/link", { method: "DELETE", token }),
  test: (token) => request("/api/notifications/test", { method: "POST", token }),
};
