"use client";

import { useEffect, useState } from "react";
import { z } from "zod";

const ExerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string()
});
const TemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string()
});

export type AdminExercise = z.infer<typeof ExerciseSchema>;
export type AdminTemplate = z.infer<typeof TemplateSchema>;

const KEY = "fitness.adminContent.v1";

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function read() {
  if (typeof window === "undefined") return { exercises: [] as AdminExercise[], templates: [] as AdminTemplate[] };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { exercises: [], templates: [] };
    return z
      .object({
        exercises: z.array(ExerciseSchema),
        templates: z.array(TemplateSchema)
      })
      .parse(JSON.parse(raw));
  } catch {
    return { exercises: [], templates: [] };
  }
}

function write(v: { exercises: AdminExercise[]; templates: AdminTemplate[] }) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(v));
}

// PUBLIC_INTERFACE
export function useAdminContentStore() {
  /** Local admin content store. Real implementation will use admin-only backend endpoints. */
  const [exercises, setExercises] = useState<AdminExercise[]>(() => read().exercises);
  const [templates, setTemplates] = useState<AdminTemplate[]>(() => read().templates);

  useEffect(() => {
    const v = read();
    setExercises(v.exercises);
    setTemplates(v.templates);
  }, []);

  const persist = (next: { exercises: AdminExercise[]; templates: AdminTemplate[] }) => {
    setExercises(next.exercises);
    setTemplates(next.templates);
    write(next);
  };

  const addExercise = (draft: Omit<AdminExercise, "id">) => {
    const v = read();
    persist({ ...v, exercises: [ExerciseSchema.parse({ id: uid(), ...draft }), ...v.exercises] });
  };

  const addTemplate = (draft: Omit<AdminTemplate, "id">) => {
    const v = read();
    persist({ ...v, templates: [TemplateSchema.parse({ id: uid(), ...draft }), ...v.templates] });
  };

  return { exercises, templates, addExercise, addTemplate };
}
