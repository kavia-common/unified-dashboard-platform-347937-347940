"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { firebaseConfigured } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="container">
      <div className="card" style={{ marginTop: 24 }}>
        <div className="cardBody" style={{ display: "grid", gap: 12 }}>
          <div style={{ fontWeight: 900, fontSize: 18 }}>Create account</div>
          <div className="muted">Register and complete onboarding to personalize your plan.</div>

          <label>
            <div style={{ fontWeight: 650, fontSize: 12 }}>Display name</div>
            <input className="input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g., Alex" />
          </label>

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
                const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
                if (displayName.trim()) await updateProfile(cred.user, { displayName: displayName.trim() });
                router.replace("/onboarding");
              } catch (e) {
                setErr(e instanceof Error ? e.message : "Registration failed");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Creating…" : "Create account"}
          </button>

          <div className="muted" style={{ fontSize: 13 }}>
            Already have an account? <Link href="/login" style={{ color: "var(--primary)", fontWeight: 700 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
