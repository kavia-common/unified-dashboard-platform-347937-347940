"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  createNotificationSchedule,
  listNotificationSchedules,
  type NotificationScheduleResponse
} from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function RemindersPage() {
  const { getIdToken } = useAuth();
  const [reminders, setReminders] = useState<NotificationScheduleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [time, setTime] = useState("08:00");
  const [message, setMessage] = useState("Time to train 💪");
  const [days, setDays] = useState<string[]>(["Mon", "Wed", "Fri"]);

  const cron = useMemo(() => {
    // Simple weekly CRON (UTC) based on selected weekdays.
    // Note: backend currently stores cron verbatim; timezone handling will be improved later.
    const [hh, mm] = time.split(":").map((x) => Number(x));
    const weekdayMap: Record<string, string> = {
      Sun: "0",
      Mon: "1",
      Tue: "2",
      Wed: "3",
      Thu: "4",
      Fri: "5",
      Sat: "6"
    };
    const dow = days.map((d) => weekdayMap[d]).filter(Boolean).join(",");
    // minute hour day-of-month month day-of-week
    return `${mm} ${hh} * * ${dow || "*"}`;
  }, [time, days]);

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const token = await getIdToken();
        const res = await listNotificationSchedules(token);
        if (mounted) setReminders(res);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : "Failed to load reminders");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [getIdToken]);

  return (
    <div className="container">
      <div style={{ fontWeight: 900, fontSize: 20 }}>Reminders</div>
      <div className="muted" style={{ marginTop: 6 }}>
        Create simple in-app reminders. Push notification delivery will be handled by backend scheduling later.
      </div>

      {error ? (
        <div className="card" style={{ marginTop: 12, border: "1px solid rgba(239,68,68,.35)" }}>
          <div className="cardBody" style={{ color: "#b91c1c" }}>
            {error}
          </div>
        </div>
      ) : null}

      <div className="card" style={{ marginTop: 12 }}>
        <div className="cardBody" style={{ display: "grid", gap: 12 }}>
          <div style={{ fontWeight: 850 }}>New reminder</div>

          <label>
            <div style={{ fontWeight: 650, fontSize: 12 }}>Time</div>
            <input className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </label>

          <label>
            <div style={{ fontWeight: 650, fontSize: 12 }}>Message</div>
            <input className="input" value={message} onChange={(e) => setMessage(e.target.value)} />
          </label>

          <div>
            <div style={{ fontWeight: 650, fontSize: 12, marginBottom: 8 }}>Days</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => {
                const active = days.includes(d);
                return (
                  <button
                    key={d}
                    className={`btn ${active ? "btnPrimary" : ""}`}
                    onClick={() => setDays(active ? days.filter((x) => x !== d) : [...days, d])}
                    type="button"
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            className="btn btnPrimary"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError(null);
              try {
                const token = await getIdToken();
                const created = await createNotificationSchedule(
                  {
                    notification_type: "workout_reminder",
                    channel: "in_app",
                    title: "Workout reminder",
                    body: message,
                    cron,
                    timezone: "UTC",
                    is_enabled: true,
                    meta: { days: days.slice().sort(), time }
                  },
                  token
                );
                setReminders([created, ...reminders]);
              } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to save reminder");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Saving..." : "Save reminder"}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="cardBody">
          <div style={{ fontWeight: 850 }}>Your reminders</div>
          <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
            {loading ? <div className="muted">Loading…</div> : null}
            {reminders.map((r) => (
              <div key={r.id} className="card" style={{ boxShadow: "none" }}>
                <div className="cardBody" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <span className="badge">{r.is_enabled ? "enabled" : "disabled"}</span>
                  <span className="badge">{r.channel}</span>
                  <div style={{ fontWeight: 650 }}>{r.body ?? r.title ?? "Reminder"}</div>
                  <div style={{ flex: 1 }} />
                  <span className="badge" title="This version does not include delete/disable endpoints yet.">
                    id: {r.id.slice(0, 8)}…
                  </span>
                </div>
              </div>
            ))}
            {!loading && reminders.length === 0 && <div className="muted">No reminders yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
