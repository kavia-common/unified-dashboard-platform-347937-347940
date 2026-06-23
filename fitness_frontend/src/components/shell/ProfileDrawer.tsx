"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useProfileStore } from "@/lib/state/profileStore";

export function ProfileDrawer({ onClose, isAdmin }: { onClose: () => void; isAdmin: boolean }) {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfileStore();
  const [displayName, setDisplayName] = useState(profile.displayName ?? user?.displayName ?? "");
  const [fitnessLevel, setFitnessLevel] = useState(profile.fitnessLevel ?? "beginner");
  const [equipment, setEquipment] = useState(profile.equipment ?? "");
  const [injuries, setInjuries] = useState(profile.injuries ?? "");

  const email = useMemo(() => user?.email ?? "Unknown", [user]);

  return (
    <>
      <div className="drawerOverlay" onClick={onClose} aria-hidden />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Profile drawer">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontWeight: 900, fontSize: 16 }}>Profile</div>
          <div style={{ flex: 1 }} />
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="muted" style={{ marginTop: 8 }}>
          Signed in as <strong>{email}</strong>
        </div>

        <hr className="hr" />

        <div style={{ display: "grid", gap: 10 }}>
          <label>
            <div style={{ fontWeight: 650, fontSize: 12 }}>Display name</div>
            <input className="input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </label>

          <label>
            <div style={{ fontWeight: 650, fontSize: 12 }}>Fitness level</div>
            <select className="input" value={fitnessLevel} onChange={(e) => setFitnessLevel(e.target.value)}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>

          <label>
            <div style={{ fontWeight: 650, fontSize: 12 }}>Equipment</div>
            <input className="input" value={equipment} onChange={(e) => setEquipment(e.target.value)} placeholder="e.g., dumbbells, treadmill" />
          </label>

          <label>
            <div style={{ fontWeight: 650, fontSize: 12 }}>Injuries / constraints</div>
            <textarea
              className="input"
              value={injuries}
              onChange={(e) => setInjuries(e.target.value)}
              placeholder="e.g., knee pain, shoulder impingement"
              rows={3}
            />
          </label>

          <button
            className="btn btnPrimary"
            onClick={() => {
              updateProfile({ displayName, fitnessLevel, equipment, injuries });
              onClose();
            }}
          >
            Save
          </button>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="btn" href="/onboarding" onClick={onClose}>
              Onboarding
            </Link>
            <Link className="btn" href="/app/goals" onClick={onClose}>
              Goals
            </Link>
            {isAdmin && (
              <Link className="btn" href="/app/admin" onClick={onClose}>
                Admin
              </Link>
            )}
          </div>

          <div className="muted" style={{ fontSize: 12 }}>
            Note: profile is stored locally for now; backend sync will be wired once backend endpoints are available.
          </div>
        </div>
      </aside>
    </>
  );
}
