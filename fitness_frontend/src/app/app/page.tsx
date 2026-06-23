"use client";

import Link from "next/link";
import React, { useMemo } from "react";
import { useWorkoutStore } from "@/lib/state/workoutStore";
import { useProgressStore } from "@/lib/state/progressStore";

export default function DashboardPage() {
  const { workouts } = useWorkoutStore();
  const { metrics } = useProgressStore();

  const totalWorkouts = workouts.length;
  const lastWorkout = workouts[0]?.date ?? null;

  const weightLatest = useMemo(() => {
    const weights = metrics.filter((m) => m.type === "weight").sort((a, b) => (a.date < b.date ? 1 : -1));
    return weights[0]?.value ?? null;
  }, [metrics]);

  return (
    <div className="container">
      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontWeight: 900, fontSize: 20 }}>Overview</div>
          <div className="muted" style={{ marginTop: 6 }}>
            Your week at a glance.
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link className="btn btnPrimary" href="/app/log">
            Log workout
          </Link>
          <Link className="btn" href="/app/plan">
            View plan
          </Link>
          <Link className="btn" href="/app/progress">
            Add progress
          </Link>
        </div>
      </div>

      <div style={{ marginTop: 14 }} className="kpiRow">
        <div className="kpi">
          <div className="muted" style={{ fontSize: 12, fontWeight: 700 }}>
            Workouts logged
          </div>
          <div style={{ fontWeight: 900, fontSize: 22, marginTop: 6 }}>{totalWorkouts}</div>
          <div className="muted" style={{ marginTop: 6, fontSize: 12 }}>
            {lastWorkout ? `Last: ${lastWorkout}` : "No workouts logged yet"}
          </div>
        </div>
        <div className="kpi">
          <div className="muted" style={{ fontSize: 12, fontWeight: 700 }}>
            Latest weight
          </div>
          <div style={{ fontWeight: 900, fontSize: 22, marginTop: 6 }}>{weightLatest ?? "—"}</div>
          <div className="muted" style={{ marginTop: 6, fontSize: 12 }}>
            From progress log
          </div>
        </div>
        <div className="kpi">
          <div className="muted" style={{ fontSize: 12, fontWeight: 700 }}>
            This week focus
          </div>
          <div style={{ fontWeight: 900, fontSize: 18, marginTop: 6 }}>Consistency</div>
          <div className="muted" style={{ marginTop: 6, fontSize: 12 }}>
            Keep a simple streak going.
          </div>
        </div>
      </div>

      <div style={{ marginTop: 14 }} className="grid2">
        <div className="card">
          <div className="cardBody">
            <div style={{ fontWeight: 850 }}>Next up</div>
            <div className="muted" style={{ marginTop: 6 }}>
              Check your weekly plan and pick today’s session.
            </div>
            <div style={{ marginTop: 10 }}>
              <Link className="btn" href="/app/plan">
                Go to Weekly Plan
              </Link>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="cardBody">
            <div style={{ fontWeight: 850 }}>Track activity</div>
            <div className="muted" style={{ marginTop: 6 }}>
              Log steps or cardio minutes to build a baseline.
            </div>
            <div style={{ marginTop: 10 }}>
              <Link className="btn" href="/app/activity">
                Go to Activity
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
