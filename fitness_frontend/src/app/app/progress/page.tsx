"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  createBodyMetric,
  createPersonalRecord,
  listBodyMetrics,
  listPersonalRecords,
  type BodyMetricResponse,
  type PersonalRecordResponse
} from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthProvider";

type ProgressMetricType = "weight" | "waist" | "body_fat";

export default function ProgressPage() {
  const { getIdToken } = useAuth();
  const [metrics, setMetrics] = useState<BodyMetricResponse[]>([]);
  const [prs, setPrs] = useState<PersonalRecordResponse[]>([]);
  // Photo handling remains local until backend upload/list endpoints are available.
  const [photos, setPhotos] = useState<Array<{ date: string; url: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [metricType, setMetricType] = useState<ProgressMetricType>("weight");
  const [metricValue, setMetricValue] = useState<number>(70);
  const [metricDate, setMetricDate] = useState(() => new Date().toISOString().slice(0, 10));

  const [prLift, setPrLift] = useState("Deadlift");
  const [prValue, setPrValue] = useState(120);
  const [prDate, setPrDate] = useState(() => new Date().toISOString().slice(0, 10));

  const [photoUrl, setPhotoUrl] = useState("");
  const [photoDate, setPhotoDate] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const token = await getIdToken();
        const [m, p] = await Promise.all([listBodyMetrics(token), listPersonalRecords(token)]);
        if (!mounted) return;
        setMetrics(m);
        setPrs(p);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : "Failed to load progress data");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [getIdToken]);

  const metricCards = useMemo(() => {
    // Convert backend model into the display list the UI already expects.
    return metrics.map((m) => {
      const date = m.measured_at.slice(0, 10);
      const type: ProgressMetricType = m.weight_kg != null ? "weight" : m.body_fat_pct != null ? "body_fat" : "waist";
      const value =
        type === "weight"
          ? m.weight_kg ?? 0
          : type === "body_fat"
            ? m.body_fat_pct ?? 0
            : typeof m.measurements?.["waist"] === "number"
              ? (m.measurements["waist"] as number)
              : 0;
      return { key: m.id, date, type, value };
    });
  }, [metrics]);

  return (
    <div className="container">
      <div style={{ fontWeight: 900, fontSize: 20 }}>Progress</div>
      <div className="muted" style={{ marginTop: 6 }}>
        Track body metrics, PRs, and progress photos.
      </div>

      {error ? (
        <div className="card" style={{ marginTop: 12, border: "1px solid rgba(239,68,68,.35)" }}>
          <div className="cardBody" style={{ color: "#b91c1c" }}>
            {error}
          </div>
        </div>
      ) : null}

      <div className="grid2" style={{ marginTop: 12 }}>
        <div className="card">
          <div className="cardBody" style={{ display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 850 }}>Add metric</div>
            <div className="grid2">
              <label>
                <div style={{ fontWeight: 650, fontSize: 12 }}>Type</div>
                <select className="input" value={metricType} onChange={(e) => setMetricType(e.target.value as any)}>
                  <option value="weight">Weight</option>
                  <option value="waist">Waist</option>
                  <option value="body_fat">Body fat %</option>
                </select>
              </label>
              <label>
                <div style={{ fontWeight: 650, fontSize: 12 }}>Date</div>
                <input className="input" type="date" value={metricDate} onChange={(e) => setMetricDate(e.target.value)} />
              </label>
            </div>
            <label>
              <div style={{ fontWeight: 650, fontSize: 12 }}>Value</div>
              <input className="input" type="number" value={metricValue} onChange={(e) => setMetricValue(Number(e.target.value))} />
            </label>
            <button
              className="btn btnPrimary"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setError(null);
                try {
                  const token = await getIdToken();
                  const measured_at = `${metricDate}T00:00:00Z`;
                  const payload =
                    metricType === "weight"
                      ? { measured_at, weight_kg: metricValue }
                      : metricType === "body_fat"
                        ? { measured_at, body_fat_pct: metricValue }
                        : { measured_at, measurements: { waist: metricValue } };
                  const created = await createBodyMetric(payload, token);
                  setMetrics([created, ...metrics]);
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Failed to save metric");
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? "Saving..." : "Save metric"}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="cardBody" style={{ display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 850 }}>Add PR</div>
            <div className="grid2">
              <label>
                <div style={{ fontWeight: 650, fontSize: 12 }}>Lift</div>
                <input className="input" value={prLift} onChange={(e) => setPrLift(e.target.value)} />
              </label>
              <label>
                <div style={{ fontWeight: 650, fontSize: 12 }}>Date</div>
                <input className="input" type="date" value={prDate} onChange={(e) => setPrDate(e.target.value)} />
              </label>
            </div>
            <label>
              <div style={{ fontWeight: 650, fontSize: 12 }}>Value</div>
              <input className="input" type="number" value={prValue} onChange={(e) => setPrValue(Number(e.target.value))} />
            </label>
            <button
              className="btn btnPrimary"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setError(null);
                try {
                  const token = await getIdToken();
                  const created = await createPersonalRecord(
                    { pr_type: prLift, value: prValue, achieved_at: `${prDate}T00:00:00Z` },
                    token
                  );
                  setPrs([created, ...prs]);
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Failed to save PR");
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? "Saving..." : "Save PR"}
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="cardBody" style={{ display: "grid", gap: 10 }}>
          <div style={{ fontWeight: 850 }}>Add progress photo</div>
          <div className="grid2">
            <label>
              <div style={{ fontWeight: 650, fontSize: 12 }}>Date</div>
              <input className="input" type="date" value={photoDate} onChange={(e) => setPhotoDate(e.target.value)} />
            </label>
            <label>
              <div style={{ fontWeight: 650, fontSize: 12 }}>Photo URL</div>
              <input className="input" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://..." />
            </label>
          </div>
          <button
            className="btn btnPrimary"
            onClick={() => {
              if (!photoUrl.trim()) return;
              setPhotos([{ date: photoDate, url: photoUrl.trim() }, ...photos]);
              setPhotoUrl("");
            }}
          >
            Save photo reference
          </button>
          <div className="muted" style={{ fontSize: 12 }}>
            Photo upload/storage will be wired to backend/object storage during integration.
          </div>
        </div>
      </div>

      <div className="grid2" style={{ marginTop: 12 }}>
        <div className="card">
          <div className="cardBody">
            <div style={{ fontWeight: 850 }}>Metrics history</div>
            <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
              {loading ? <div className="muted">Loading…</div> : null}
              {metricCards.map((m) => (
                <div key={m.key} className="card" style={{ boxShadow: "none" }}>
                  <div className="cardBody" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ fontWeight: 850 }}>{m.date}</div>
                    <span className="badge">{m.type}</span>
                    <span className="badge">{m.value}</span>
                  </div>
                </div>
              ))}
              {!loading && metricCards.length === 0 && <div className="muted">No metrics yet.</div>}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="cardBody">
            <div style={{ fontWeight: 850 }}>PRs</div>
            <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
              {loading ? <div className="muted">Loading…</div> : null}
              {prs.map((p) => (
                <div key={p.id} className="card" style={{ boxShadow: "none" }}>
                  <div className="cardBody" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ fontWeight: 850 }}>{p.achieved_at.slice(0, 10)}</div>
                    <span className="badge">{p.pr_type}</span>
                    <span className="badge">{p.value}</span>
                  </div>
                </div>
              ))}
              {!loading && prs.length === 0 && <div className="muted">No PRs yet.</div>}
            </div>

            <div style={{ fontWeight: 850, marginTop: 14 }}>Photos</div>
            <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
              {photos.map((ph) => (
                <div key={`${ph.date}-${ph.url}`} className="card" style={{ boxShadow: "none" }}>
                  <div className="cardBody">
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                      <div style={{ fontWeight: 850 }}>{ph.date}</div>
                      <a className="badge" href={ph.url} target="_blank" rel="noreferrer">
                        Open photo
                      </a>
                    </div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                      {ph.url}
                    </div>
                  </div>
                </div>
              ))}
              {photos.length === 0 && <div className="muted">No photos yet.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
