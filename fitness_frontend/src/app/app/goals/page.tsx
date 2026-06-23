"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createGoal, listGoals, type GoalResponse } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function GoalsPage() {
  const { getIdToken } = useAuth();
  const [goals, setGoals] = useState<GoalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [primary, setPrimary] = useState<"weight_loss" | "muscle_gain" | "endurance" | "flexibility">("weight_loss");
  const [notes, setNotes] = useState("");

  const active = useMemo(() => goals.find((g) => g.is_active) ?? null, [goals]);

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const token = await getIdToken();
        const res = await listGoals(token);
        if (!mounted) return;
        setGoals(res);
        // Best-effort: if backend target stores our primary, prefill selector.
        const target = res[0]?.target ?? null;
        if (target && ["weight_loss", "muscle_gain", "endurance", "flexibility"].includes(target)) {
          setPrimary(target as any);
        }
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : "Failed to load goals");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [getIdToken]);

  return (
    <div className="container">
      <div style={{ fontWeight: 900, fontSize: 20 }}>Goals</div>
      <div className="muted" style={{ marginTop: 6 }}>
        Choose your primary training goal. This influences weekly plan suggestions.
      </div>

      {error ? (
        <div className="card" style={{ marginTop: 12, border: "1px solid rgba(239,68,68,.35)" }}>
          <div className="cardBody" style={{ color: "#b91c1c" }}>
            {error}
          </div>
        </div>
      ) : null}

      <div className="card" style={{ marginTop: 12 }}>
        <div className="cardBody" style={{ display: "grid", gap: 12 }}>
          <label>
            <div style={{ fontWeight: 650, fontSize: 12 }}>Primary goal</div>
            <select className="input" value={primary} onChange={(e) => setPrimary(e.target.value as any)}>
              <option value="weight_loss">Weight loss</option>
              <option value="muscle_gain">Muscle gain</option>
              <option value="endurance">Endurance</option>
              <option value="flexibility">Flexibility</option>
            </select>
          </label>

          <label>
            <div style={{ fontWeight: 650, fontSize: 12 }}>Notes (optional)</div>
            <textarea className="input" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g., train 4x/week, prefer lower body focus" />
          </label>

          <button
            className="btn btnPrimary"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError(null);
              try {
                const token = await getIdToken();
                const created = await createGoal(
                  {
                    goal_type: "primary_goal",
                    target: primary
                  },
                  token
                );
                setGoals([created, ...goals]);
              } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to save goal");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Saving..." : "Save goals"}
          </button>

          <div className="muted" style={{ fontSize: 12 }}>
            Saved to backend goals history.
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="cardBody" style={{ display: "grid", gap: 10 }}>
          <div style={{ fontWeight: 850 }}>Goal history</div>
          {loading ? <div className="muted">Loading…</div> : null}
          {active ? (
            <div className="muted" style={{ fontSize: 12 }}>
              Active: <strong>{active.target ?? active.goal_type}</strong>
            </div>
          ) : null}
          {goals.map((g) => (
            <div key={g.id} className="card" style={{ boxShadow: "none" }}>
              <div className="cardBody" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ fontWeight: 850 }}>{g.goal_type}</div>
                {g.target ? <span className="badge">{g.target}</span> : null}
                <span className="badge">{g.is_active ? "active" : "inactive"}</span>
              </div>
            </div>
          ))}
          {!loading && goals.length === 0 ? <div className="muted">No goals yet.</div> : null}
        </div>
      </div>
    </div>
  );
}
