"use client";

import { useEffect, useState } from "react";
import { z } from "zod";

export type ProgressMetricType = "weight" | "waist" | "body_fat";

const MetricSchema = z.object({
  type: z.enum(["weight", "waist", "body_fat"]),
  value: z.number(),
  date: z.string()
});

const PRSchema = z.object({
  lift: z.string(),
  value: z.number(),
  date: z.string()
});

const PhotoSchema = z.object({
  date: z.string(),
  url: z.string().url()
});

export type ProgressMetric = z.infer<typeof MetricSchema>;
export type PersonalRecord = z.infer<typeof PRSchema>;
export type ProgressPhoto = z.infer<typeof PhotoSchema>;

const KEY = "fitness.progress.v1";

function read() {
  if (typeof window === "undefined") return { metrics: [] as ProgressMetric[], prs: [] as PersonalRecord[], photos: [] as ProgressPhoto[] };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { metrics: [], prs: [], photos: [] };
    const parsed = z
      .object({
        metrics: z.array(MetricSchema),
        prs: z.array(PRSchema),
        photos: z.array(PhotoSchema)
      })
      .parse(JSON.parse(raw));
    return parsed;
  } catch {
    return { metrics: [], prs: [], photos: [] };
  }
}

function write(v: { metrics: ProgressMetric[]; prs: PersonalRecord[]; photos: ProgressPhoto[] }) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(v));
}

// PUBLIC_INTERFACE
export function useProgressStore() {
  /** Local progress store for body metrics, PRs, and photo references. */
  const [metrics, setMetrics] = useState<ProgressMetric[]>(() => read().metrics);
  const [prs, setPRs] = useState<PersonalRecord[]>(() => read().prs);
  const [photos, setPhotos] = useState<ProgressPhoto[]>(() => read().photos);

  useEffect(() => {
    const v = read();
    setMetrics(v.metrics);
    setPRs(v.prs);
    setPhotos(v.photos);
  }, []);

  const persist = (next: { metrics: ProgressMetric[]; prs: PersonalRecord[]; photos: ProgressPhoto[] }) => {
    setMetrics(next.metrics);
    setPRs(next.prs);
    setPhotos(next.photos);
    write(next);
  };

  const addMetric = (m: ProgressMetric) => {
    const parsed = MetricSchema.parse(m);
    const v = read();
    persist({ ...v, metrics: [parsed, ...v.metrics] });
  };

  const addPR = (p: PersonalRecord) => {
    const parsed = PRSchema.parse(p);
    const v = read();
    persist({ ...v, prs: [parsed, ...v.prs] });
  };

  const addPhoto = (ph: ProgressPhoto) => {
    const parsed = PhotoSchema.parse(ph);
    const v = read();
    persist({ ...v, photos: [parsed, ...v.photos] });
  };

  return { metrics, prs, photos, addMetric, addPR, addPhoto };
}
