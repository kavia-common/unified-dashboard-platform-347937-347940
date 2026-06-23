"use client";

import { useEffect, useState } from "react";
import { z } from "zod";

const ExerciseSchema = z.object({
  name: z.string().min(1),
  sets: z.number().int().min(1),
  reps: z.number().int().min(1),
  rpe: z.number().min(1).max(10)
});

const WorkoutSchema = z.object({
  id: z.string(),
  date: z.string(),
  title: z.string(),
  exercises: z.array(ExerciseSchema)
});

export type Workout = z.infer<typeof WorkoutSchema>;
export type WorkoutExerciseDraft = z.infer<typeof ExerciseSchema>;

const KEY = "fitness.workouts.v1";

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readWorkouts(): Workout[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    return z.array(WorkoutSchema).parse(JSON.parse(raw));
  } catch {
    return [];
  }
}

function writeWorkouts(w: Workout[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(w));
}

// PUBLIC_INTERFACE
export function useWorkoutStore() {
  /** Local workout log store supporting RPE per exercise. */
  const [workouts, setWorkouts] = useState<Workout[]>(() => readWorkouts());

  useEffect(() => setWorkouts(readWorkouts()), []);

  const addWorkout = (draft: { date: string; title: string; exercises: WorkoutExerciseDraft[] }) => {
    const nextWorkout: Workout = WorkoutSchema.parse({
      id: uid(),
      ...draft
    });
    const next = [nextWorkout, ...workouts];
    setWorkouts(next);
    writeWorkouts(next);
  };

  return { workouts, addWorkout };
}
