"use client";

import React, { useState } from "react";
import { useProgressStore, type ProgressMetricType } from "@/lib/state/progressStore";

export default function ProgressPage() {
  const { metrics, prs, photos, addMetric, addPR, addPhoto } = useProgressStore();
  const [metricType, setMetricType] = useState<ProgressMetricType>("weight");
  const [metricValue, setMetricValue] = useState<number>(70);
  const [metricDate, setMetricDate] = useState(() => new Date().toISOString().slice(0, 10));

  const [prLift, setPrLift] = useState("Deadlift");
  const [prValue, setPrValue] = useState(120);
  const [prDate, setPrDate] = useState(() => new Date().toISOString().slice(0, 10));

  const [photoUrl, setPhotoUrl] = useState("");
  const [photoDate, setPhotoDate] = useState(() => new Date().toISOString().slice(0, 10));

  return (
    <div className="container">
      <div style={{ fontWeight: 900, fontSize: 20 }}>Progress</div>
      <div className="muted" style={{ marginTop: 6 }}>
        Track body metrics, PRs, and progress photos.
      </div>

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
            <button className="btn btnPrimary" onClick={() => addMetric({ type: metricType, value: metricValue, date: metricDate })}>
              Save metric
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
            <button className="btn btnPrimary" onClick={() => addPR({ lift: prLift, value: prValue, date: prDate })}>
              Save PR
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
              addPhoto({ date: photoDate, url: photoUrl.trim() });
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
              {metrics.map((m) => (
                <div key={`${m.type}-${m.date}-${m.value}`} className="card" style={{ boxShadow: "none" }}>
                  <div className="cardBody" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ fontWeight: 850 }}>{m.date}</div>
                    <span className="badge">{m.type}</span>
                    <span className="badge">{m.value}</span>
                  </div>
                </div>
              ))}
              {metrics.length === 0 && <div className="muted">No metrics yet.</div>}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="cardBody">
            <div style={{ fontWeight: 850 }}>PRs</div>
            <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
              {prs.map((p) => (
                <div key={`${p.lift}-${p.date}-${p.value}`} className="card" style={{ boxShadow: "none" }}>
                  <div className="cardBody" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ fontWeight: 850 }}>{p.date}</div>
                    <span className="badge">{p.lift}</span>
                    <span className="badge">{p.value}</span>
                  </div>
                </div>
              ))}
              {prs.length === 0 && <div className="muted">No PRs yet.</div>}
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
