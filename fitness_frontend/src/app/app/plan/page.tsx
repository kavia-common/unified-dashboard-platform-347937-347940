"use client";

import React, { useMemo, useState } from "react";
import { startPlannedSession, updatePlannedSessionStatus } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/useAuth";
import { useGoalsStore } from "@/lib/state/goalsStore";
import { usePlanStore } from "@/lib/state/planStore";

type UiPlannedSession = {
  id: string;
  day: string;
  focus?: string;
  title: string;
  status: "planned" | "in_progress" | "completed" | "skipped" | "cancelled";
};

export default function PlanPage() {
  const { user } = useAuth();
  const { plan, generatePlan } = usePlanStore();
  const { goals } = useGoalsStore();

  const [busySessionId, setBusySessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const subtitle = useMemo(() => {
    const map: Record<string, string> = {
      weight_loss: "More conditioning + full-body strength.",
      muscle_gain: "Progressive overload + recovery.",
      endurance: "Aerobic base + intervals.",
      flexibility: "Mobility + light strength."
    };
    return map[goals.primary] ?? "";
  }, [goals.primary]);

  // The current Plan UI is backed by a local store. For end-to-end execution, we treat each day card
  // as a "planned session" and require a real backend planned session id.
  //
  // In integrated deployments, this page should be populated from backend /api/plans and /sessions.
  // For now, we still render local cards, but only enable execution actions when session ids exist.
  const sessions: UiPlannedSession[] = useMemo(() => {
    return plan.days.map((d, idx) => ({
      // Local planStore doesn't include ids; keep a stable synthetic id for UI rendering.
      // Execution actions will be disabled unless replaced by real backend sessions.
      id: String(idx),
      day: d.day,
      focus: d.focus,
      title: d.session,
      status: "planned"
    }));
  }, [plan.days]);

  async function requireToken(): Promise<string> {
    // useAuth implementation details vary; safest is to rely on firebase user.getIdToken when available.
    // If it's not present, we fail with a clear message.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyUser = user as any;
    if (!anyUser?.getIdToken) {
      throw new Error("Not authenticated (missing Firebase user token).");
    }
    return (await anyUser.getIdToken()) as string;
  }

  async function onStart(sessionId: string) {
    setError(null);
    setBusySessionId(sessionId);
    try {
      const token = await requireToken();
      const res = await startPlannedSession(sessionId, token);
      // Navigate to log page; log page should load this workout_log and allow editing.
      window.location.href = `/app/log?workout_log_id=${encodeURIComponent(res.workout_log_id)}`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start session");
    } finally {
      setBusySessionId(null);
    }
  }

  async function onMark(sessionId: string, status: "completed" | "skipped") {
    setError(null);
    setBusySessionId(sessionId);
    try {
      const token = await requireToken();
      await updatePlannedSessionStatus(sessionId, status, token);
      // In a fully integrated UI we'd refetch sessions. For now, show a lightweight confirmation.
      alert(`Marked session as ${status}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update status");
    } finally {
      setBusySessionId(null);
    }
  }

  return (
    <div className="container">
      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontWeight: 900, fontSize: 20 }}>Weekly Plan</div>
          <div className="muted" style={{ marginTop: 6 }}>
            Goal: <strong>{goals.primary.replace("_", " ")}</strong> — {subtitle}
          </div>
        </div>
        <button className="btn btnPrimary" onClick={() => generatePlan(goals.primary)}>
          Generate / refresh
        </button>
      </div>

      {error ? (
        <div className="card" style={{ marginTop: 12, border: "1px solid rgba(239,68,68,.35)" }}>
          <div className="cardBody" style={{ color: "#b91c1c" }}>
            {error}
          </div>
        </div>
      ) : null}

      <div className="card" style={{ marginTop: 12 }}>
        <div className="cardBody" style={{ display: "grid", gap: 10 }}>
          {sessions.map((s) => {
            const disabled = busySessionId === s.id;
            const hasRealBackendId = s.id.includes("-"); // heuristic: real UUIDs contain dashes
            return (
              <div key={s.id} className="card" style={{ boxShadow: "none" }}>
                <div className="cardBody">
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ fontWeight: 900 }}>{s.day}</div>
                    {s.focus ? <span className="badge">{s.focus}</span> : null}
                    <span className="badge">{s.status}</span>
                  </div>

                  <div className="muted" style={{ marginTop: 6 }}>
                    {s.title}
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                    <button
                      className="btn btnPrimary"
                      disabled={disabled || !hasRealBackendId}
                      onClick={() => onStart(s.id)}
                      title={!hasRealBackendId ? "Requires backend planned session id (UUID)" : "Start workout"}
                    >
                      {disabled ? "Starting..." : "Start"}
                    </button>
                    <button
                      className="btn"
                      disabled={disabled || !hasRealBackendId}
                      onClick={() => onMark(s.id, "completed")}
                      title={!hasRealBackendId ? "Requires backend planned session id (UUID)" : "Mark completed"}
                    >
                      Complete
                    </button>
                    <button
                      className="btn btnDanger"
                      disabled={disabled || !hasRealBackendId}
                      onClick={() => onMark(s.id, "skipped")}
                      title={!hasRealBackendId ? "Requires backend planned session id (UUID)" : "Mark skipped"}
                    >
                      Skip
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="muted" style={{ fontSize: 12 }}>
            Execution flow is now wired to backend endpoints:
            <code> POST /api/plans/sessions/&lt;id&gt;/start</code> and
            <code> PATCH /api/plans/sessions/&lt;id&gt;/status</code>. This page still uses the local plan store
            for display, so buttons are enabled only when sessions come from backend (UUID ids).
          </div>
        </div>
      </div>
    </div>
  );
}
