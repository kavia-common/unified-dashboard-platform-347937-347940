"use client";

import { useEffect, useState } from "react";
import { z } from "zod";

const EntrySchema = z.object({
  date: z.string(),
  steps: z.number().int().min(0),
  cardioMinutes: z.number().int().min(0)
});

export type ActivityEntry = z.infer<typeof EntrySchema>;

const KEY = "fitness.activity.v1";

function read(): ActivityEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    return z.array(EntrySchema).parse(JSON.parse(raw));
  } catch {
    return [];
  }
}

function write(v: ActivityEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(v));
}

// PUBLIC_INTERFACE
export function useActivityStore() {
  /** Local activity store for steps and cardio minutes. */
  const [entries, setEntries] = useState<ActivityEntry[]>(() => read());

  useEffect(() => setEntries(read()), []);

  const addEntry = (draft: ActivityEntry) => {
    const parsed = EntrySchema.parse(draft);
    const next = [parsed, ...entries];
    setEntries(next);
    write(next);
  };

  return { entries, addEntry };
}
