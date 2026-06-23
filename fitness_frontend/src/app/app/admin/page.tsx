"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useAdminClaim } from "@/lib/auth/useAdminClaim";
import { useAdminContentStore } from "@/lib/state/adminContentStore";

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { isAdmin, loading } = useAdminClaim(user);
  const { exercises, templates, addExercise, addTemplate } = useAdminContentStore();

  const [exName, setExName] = useState("Push-up");
  const [exCategory, setExCategory] = useState("Strength");

  const [tplName, setTplName] = useState("Full Body A");
  const [tplDesc, setTplDesc] = useState("Simple full-body template");

  const gateText = useMemo(() => {
    if (loading) return "Checking admin access…";
    return isAdmin ? null : "You do not have admin access.";
  }, [loading, isAdmin]);

  if (!user) {
    router.replace("/login");
    return null;
  }

  if (gateText) {
    return (
      <div className="container">
        <div className="card" style={{ marginTop: 12 }}>
          <div className="cardBody">
            <div style={{ fontWeight: 900, fontSize: 18 }}>Admin</div>
            <div className="muted" style={{ marginTop: 8 }}>
              {gateText}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ fontWeight: 900, fontSize: 20 }}>Admin</div>
      <div className="muted" style={{ marginTop: 6 }}>
        Manage exercise library and templates. (Backend admin endpoints will persist these later.)
      </div>

      <div className="grid2" style={{ marginTop: 12 }}>
        <div className="card">
          <div className="cardBody" style={{ display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 850 }}>Add exercise</div>
            <label>
              <div style={{ fontWeight: 650, fontSize: 12 }}>Name</div>
              <input className="input" value={exName} onChange={(e) => setExName(e.target.value)} />
            </label>
            <label>
              <div style={{ fontWeight: 650, fontSize: 12 }}>Category</div>
              <input className="input" value={exCategory} onChange={(e) => setExCategory(e.target.value)} />
            </label>
            <button
              className="btn btnPrimary"
              onClick={() => addExercise({ name: exName, category: exCategory })}
            >
              Save exercise
            </button>

            <div style={{ marginTop: 10, fontWeight: 850 }}>Exercises</div>
            <div style={{ display: "grid", gap: 8 }}>
              {exercises.map((e) => (
                <div key={e.id} className="card" style={{ boxShadow: "none" }}>
                  <div className="cardBody" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ fontWeight: 850 }}>{e.name}</div>
                    <span className="badge">{e.category}</span>
                  </div>
                </div>
              ))}
              {exercises.length === 0 && <div className="muted">No exercises yet.</div>}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="cardBody" style={{ display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 850 }}>Add template</div>
            <label>
              <div style={{ fontWeight: 650, fontSize: 12 }}>Name</div>
              <input className="input" value={tplName} onChange={(e) => setTplName(e.target.value)} />
            </label>
            <label>
              <div style={{ fontWeight: 650, fontSize: 12 }}>Description</div>
              <textarea className="input" rows={3} value={tplDesc} onChange={(e) => setTplDesc(e.target.value)} />
            </label>
            <button className="btn btnPrimary" onClick={() => addTemplate({ name: tplName, description: tplDesc })}>
              Save template
            </button>

            <div style={{ marginTop: 10, fontWeight: 850 }}>Templates</div>
            <div style={{ display: "grid", gap: 8 }}>
              {templates.map((t) => (
                <div key={t.id} className="card" style={{ boxShadow: "none" }}>
                  <div className="cardBody">
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <div style={{ fontWeight: 850 }}>{t.name}</div>
                      <span className="badge">Template</span>
                    </div>
                    <div className="muted" style={{ marginTop: 6 }}>
                      {t.description}
                    </div>
                  </div>
                </div>
              ))}
              {templates.length === 0 && <div className="muted">No templates yet.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
