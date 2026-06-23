"use client";

import React, { useMemo } from "react";
import { usePlanStore } from "@/lib/state/planStore";
import { useGoalsStore } from "@/lib/state/goalsStore";

export default function PlanPage() {
  const { plan, generatePlan } = usePlanStore();
  const { goals } = useGoalsStore();

  const subtitle = useMemo(() => {
    const map: Record<string, string> = {
      weight_loss: "More conditioning + full-body strength.",
      muscle_gain: "Progressive overload + recovery.",
      endurance: "Aerobic base + intervals.",
      flexibility: "Mobility + light strength."
    };
    return map[goals.primary] ?? "";
  }, [goals.primary]);

  return (
    <div className="container">
      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontWeight: 900, fontSize: 20 }}>Weekly Plan</div>
          <div className="muted" style={{ marginTop: 6 }}>
            Goal: <strong>{goals.primary.replace("_", " ")}</strong> — {subtitle}
          </div>
        </div>
        <button className="btn btnPrimary" onClick={() => generatePlan(goals.primary)}>
          Generate / refresh
        </button>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="cardBody" style={{ display: "grid", gap: 10 }}>
          {plan.days.map((d) => (
            <div key={d.day} className="card" style={{ boxShadow: "none" }}>
              <div className="cardBody">
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 900 }}>{d.day}</div>
                  <span className="badge">{d.focus}</span>
                </div>
                <div className="muted" style={{ marginTop: 6 }}>
                  {d.session}
                </div>
              </div>
            </div>
          ))}
          <div className="muted" style={{ fontSize: 12 }}>
            This is an initial local plan. In the integrated system, plan generation will call backend APIs.
          </div>
        </div>
      </div>
    </div>
  );
}
