"use client";

import { useEffect, useState } from "react";
import { z } from "zod";

const GoalsSchema = z.object({
  primary: z.enum(["weight_loss", "muscle_gain", "endurance", "flexibility"]).default("weight_loss"),
  notes: z.string().optional()
});

export type Goals = z.infer<typeof GoalsSchema>;

const KEY = "fitness.goals.v1";

function readGoals(): Goals {
  if (typeof window === "undefined") return { primary: "weight_loss" };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { primary: "weight_loss" };
    return GoalsSchema.parse(JSON.parse(raw));
  } catch {
    return { primary: "weight_loss" };
  }
}

function writeGoals(g: Goals) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(g));
}

// PUBLIC_INTERFACE
export function useGoalsStore() {
  /** Local goals store until backend persistence is available. */
  const [goals, setGoalsState] = useState<Goals>(() => readGoals());

  useEffect(() => setGoalsState(readGoals()), []);

  const setGoals = (next: Goals) => {
    const parsed = GoalsSchema.parse(next);
    setGoalsState(parsed);
    writeGoals(parsed);
  };

  return { goals, setGoals };
}
