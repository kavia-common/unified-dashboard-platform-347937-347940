"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? "/app" : "/login");
  }, [loading, user, router]);

  return (
    <div className="container">
      <div className="card" style={{ marginTop: 24 }}>
        <div className="cardBody">
          <div style={{ fontWeight: 700, fontSize: 18 }}>Loading…</div>
          <div className="muted" style={{ marginTop: 6 }}>
            Preparing your dashboard.
          </div>
        </div>
      </div>
    </div>
  );
}
