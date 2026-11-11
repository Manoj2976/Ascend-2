// Notification helpers. The repeating-reminder *schedule* lives in components/ReminderEngine.jsx.
const KEY = "ascend:notified";

export const readNotified = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
};

export const writeNotified = (obj) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(obj));
  } catch {
    /* storage full or blocked */
  }
};

export const notificationsSupported = () => typeof Notification !== "undefined";

export async function ensurePermission() {
  if (!notificationsSupported()) return "unsupported";
  if (Notification.permission === "default") {
    try {
      return await Notification.requestPermission();
    } catch {
      return Notification.permission;
    }
  }
  return Notification.permission;
}

// Prefer the service worker (required on Android / installed PWAs); fall back to the Notification API.
export async function showNotification(title, body, tag) {
  if (!notificationsSupported() || Notification.permission !== "granted") return false;
  const options = {
    body,
    tag,
    renotify: true,
    requireInteraction: true,
    icon: "/icon.svg",
    badge: "/icon.svg",
    vibrate: [200, 100, 200],
    data: { url: "/" },
  };
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) {
      await reg.showNotification(title, options);
      return true;
    }
  } catch {
    /* fall through */
  }
  try {
    new Notification(title, options);
    return true;
  } catch {
    return false;
  }
}

export function beep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.55);
    setTimeout(() => ctx.close(), 900);
  } catch {
    /* audio blocked until the user interacts with the page */
  }
}
