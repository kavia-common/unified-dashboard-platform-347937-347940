"use client";

import { useEffect, useState } from "react";
import { z } from "zod";

const ProfileSchema = z.object({
  displayName: z.string().optional(),
  fitnessLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  equipment: z.string().optional(),
  injuries: z.string().optional()
});

export type Profile = z.infer<typeof ProfileSchema>;

const KEY = "fitness.profile.v1";

function readProfile(): Profile {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    return ProfileSchema.parse(JSON.parse(raw));
  } catch {
    return {};
  }
}

function writeProfile(p: Profile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(p));
}

// PUBLIC_INTERFACE
export function useProfileStore() {
  /** Local profile store used by onboarding and settings drawer until backend persistence is available. */
  const [profile, setProfile] = useState<Profile>(() => readProfile());

  useEffect(() => {
    setProfile(readProfile());
  }, []);

  const updateProfile = (patch: Partial<Profile>) => {
    const next = { ...profile, ...patch };
    setProfile(next);
    writeProfile(next);
  };

  return { profile, updateProfile };
}
