# Ascend — Placement Journey (Frontend)

React + Vite frontend with an iOS/macOS glass theme.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

Open the app and go to **Settings → Load sample data** to explore, or just start adding tasks.

## What's included

| Page | What it does |
| --- | --- |
| Today | Progress ring, quick add ("Bath 9pm daily"), today's tasks, daily targets, focus timer |
| Tasks | Upcoming / Today / Overdue / Completed, category filter, search |
| Calendar | Month grid with category dots and completion bars, day detail |
| Time Table | Weekly classes, labs, study blocks. Day and Week views, "Up next" card, overlap warning, add one slot to several days at once |
| Targets | Final → Monthly → Daily targets. Ticking a linked task moves its monthly target |
| Journal | Daily mood, what I did, what I learned, plan for tomorrow (auto-saved) |
| Insights | Streaks, 26-week heatmap, weekly bars, category split, weekly review |
| Diet | Log meals with calories and macros, water glasses, 7-day chart, editable daily targets, weekly meal plan with "Log it" |
| Placement | Kanban of companies: Wishlist → Applied → Online Test → Interview → Offer |
| Login / Sign up | Account pages that talk to the Spring Boot `/api/auth` endpoints, plus "Continue without an account" |
| Settings | Account, theme, reminder window/interval, notification test, export/import backup |

## Reminders (your "Bath at 9:00 PM" requirement)

- At the task's time: first notification fires.
- Then repeats every N minutes (default 5) until you tick the task or the window (default 30 min) ends.
- A sticky in-app banner with a **Done** button stays on screen while a task is ringing.
- Configure window and interval in **Settings**.

**Limits of a frontend-only reminder:** it fires while the app is open in a browser tab or an installed PWA.
For reminders with the app *closed*, the Spring Boot backend must send Web Push (VAPID) to the browser.
`public/sw.js` already contains the `push` and `notificationclick` handlers for that.

iPhone: Web Push works only after **Share → Add to Home Screen** (iOS 16.4+).

## Accounts

Set the backend address (see `.env.example`):

```
VITE_API_URL=https://your-backend.onrender.com
```

- **Sign up / Log in** call `POST /api/auth/register` and `POST /api/auth/login` and keep the returned JWT.
- The first request to a sleeping Render free service can take up to a minute; the pages say so.
- **Guest mode** works with no backend at all.
- Each account has its own data on the device (`ascend:v1:u:<email>`); guest data is `ascend:v1`. Logging out does not delete anything.

## Data and cloud sync

The working copy of your data is in `localStorage`, so the app is fast and works offline. When you are logged in it also syncs with the backend (`GET/PUT /api/state`):

- Every change is saved to your account about 2 seconds later. The sidebar shows "Saving…", "Synced to your account" or "Offline. Will retry".
- On login, and whenever you come back to the tab, newer data from another device is pulled in.
- A revision number prevents an old device from overwriting newer data. If this device and the cloud both changed, a banner lets you pick **Use cloud data** or **Keep this device**.
- If the server rejects your login token, you are sent to the login page. Your local data is kept.
- First login with an empty cloud account uploads what is already on this device. Guest mode never syncs.
- Settings → Account → **Sync now** forces a check. Use Settings → Export now and then as a backup.

Item ids are now UUIDs (older short ids are converted automatically the first time the app loads them).

## Deploy (Vercel)

1. Push this folder to GitHub.
2. Import the repo in Vercel (framework: Vite, build `npm run build`, output `dist`).
3. `vercel.json` already handles SPA routing and keeps the service worker uncached.

## Structure

```
src/
  lib/          dates, tasks, goals, stats, reminders, store, api, auth, timetable, diet
  components/   Layout, TaskItem, modals, ReminderEngine, ReminderBanner, FocusTimer, Heatmap, Ring
  pages/        Dashboard, Tasks, Calendar, Targets, Journal, Insights, Timetable, Diet, Placement, Settings, Login, Signup, More
  index.css     Glass theme (light + dark)
public/         manifest, service worker, icon
```
