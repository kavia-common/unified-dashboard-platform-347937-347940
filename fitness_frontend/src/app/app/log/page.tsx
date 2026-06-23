"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createWorkoutLog, type WorkoutLogCreateRequest } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthProvider";

type WorkoutSetDraft = {
  reps: number;
  weightKg?: number;
  rpe?: number;
};

type WorkoutExerciseDraft = {
  name: string;
  sets: WorkoutSetDraft[];
};

export default function LogWorkoutPage() {
  const { getIdToken } = useAuth();
  const workoutLogId = useMemo(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("workout_log_id");
  }, []);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState("Workout");
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState<WorkoutExerciseDraft[]>([
    { name: "Squat", sets: [{ reps: 5, weightKg: 80, rpe: 7 }] },
    { name: "Bench Press", sets: [{ reps: 8, weightKg: 60, rpe: 7 }] }
  ]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

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
          {error ? <div style={{ color: "#b91c1c" }}>{error}</div> : null}
          {savedId ? (
            <div className="card" style={{ boxShadow: "none" }}>
              <div className="cardBody" style={{ display: "grid", gap: 6 }}>
                <div style={{ fontWeight: 800 }}>Saved</div>
                <div className="muted" style={{ fontSize: 12 }}>
                  Created workout log id: <code>{savedId}</code>
                </div>
              </div>
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

          <label>
            <div style={{ fontWeight: 650, fontSize: 12 }}>Notes</div>
            <textarea className="input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>

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

                  <div style={{ display: "grid", gap: 8 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <div style={{ fontWeight: 800 }}>Sets</div>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => {
                          const next = [...exercises];
                          const sets = next[idx]!.sets.slice();
                          sets.push({ reps: 8, weightKg: 0, rpe: 7 });
                          next[idx] = { ...next[idx]!, sets };
                          setExercises(next);
                        }}
                      >
                        Add set
                      </button>
                    </div>
                    {ex.sets.map((s, sIdx) => (
                      <div key={sIdx} className="grid2">
                        <label>
                          <div style={{ fontWeight: 650, fontSize: 12 }}>Reps</div>
                          <input
                            className="input"
                            type="number"
                            value={s.reps}
                            min={0}
                            onChange={(e) => {
                              const next = [...exercises];
                              const sets = next[idx]!.sets.slice();
                              sets[sIdx] = { ...sets[sIdx]!, reps: Number(e.target.value) };
                              next[idx] = { ...next[idx]!, sets };
                              setExercises(next);
                            }}
                          />
                        </label>
                        <label>
                          <div style={{ fontWeight: 650, fontSize: 12 }}>Weight (kg)</div>
                          <input
                            className="input"
                            type="number"
                            value={s.weightKg ?? 0}
                            min={0}
                            onChange={(e) => {
                              const next = [...exercises];
                              const sets = next[idx]!.sets.slice();
                              sets[sIdx] = { ...sets[sIdx]!, weightKg: Number(e.target.value) };
                              next[idx] = { ...next[idx]!, sets };
                              setExercises(next);
                            }}
                          />
                        </label>
                        <label>
                          <div style={{ fontWeight: 650, fontSize: 12 }}>RPE (1–10)</div>
                          <input
                            className="input"
                            type="number"
                            value={s.rpe ?? 7}
                            min={1}
                            max={10}
                            onChange={(e) => {
                              const next = [...exercises];
                              const sets = next[idx]!.sets.slice();
                              sets[sIdx] = { ...sets[sIdx]!, rpe: Number(e.target.value) };
                              next[idx] = { ...next[idx]!, sets };
                              setExercises(next);
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          className="btn btnDanger"
                          onClick={() => {
                            const next = [...exercises];
                            const sets = next[idx]!.sets.filter((_, i) => i !== sIdx);
                            next[idx] = { ...next[idx]!, sets };
                            setExercises(next);
                          }}
                        >
                          Remove set
                        </button>
                      </div>
                    ))}
                  </div>

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
            onClick={() => setExercises([...exercises, { name: "New exercise", sets: [{ reps: 8, weightKg: 0, rpe: 7 }] }])}
          >
            Add exercise
          </button>

          <button
            className="btn btnPrimary"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError(null);
              setSavedId(null);
              try {
                const token = await getIdToken();
                const started_at = `${date}T00:00:00Z`;
                const body: WorkoutLogCreateRequest = {
                  planned_session_id: null,
                  started_at,
                  ended_at: null,
                  title,
                  notes: notes || null,
                  rpe: null,
                  calories_burned: null,
                  exercises: exercises.map((ex, idx) => ({
                    exercise_id: null,
                    position: idx,
                    notes: null,
                    sets: ex.sets.map((s, sIdx) => ({
                      set_number: sIdx + 1,
                      reps: s.reps,
                      weight_kg: s.weightKg ?? null,
                      rpe: s.rpe ?? null,
                      is_warmup: false,
                      duration_seconds: null,
                      distance_meters: null,
                      notes: null
                    }))
                  }))
                };
                const created = await createWorkoutLog(body, token);
                setSavedId(created.id);
              } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to save workout");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Saving..." : "Save workout"}
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
