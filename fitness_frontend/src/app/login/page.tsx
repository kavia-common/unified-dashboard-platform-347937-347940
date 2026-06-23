"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { firebaseConfigured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="container">
      <div className="card" style={{ marginTop: 24 }}>
        <div className="cardBody" style={{ display: "grid", gap: 12 }}>
          <div style={{ fontWeight: 900, fontSize: 18 }}>Login</div>
          <div className="muted">Sign in to access your dashboard.</div>

          {!firebaseConfigured && (
            <div className="card" style={{ borderColor: "rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.05)" }}>
              <div className="cardBody">
                <div style={{ fontWeight: 800, color: "var(--danger)" }}>Firebase not configured</div>
                <div className="muted" style={{ marginTop: 6 }}>
                  Set NEXT_PUBLIC_FIREBASE_* variables to enable authentication.
                </div>
              </div>
            </div>
          )}

          <label>
            <div style={{ fontWeight: 650, fontSize: 12 }}>Email</div>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </label>

          <label>
            <div style={{ fontWeight: 650, fontSize: 12 }}>Password</div>
            <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
          </label>

          {err && (
            <div className="muted" style={{ color: "var(--danger)" }}>
              {err}
            </div>
          )}

          <button
            className="btn btnPrimary"
            disabled={busy || !firebaseConfigured}
            onClick={async () => {
              setErr(null);
              setBusy(true);
              try {
                await signInWithEmailAndPassword(firebaseAuth, email, password);
                router.replace("/app");
              } catch (e) {
                setErr(e instanceof Error ? e.message : "Login failed");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>

          <div className="muted" style={{ fontSize: 13 }}>
            New here? <Link href="/register" style={{ color: "var(--primary)", fontWeight: 700 }}>Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
