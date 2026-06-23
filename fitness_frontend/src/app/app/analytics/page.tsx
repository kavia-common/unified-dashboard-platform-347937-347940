"use client";

import React, { useEffect, useState } from "react";
import { analyticsSummary, type AnalyticsSummaryResponse } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function AnalyticsPage() {
  const { getIdToken } = useAuth();
  const [days, setDays] = useState(28);
  const [summary, setSummary] = useState<AnalyticsSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const token = await getIdToken();
        const res = await analyticsSummary(days, token);
        if (mounted) setSummary(res);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : "Failed to load analytics");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [getIdToken, days]);

  return (
    <div className="container">
      <div style={{ fontWeight: 900, fontSize: 20 }}>Analytics</div>
      <div className="muted" style={{ marginTop: 6 }}>
        Visualize trends from your logs. Summary is backend-backed; time-series charts will be enabled once dedicated endpoints are added.
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="cardBody" style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ fontWeight: 850 }}>Summary</div>
            <div style={{ flex: 1 }} />
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span className="muted" style={{ fontSize: 12, fontWeight: 700 }}>
                Window
              </span>
              <select className="input" value={days} onChange={(e) => setDays(Number(e.target.value))} style={{ width: 140 }}>
                <option value={7}>7 days</option>
                <option value={28}>28 days</option>
                <option value={90}>90 days</option>
              </select>
            </label>
          </div>

          {error ? <div style={{ color: "#b91c1c" }}>{error}</div> : null}
          {loading ? <div className="muted">Loading…</div> : null}

          {summary ? (
            <div className="kpiRow">
              <div className="kpi">
                <div className="muted" style={{ fontSize: 12, fontWeight: 700 }}>
                  Workouts ({summary.window_days}d)
                </div>
                <div style={{ fontWeight: 900, fontSize: 22, marginTop: 6 }}>{summary.workouts_count}</div>
              </div>
              <div className="kpi">
                <div className="muted" style={{ fontSize: 12, fontWeight: 700 }}>
                  Steps ({summary.window_days}d)
                </div>
                <div style={{ fontWeight: 900, fontSize: 22, marginTop: 6 }}>{summary.steps_sum}</div>
              </div>
              <div className="kpi">
                <div className="muted" style={{ fontSize: 12, fontWeight: 700 }}>
                  Latest weight (kg)
                </div>
                <div style={{ fontWeight: 900, fontSize: 22, marginTop: 6 }}>
                  {summary.latest_weight_kg ?? "—"}
                </div>
              </div>
            </div>
          ) : null}

          <div className="muted" style={{ fontSize: 12 }}>
            Time-series charts (RPE, steps by day, weight trend) will be re-enabled when backend exposes time-series endpoints.
          </div>
        </div>
      </div>
    </div>
  );
}
