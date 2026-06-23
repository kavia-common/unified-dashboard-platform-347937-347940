"use client";

import React, { useState } from "react";
import { useRemindersStore } from "@/lib/state/remindersStore";

export default function RemindersPage() {
  const { reminders, addReminder, removeReminder } = useRemindersStore();
  const [time, setTime] = useState("08:00");
  const [message, setMessage] = useState("Time to train 💪");
  const [days, setDays] = useState<string[]>(["Mon", "Wed", "Fri"]);

  return (
    <div className="container">
      <div style={{ fontWeight: 900, fontSize: 20 }}>Reminders</div>
      <div className="muted" style={{ marginTop: 6 }}>
        Create simple in-app reminders. Push notification delivery will be handled by backend scheduling later.
      </div>

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
            onClick={() => addReminder({ time, message, days: days.slice().sort() })}
          >
            Save reminder
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="cardBody">
          <div style={{ fontWeight: 850 }}>Your reminders</div>
          <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
            {reminders.map((r) => (
              <div key={r.id} className="card" style={{ boxShadow: "none" }}>
                <div className="cardBody" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <span className="badge">{r.time}</span>
                  <span className="badge">{r.days.join(", ")}</span>
                  <div style={{ fontWeight: 650 }}>{r.message}</div>
                  <div style={{ flex: 1 }} />
                  <button className="btn btnDanger" onClick={() => removeReminder(r.id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {reminders.length === 0 && <div className="muted">No reminders yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
