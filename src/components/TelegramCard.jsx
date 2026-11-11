import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, Send, Unlink } from "lucide-react";
import { notifyApi } from "../lib/api";
import { useAuth } from "../lib/auth";

// Reminders on your phone even when the app is closed, delivered by a Telegram bot owned by the backend.
export default function TelegramCard() {
  const { auth, logout } = useAuth();
  const token = auth.token;
  const [linked, setLinked] = useState(null); // null = checking
  const [link, setLink] = useState(null); // { deepLink, code, botUsername, expiresInMinutes }
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const poll = useRef(null);

  const fail = useCallback(
    (e) => {
      if (e.status === 401) return logout();
      setMsg(e.status === 503 ? "Telegram isn't set up on the server yet. Add the bot token to the backend settings first." : e.message);
    },
    [logout]
  );

  const check = useCallback(async () => {
    try {
      const s = await notifyApi.settings(token);
      setLinked(!!s.telegramLinked);
      return !!s.telegramLinked;
    } catch (e) {
      setLinked(false);
      fail(e);
      return false;
    }
  }, [token, fail]);

  useEffect(() => {
    check();
    return () => clearInterval(poll.current);
  }, [check]);

  const connect = async () => {
    setBusy(true);
    setMsg("");
    try {
      const l = await notifyApi.telegramLinkCode(token);
      setLink(l);
      clearInterval(poll.current);
      const until = Date.now() + l.expiresInMinutes * 60000;
      poll.current = setInterval(async () => {
        if (Date.now() > until) {
          clearInterval(poll.current);
          setLink(null);
          return setMsg("That link expired. Tap Connect to get a new one.");
        }
        if (await check()) {
          clearInterval(poll.current);
          setLink(null);
          setMsg("Connected. You'll get reminders in Telegram.");
        }
      }, 3000);
    } catch (e) {
      fail(e);
    }
    setBusy(false);
  };

  const unlink = async () => {
    try {
      await notifyApi.telegramUnlink(token);
      setLinked(false);
      setMsg("Disconnected.");
    } catch (e) {
      fail(e);
    }
  };

  const test = async () => {
    setBusy(true);
    setMsg("");
    try {
      const r = await notifyApi.test(token);
      setMsg(r.telegramSent ? "Sent. Check Telegram." : "Nothing was sent. Is Telegram connected?");
    } catch (e) {
      fail(e);
    }
    setBusy(false);
  };

  return (
    <section className="card set">
      <h3>
        <Send size={17} /> Telegram reminders
      </h3>
      <div className="set-row">
        <div>
          <strong>{linked ? "Connected" : "Not connected"}</strong>
          <span className="muted small">{msg || (linked ? "Reminders reach your phone even when Ascend is closed." : "Get reminders on your phone with a Done button.")}</span>
        </div>
        <div className="row gap">
          {linked ? (
            <>
              <button className="btn btn-ghost btn-sm" onClick={test} disabled={busy}>
                Send test
              </button>
              <button className="btn btn-ghost btn-sm" onClick={unlink}>
                <Unlink size={15} /> Disconnect
              </button>
            </>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={connect} disabled={busy || linked === null}>
              Connect
            </button>
          )}
        </div>
      </div>
      {link && (
        <div className="note">
          <Send size={16} />
          <p>
            {link.deepLink ? (
              <>
                <a href={link.deepLink} target="_blank" rel="noreferrer">
                  Open Telegram <ExternalLink size={12} />
                </a>{" "}
                and press <strong>Start</strong>. This page connects by itself.
              </>
            ) : (
              <>
                Open your bot in Telegram and send <code>/start {link.code}</code>.
              </>
            )}{" "}
            The link works for {link.expiresInMinutes} minutes.
          </p>
        </div>
      )}
      <div className="note">
        <Send size={16} />
        <p>Tick a task with the <strong>Done</strong> button in Telegram and it is marked done here the next time you open the app. If Telegram is on, you can turn off "Notifications" above so you don't get each reminder twice.</p>
      </div>
    </section>
  );
}
