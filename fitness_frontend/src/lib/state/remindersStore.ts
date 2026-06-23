"use client";

import { useEffect, useState } from "react";
import { z } from "zod";

const ReminderSchema = z.object({
  id: z.string(),
  time: z.string(),
  message: z.string(),
  days: z.array(z.string())
});

export type Reminder = z.infer<typeof ReminderSchema>;

const KEY = "fitness.reminders.v1";

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function read(): Reminder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    return z.array(ReminderSchema).parse(JSON.parse(raw));
  } catch {
    return [];
  }
}

function write(v: Reminder[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(v));
}

// PUBLIC_INTERFACE
export function useRemindersStore() {
  /** Local reminders store; backend scheduler integration will replace persistence later. */
  const [reminders, setReminders] = useState<Reminder[]>(() => read());

  useEffect(() => setReminders(read()), []);

  const addReminder = (draft: Omit<Reminder, "id">) => {
    const next = [ReminderSchema.parse({ id: uid(), ...draft }), ...reminders];
    setReminders(next);
    write(next);
  };

  const removeReminder = (id: string) => {
    const next = reminders.filter((r) => r.id !== id);
    setReminders(next);
    write(next);
  };

  return { reminders, addReminder, removeReminder };
}
