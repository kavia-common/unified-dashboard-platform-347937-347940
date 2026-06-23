"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useWorkoutStore, type WorkoutExerciseDraft } from "@/lib/state/workoutStore";

export default function LogWorkoutPage() {
  const { addWorkout } = useWorkoutStore();
  const workoutLogId = useMemo(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("workout_log_id");
  }, []);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState("Workout");
  const [exercises, setExercises] = useState<WorkoutExerciseDraft[]>([
    { name: "Squat", sets: 3, reps: 5, rpe: 7 },
    { name: "Bench Press", sets: 3, reps: 8, rpe: 7 }
  ]);

  useEffect(() => {
    // Placeholder: once a full "workout log editor" is implemented, this page should:
    // 1) fetch workout log details by id
    // 2) prefill the form with backend exercises/sets
    // For now we just adjust title so the end-to-end flow is visible.
    if (workoutLogId) {
      setTitle(`Planned session log`);
    }
  }, [workoutLogId]);

  return (
    <div className="container">
      <div style={{ fontWeight: 900, fontSize: 20 }}>Log Workout</div>
      <div className="muted" style={{ marginTop: 6 }}>
        Record exercises and perceived exertion (RPE) for analytics.
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="cardBody" style={{ display: "grid", gap: 12 }}>
          {workoutLogId ? (
            <div className="muted" style={{ fontSize: 12 }}>
              Editing started planned session log: <code>{workoutLogId}</code>
            </div>
          ) : null}
          <div className="grid2">
            <label>
              <div style={{ fontWeight: 650, fontSize: 12 }}>Date</div>
              <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <label>
              <div style={{ fontWeight: 650, fontSize: 12 }}>Title</div>
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
          </div>

          <div style={{ fontWeight: 850, marginTop: 6 }}>Exercises</div>
          <div style={{ display: "grid", gap: 10 }}>
            {exercises.map((ex, idx) => (
              <div key={idx} className="card" style={{ boxShadow: "none" }}>
                <div className="cardBody" style={{ display: "grid", gap: 10 }}>
                  <label>
                    <div style={{ fontWeight: 650, fontSize: 12 }}>Exercise name</div>
                    <input
                      className="input"
                      value={ex.name}
                      onChange={(e) => {
                        const next = [...exercises];
                        next[idx] = { ...next[idx]!, name: e.target.value };
                        setExercises(next);
                      }}
                    />
                  </label>

                  <div className="grid2">
                    <label>
                      <div style={{ fontWeight: 650, fontSize: 12 }}>Sets</div>
                      <input
                        className="input"
                        type="number"
                        value={ex.sets}
                        min={1}
                        onChange={(e) => {
                          const next = [...exercises];
                          next[idx] = { ...next[idx]!, sets: Number(e.target.value) };
                          setExercises(next);
                        }}
                      />
                    </label>
                    <label>
                      <div style={{ fontWeight: 650, fontSize: 12 }}>Reps</div>
                      <input
                        className="input"
                        type="number"
                        value={ex.reps}
                        min={1}
                        onChange={(e) => {
                          const next = [...exercises];
                          next[idx] = { ...next[idx]!, reps: Number(e.target.value) };
                          setExercises(next);
                        }}
                      />
                    </label>
                  </div>

                  <label>
                    <div style={{ fontWeight: 650, fontSize: 12 }}>RPE (1–10)</div>
                    <input
                      className="input"
                      type="number"
                      value={ex.rpe}
                      min={1}
                      max={10}
                      onChange={(e) => {
                        const next = [...exercises];
                        next[idx] = { ...next[idx]!, rpe: Number(e.target.value) };
                        setExercises(next);
                      }}
                    />
                  </label>

                  <button
                    className="btn btnDanger"
                    onClick={() => {
                      setExercises(exercises.filter((_, i) => i !== idx));
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            className="btn"
            onClick={() => setExercises([...exercises, { name: "New exercise", sets: 3, reps: 8, rpe: 7 }])}
          >
            Add exercise
          </button>

          <button
            className="btn btnPrimary"
            onClick={() => {
              addWorkout({
                date,
                title,
                exercises
              });
            }}
          >
            Save workout
          </button>

          <div className="muted" style={{ fontSize: 12 }}>
            When started from a plan, backend pre-fills the workout log with exercises/sets. This page will be upgraded
            to fetch and edit that log by id.
          </div>
        </div>
      </div>
    </div>
  );
}
