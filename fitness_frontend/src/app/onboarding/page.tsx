"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useProfileStore } from "@/lib/state/profileStore";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, updateProfile } = useProfileStore();

  const [fitnessLevel, setFitnessLevel] = useState(profile.fitnessLevel ?? "beginner");
  const [equipment, setEquipment] = useState(profile.equipment ?? "");
  const [injuries, setInjuries] = useState(profile.injuries ?? "");

  if (!user) {
    router.replace("/login");
    return null;
  }

  return (
    <div className="container">
      <div className="card" style={{ marginTop: 24 }}>
        <div className="cardBody" style={{ display: "grid", gap: 12 }}>
          <div style={{ fontWeight: 900, fontSize: 18 }}>Onboarding</div>
          <div className="muted">Tell us a bit about you so we can tailor your plan.</div>

          <label>
            <div style={{ fontWeight: 650, fontSize: 12 }}>Fitness level</div>
            <select className="input" value={fitnessLevel} onChange={(e) => setFitnessLevel(e.target.value)}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>

          <label>
            <div style={{ fontWeight: 650, fontSize: 12 }}>Equipment available</div>
            <input className="input" value={equipment} onChange={(e) => setEquipment(e.target.value)} placeholder="e.g., bodyweight, dumbbells, gym" />
          </label>

          <label>
            <div style={{ fontWeight: 650, fontSize: 12 }}>Injuries / constraints</div>
            <textarea className="input" rows={4} value={injuries} onChange={(e) => setInjuries(e.target.value)} placeholder="Optional but recommended" />
          </label>

          <button
            className="btn btnPrimary"
            onClick={() => {
              updateProfile({ fitnessLevel: fitnessLevel as any, equipment, injuries });
              router.push("/app/goals");
            }}
          >
            Continue to goals
          </button>

          <div className="muted" style={{ fontSize: 12 }}>
            Later, this will be saved to the backend profile endpoint after backend integration is complete.
          </div>
        </div>
      </div>
    </div>
  );
}
