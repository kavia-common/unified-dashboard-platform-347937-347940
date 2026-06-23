"use client";

import React, { useMemo, useState } from "react";
import { createShareArtifact, resolveShareArtifact } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function SharePage() {
  const { getIdToken } = useAuth();
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [resolved, setResolved] = useState<any>(null);

  const shareText = useMemo(() => {
    const lines: string[] = [];
    lines.push("Fitness update:");
    lines.push("• Sharing is now backed by a server-generated share token.");
    lines.push("Built with my Fitness Dashboard.");
    return lines.join("\n");
  }, []);

  return (
    <div className="container">
      <div style={{ fontWeight: 900, fontSize: 20 }}>Social Sharing</div>
      <div className="muted" style={{ marginTop: 6 }}>
        Create a backend share token (private/auth) and resolve it (public) to verify sharing works end-to-end.
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="cardBody" style={{ display: "grid", gap: 12 }}>
          <div style={{ fontWeight: 850 }}>Share text</div>
          <textarea className="input" rows={8} readOnly value={shareText} />
          <button
            className="btn btnPrimary"
            onClick={async () => {
              await navigator.clipboard.writeText(shareText);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
          >
            {copied ? "Copied!" : "Copy to clipboard"}
          </button>

          {error ? <div style={{ color: "#b91c1c" }}>{error}</div> : null}

          <div className="grid2">
            <button
              className="btn btnPrimary"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setError(null);
                try {
                  const token = await getIdToken();
                  const created = await createShareArtifact(
                    {
                      artifact_type: "summary",
                      title: "Fitness update",
                      description: shareText,
                      is_public: true
                    },
                    token
                  );
                  setShareToken(created.share_token);
                  setResolved(null);
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Failed to create share token");
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? "Creating..." : "Create share token"}
            </button>
            <button
              className="btn"
              disabled={busy || !shareToken}
              onClick={async () => {
                if (!shareToken) return;
                setBusy(true);
                setError(null);
                try {
                  const res = await resolveShareArtifact(shareToken);
                  setResolved(res);
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Failed to resolve share token");
                } finally {
                  setBusy(false);
                }
              }}
            >
              Resolve token (public)
            </button>
          </div>

          {shareToken ? (
            <div className="card" style={{ boxShadow: "none" }}>
              <div className="cardBody" style={{ display: "grid", gap: 8 }}>
                <div style={{ fontWeight: 800 }}>Share token</div>
                <code style={{ wordBreak: "break-all" }}>{shareToken}</code>
                <div className="muted" style={{ fontSize: 12 }}>
                  Public resolve endpoint: <code>/api/share/{shareToken}</code>
                </div>
              </div>
            </div>
          ) : null}

          {resolved ? (
            <div className="card" style={{ boxShadow: "none" }}>
              <div className="cardBody" style={{ display: "grid", gap: 8 }}>
                <div style={{ fontWeight: 800 }}>Resolved payload (public)</div>
                <pre style={{ margin: 0, fontSize: 12, overflowX: "auto" }}>
                  {JSON.stringify(resolved, null, 2)}
                </pre>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
