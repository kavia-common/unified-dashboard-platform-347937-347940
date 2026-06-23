"use client";

import React, { useState } from "react";
import { useGoalsStore } from "@/lib/state/goalsStore";

export default function GoalsPage() {
  const { goals, setGoals } = useGoalsStore();
  const [primary, setPrimary] = useState(goals.primary);
  const [notes, setNotes] = useState(goals.notes ?? "");

  return (
    <div className="container">
      <div style={{ fontWeight: 900, fontSize: 20 }}>Goals</div>
      <div className="muted" style={{ marginTop: 6 }}>
        Choose your primary training goal. This influences weekly plan suggestions.
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="cardBody" style={{ display: "grid", gap: 12 }}>
          <label>
            <div style={{ fontWeight: 650, fontSize: 12 }}>Primary goal</div>
            <select className="input" value={primary} onChange={(e) => setPrimary(e.target.value as any)}>
              <option value="weight_loss">Weight loss</option>
              <option value="muscle_gain">Muscle gain</option>
              <option value="endurance">Endurance</option>
              <option value="flexibility">Flexibility</option>
            </select>
          </label>

          <label>
            <div style={{ fontWeight: 650, fontSize: 12 }}>Notes (optional)</div>
            <textarea className="input" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g., train 4x/week, prefer lower body focus" />
          </label>

          <button className="btn btnPrimary" onClick={() => setGoals({ primary, notes })}>
            Save goals
          </button>

          <div className="muted" style={{ fontSize: 12 }}>
            Stored locally for now; backend sync will be enabled once goals endpoints are available.
          </div>
        </div>
      </div>
    </div>
  );
}
