"use client";

import { useEffect, useState } from "react";
import { z } from "zod";

const DaySchema = z.object({
  day: z.string(),
  focus: z.string(),
  session: z.string()
});
const PlanSchema = z.object({
  days: z.array(DaySchema)
});

export type Plan = z.infer<typeof PlanSchema>;

const KEY = "fitness.plan.v1";

function defaultPlan(): Plan {
  return {
    days: [
      { day: "Mon", focus: "Strength", session: "Full-body strength (moderate)" },
      { day: "Tue", focus: "Cardio", session: "Zone 2 cardio 30–45 min" },
      { day: "Wed", focus: "Strength", session: "Upper body + core" },
      { day: "Thu", focus: "Mobility", session: "Mobility / stretching 20–30 min" },
      { day: "Fri", focus: "Strength", session: "Lower body + posterior chain" },
      { day: "Sat", focus: "Optional", session: "Light cardio or sport" },
      { day: "Sun", focus: "Rest", session: "Rest + light walk" }
    ]
  };
}

function readPlan(): Plan {
  if (typeof window === "undefined") return defaultPlan();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultPlan();
    return PlanSchema.parse(JSON.parse(raw));
  } catch {
    return defaultPlan();
  }
}

function writePlan(p: Plan) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(p));
}

function generate(goal: string): Plan {
  const base = defaultPlan();
  if (goal === "muscle_gain") {
    return {
      days: base.days.map((d) =>
        d.focus === "Cardio"
          ? { ...d, session: "Light cardio 20–30 min (recovery)" }
          : d.focus === "Strength"
            ? { ...d, session: d.day === "Mon" ? "Upper (hypertrophy)" : d.day === "Fri" ? "Lower (hypertrophy)" : "Full-body (hypertrophy)" }
            : d
      )
    };
  }
  if (goal === "endurance") {
    return {
      days: base.days.map((d) =>
        d.focus === "Strength"
          ? { ...d, session: "Strength maintenance (short)" }
          : d.focus === "Cardio"
            ? { ...d, session: "Intervals 25–35 min" }
            : d.focus === "Optional"
              ? { ...d, session: "Long easy cardio 45–70 min" }
              : d
      )
    };
  }
  if (goal === "flexibility") {
    return {
      days: base.days.map((d) =>
        d.focus === "Strength"
          ? { ...d, session: "Light strength + mobility" }
          : d.focus === "Mobility"
            ? { ...d, session: "Mobility flow 30–40 min" }
            : d
      )
    };
  }
  // weight_loss default
  return base;
}

// PUBLIC_INTERFACE
export function usePlanStore() {
  /** Local weekly plan store + simple generator until backend plan-generation endpoint is available. */
  const [plan, setPlan] = useState<Plan>(() => readPlan());

  useEffect(() => setPlan(readPlan()), []);

  const generatePlan = (primaryGoal: string) => {
    const next = generate(primaryGoal);
    setPlan(next);
    writePlan(next);
  };

  return { plan, generatePlan };
}
