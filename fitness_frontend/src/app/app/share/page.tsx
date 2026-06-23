"use client";

import React, { useMemo, useState } from "react";
import { useWorkoutStore } from "@/lib/state/workoutStore";
import { useProgressStore } from "@/lib/state/progressStore";

export default function SharePage() {
  const { workouts } = useWorkoutStore();
  const { prs } = useProgressStore();
  const [copied, setCopied] = useState(false);

  const shareText = useMemo(() => {
    const last = workouts[0];
    const bestPr = prs[0];
    const lines: string[] = [];
    lines.push("Fitness update:");
    if (last) lines.push(`• Last workout (${last.date}): ${last.title} (${last.exercises.length} exercises)`);
    if (bestPr) lines.push(`• PR: ${bestPr.lift} — ${bestPr.value} (${bestPr.date})`);
    if (!last && !bestPr) lines.push("• Getting started — logging my first week!");
    lines.push("Built with my Fitness Dashboard.");
    return lines.join("\n");
  }, [workouts, prs]);

  return (
    <div className="container">
      <div style={{ fontWeight: 900, fontSize: 20 }}>Social Sharing</div>
      <div className="muted" style={{ marginTop: 6 }}>
        Share progress text. Screenshot/share-card features will be added after backend integration.
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="cardBody" style={{ display: "grid", gap: 12 }}>
          <div style={{ fontWeight: 850 }}>Share text</div>
          <textarea className="input" rows={8} readOnly value={shareText} />
          <button
            className="btn btnPrimary"
            onClick={async () => {
              await navigator.clipboard.writeText(shareText);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
          >
            {copied ? "Copied!" : "Copy to clipboard"}
          </button>
        </div>
      </div>
    </div>
  );
}
