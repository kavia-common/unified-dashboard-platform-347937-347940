"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useAdminClaim } from "@/lib/auth/useAdminClaim";
import {
  adminCreateExercise,
  adminCreateTemplate,
  createAdminContent,
  listAdminContent,
  listExercises,
  listTemplates,
  type AdminContentResponse,
  type ExerciseResponse,
  type TemplateResponse
} from "@/lib/api/client";

export default function AdminPage() {
  const router = useRouter();
  const { user, getIdToken } = useAuth();
  const { isAdmin, loading } = useAdminClaim(user);
  const [exercises, setExercises] = useState<ExerciseResponse[]>([]);
  const [templates, setTemplates] = useState<TemplateResponse[]>([]);
  const [content, setContent] = useState<AdminContentResponse[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [exName, setExName] = useState("Push-up");
  const [exCategory, setExCategory] = useState("Strength");

  const [tplName, setTplName] = useState("Full Body A");
  const [tplDesc, setTplDesc] = useState("Simple full-body template");

  const [contentType, setContentType] = useState("tip");
  const [contentTitle, setContentTitle] = useState("Protein basics");
  const [contentSlug, setContentSlug] = useState("protein-basics");
  const [contentSummary, setContentSummary] = useState("A quick reminder about hitting protein targets.");
  const [contentBody, setContentBody] = useState("Write markdown here…");

  const gateText = useMemo(() => {
    if (loading) return "Checking admin access…";
    return isAdmin ? null : "You do not have admin access.";
  }, [loading, isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    let mounted = true;
    async function run() {
      setError(null);
      try {
        const token = await getIdToken();
        const [ex, tpl, c] = await Promise.all([listExercises(token), listTemplates(token), listAdminContent(token)]);
        if (!mounted) return;
        setExercises(ex);
        setTemplates(tpl);
        setContent(c);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : "Failed to load admin data");
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [getIdToken, isAdmin]);

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
        Manage exercise library, templates, and admin content via backend admin endpoints.
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
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setError(null);
                try {
                  const token = await getIdToken();
                  const created = await adminCreateExercise(
                    { name: exName, primary_muscle_group: exCategory, is_public: true },
                    token
                  );
                  setExercises([created, ...exercises]);
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Failed to save exercise");
                } finally {
                  setBusy(false);
                }
              }}
            >
              Save exercise
            </button>

            <div style={{ marginTop: 10, fontWeight: 850 }}>Exercises</div>
            <div style={{ display: "grid", gap: 8 }}>
              {exercises.map((e) => (
                <div key={e.id} className="card" style={{ boxShadow: "none" }}>
                  <div className="cardBody" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ fontWeight: 850 }}>{e.name}</div>
                    {e.primary_muscle_group ? <span className="badge">{e.primary_muscle_group}</span> : null}
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
            <button
              className="btn btnPrimary"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setError(null);
                try {
                  const token = await getIdToken();
                  const created = await adminCreateTemplate(
                    { title: tplName, description: tplDesc, is_public: true },
                    token
                  );
                  setTemplates([created, ...templates]);
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Failed to save template");
                } finally {
                  setBusy(false);
                }
              }}
            >
              Save template
            </button>

            <div style={{ marginTop: 10, fontWeight: 850 }}>Templates</div>
            <div style={{ display: "grid", gap: 8 }}>
              {templates.map((t) => (
                <div key={t.id} className="card" style={{ boxShadow: "none" }}>
                  <div className="cardBody">
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <div style={{ fontWeight: 850 }}>{t.title}</div>
                      <span className="badge">Template</span>
                    </div>
                    <div className="muted" style={{ marginTop: 6 }}>
                      {t.description ?? "—"}
                    </div>
                  </div>
                </div>
              ))}
              {templates.length === 0 && <div className="muted">No templates yet.</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="cardBody" style={{ display: "grid", gap: 10 }}>
          <div style={{ fontWeight: 900 }}>Admin content</div>
          <div className="muted" style={{ fontSize: 12 }}>
            This is a minimal create + list UI backed by <code>/api/admin/content</code>.
          </div>

          <div className="grid2">
            <label>
              <div style={{ fontWeight: 650, fontSize: 12 }}>Content type</div>
              <input className="input" value={contentType} onChange={(e) => setContentType(e.target.value)} />
            </label>
            <label>
              <div style={{ fontWeight: 650, fontSize: 12 }}>Slug</div>
              <input className="input" value={contentSlug} onChange={(e) => setContentSlug(e.target.value)} />
            </label>
          </div>

          <label>
            <div style={{ fontWeight: 650, fontSize: 12 }}>Title</div>
            <input className="input" value={contentTitle} onChange={(e) => setContentTitle(e.target.value)} />
          </label>
          <label>
            <div style={{ fontWeight: 650, fontSize: 12 }}>Summary</div>
            <input className="input" value={contentSummary} onChange={(e) => setContentSummary(e.target.value)} />
          </label>
          <label>
            <div style={{ fontWeight: 650, fontSize: 12 }}>Body (markdown)</div>
            <textarea className="input" rows={6} value={contentBody} onChange={(e) => setContentBody(e.target.value)} />
          </label>
          <button
            className="btn btnPrimary"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError(null);
              try {
                const token = await getIdToken();
                const created = await createAdminContent(
                  {
                    content_type: contentType,
                    title: contentTitle,
                    slug: contentSlug,
                    summary: contentSummary,
                    body_markdown: contentBody,
                    tags: [],
                    is_published: false
                  },
                  token
                );
                setContent([created, ...content]);
              } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to create content");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Saving..." : "Create draft content"}
          </button>

          <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
            {content.map((c) => (
              <div key={c.id} className="card" style={{ boxShadow: "none" }}>
                <div className="cardBody" style={{ display: "grid", gap: 6 }}>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ fontWeight: 900 }}>{c.title}</div>
                    <span className="badge">{c.content_type}</span>
                    <span className="badge">{c.is_published ? "published" : "draft"}</span>
                  </div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    <code>{c.slug}</code>
                  </div>
                  {c.summary ? <div className="muted">{c.summary}</div> : null}
                </div>
              </div>
            ))}
            {content.length === 0 ? <div className="muted">No content yet.</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
