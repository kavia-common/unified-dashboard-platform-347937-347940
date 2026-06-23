"use client";

import React, { useMemo, useState } from "react";
import { useActivityStore } from "@/lib/state/activityStore";

export default function ActivityPage() {
  const { entries, addEntry } = useActivityStore();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [steps, setSteps] = useState(5000);
  const [cardioMinutes, setCardioMinutes] = useState(0);

  const weekTotal = useMemo(() => entries.reduce((sum, e) => sum + e.steps, 0), [entries]);

  return (
    <div className="container">
      <div style={{ fontWeight: 900, fontSize: 20 }}>Activity</div>
      <div className="muted" style={{ marginTop: 6 }}>
        Track steps and cardio minutes (manual entry baseline).
      </div>

      <div style={{ marginTop: 12 }} className="kpiRow">
        <div className="kpi">
          <div className="muted" style={{ fontSize: 12, fontWeight: 700 }}>
            Logged days
          </div>
          <div style={{ fontWeight: 900, fontSize: 22, marginTop: 6 }}>{entries.length}</div>
        </div>
        <div className="kpi">
          <div className="muted" style={{ fontSize: 12, fontWeight: 700 }}>
            Steps total (all entries)
          </div>
          <div style={{ fontWeight: 900, fontSize: 22, marginTop: 6 }}>{weekTotal}</div>
        </div>
        <div className="kpi">
          <div className="muted" style={{ fontSize: 12, fontWeight: 700 }}>
            Cardio minutes (all entries)
          </div>
          <div style={{ fontWeight: 900, fontSize: 22, marginTop: 6 }}>
            {entries.reduce((s, e) => s + e.cardioMinutes, 0)}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="cardBody" style={{ display: "grid", gap: 12 }}>
          <div style={{ fontWeight: 850 }}>Add entry</div>
          <div className="grid2">
            <label>
              <div style={{ fontWeight: 650, fontSize: 12 }}>Date</div>
              <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <label>
              <div style={{ fontWeight: 650, fontSize: 12 }}>Steps</div>
              <input className="input" type="number" value={steps} min={0} onChange={(e) => setSteps(Number(e.target.value))} />
            </label>
          </div>

          <label>
            <div style={{ fontWeight: 650, fontSize: 12 }}>Cardio minutes</div>
            <input className="input" type="number" value={cardioMinutes} min={0} onChange={(e) => setCardioMinutes(Number(e.target.value))} />
          </label>

          <button className="btn btnPrimary" onClick={() => addEntry({ date, steps, cardioMinutes })}>
            Save activity
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="cardBody" style={{ display: "grid", gap: 10 }}>
          <div style={{ fontWeight: 850 }}>History</div>
          {entries.map((e) => (
            <div key={`${e.date}-${e.steps}`} className="card" style={{ boxShadow: "none" }}>
              <div className="cardBody" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ fontWeight: 850 }}>{e.date}</div>
                <span className="badge">{e.steps} steps</span>
                <span className="badge">{e.cardioMinutes} min cardio</span>
              </div>
            </div>
          ))}
          {entries.length === 0 && <div className="muted">No activity logged yet.</div>}
        </div>
      </div>
    </div>
  );
}
