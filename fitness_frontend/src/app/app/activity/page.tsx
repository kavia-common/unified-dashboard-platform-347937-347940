"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createActivityLog, listActivityLogs, type ActivityLogResponse } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function ActivityPage() {
  const { getIdToken } = useAuth();
  const [entries, setEntries] = useState<ActivityLogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [steps, setSteps] = useState(5000);
  const [cardioMinutes, setCardioMinutes] = useState(0);

  // Load from backend.
  useEffect(() => {
    let mounted = true;
    async function run() {
      setError(null);
      setLoading(true);
      try {
        const token = await getIdToken();
        const res = await listActivityLogs(token);
        if (mounted) setEntries(res);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : "Failed to load activity logs");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [getIdToken]);

  const weekTotal = useMemo(
    () => entries.reduce((sum, e) => sum + (e.steps ?? 0), 0),
    [entries]
  );

  return (
    <div className="container">
      <div style={{ fontWeight: 900, fontSize: 20 }}>Activity</div>
      <div className="muted" style={{ marginTop: 6 }}>
        Track steps and cardio minutes (manual entry baseline).
      </div>

      {error ? (
        <div className="card" style={{ marginTop: 12, border: "1px solid rgba(239,68,68,.35)" }}>
          <div className="cardBody" style={{ color: "#b91c1c" }}>
            {error}
          </div>
        </div>
      ) : null}

      <div style={{ marginTop: 12 }} className="kpiRow">
        <div className="kpi">
          <div className="muted" style={{ fontSize: 12, fontWeight: 700 }}>
            Logged days
          </div>
          <div style={{ fontWeight: 900, fontSize: 22, marginTop: 6 }}>{entries.length}</div>
        </div>
        <div className="kpi">
          <div className="muted" style={{ fontSize: 12, fontWeight: 700 }}>
            Steps total (all entries)
          </div>
          <div style={{ fontWeight: 900, fontSize: 22, marginTop: 6 }}>{weekTotal}</div>
        </div>
        <div className="kpi">
          <div className="muted" style={{ fontSize: 12, fontWeight: 700 }}>
            Cardio minutes (all entries)
          </div>
          <div style={{ fontWeight: 900, fontSize: 22, marginTop: 6 }}>
            {entries.reduce((s, e) => s + (e.cardio_minutes ?? 0), 0)}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="cardBody" style={{ display: "grid", gap: 12 }}>
          <div style={{ fontWeight: 850 }}>Add entry</div>
          <div className="grid2">
            <label>
              <div style={{ fontWeight: 650, fontSize: 12 }}>Date</div>
              <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <label>
              <div style={{ fontWeight: 650, fontSize: 12 }}>Steps</div>
              <input className="input" type="number" value={steps} min={0} onChange={(e) => setSteps(Number(e.target.value))} />
            </label>
          </div>

          <label>
            <div style={{ fontWeight: 650, fontSize: 12 }}>Cardio minutes</div>
            <input className="input" type="number" value={cardioMinutes} min={0} onChange={(e) => setCardioMinutes(Number(e.target.value))} />
          </label>

          <button
            className="btn btnPrimary"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError(null);
              try {
                const token = await getIdToken();
                const created = await createActivityLog(
                  { occurred_on: date, steps, cardio_minutes: cardioMinutes },
                  token
                );
                setEntries([created, ...entries]);
              } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to save activity");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Saving..." : "Save activity"}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="cardBody" style={{ display: "grid", gap: 10 }}>
          <div style={{ fontWeight: 850 }}>History</div>
          {loading ? <div className="muted">Loading…</div> : null}
          {entries.map((e) => (
            <div key={e.id} className="card" style={{ boxShadow: "none" }}>
              <div className="cardBody" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ fontWeight: 850 }}>{e.occurred_on}</div>
                <span className="badge">{e.steps ?? 0} steps</span>
                <span className="badge">{e.cardio_minutes ?? 0} min cardio</span>
              </div>
            </div>
          ))}
          {!loading && entries.length === 0 && <div className="muted">No activity logged yet.</div>}
        </div>
      </div>
    </div>
  );
}
