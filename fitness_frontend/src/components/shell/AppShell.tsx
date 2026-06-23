"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ProfileDrawer } from "@/components/shell/ProfileDrawer";
import { hasAdminClaim } from "@/lib/auth/claims";

type NavItem = { href: string; label: string; adminOnly?: boolean };

const navItems: NavItem[] = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/plan", label: "Weekly Plan" },
  { href: "/app/log", label: "Log Workout" },
  { href: "/app/activity", label: "Activity" },
  { href: "/app/progress", label: "Progress" },
  { href: "/app/analytics", label: "Analytics" },
  { href: "/app/share", label: "Social Sharing" },
  { href: "/app/reminders", label: "Reminders" },
  { href: "/app/admin", label: "Admin", adminOnly: true }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, firebaseConfigured, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isAdmin = useMemo(() => hasAdminClaim(user), [user]);

  // Defensive: render a helpful state if Firebase isn't configured.
  if (!firebaseConfigured) {
    return (
      <div className="container">
        <div className="card" style={{ marginTop: 24 }}>
          <div className="cardBody">
            <div style={{ fontWeight: 800, fontSize: 18 }}>Configuration needed</div>
            <p className="muted" style={{ marginTop: 8 }}>
              Firebase client config is not set. Add NEXT_PUBLIC_FIREBASE_* variables.
            </p>
            <p className="muted">
              See <code>.env.example</code> in this container for required variables.
            </p>
            <Link className="btn btnPrimary" href="/login">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    // If a user somehow lands here, kick them to login.
    router.replace("/login");
    return null;
  }

  const filteredNav = navItems.filter((i) => !i.adminOnly || isAdmin);

  return (
    <div className="shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="navBrand">
          <div className="brandMark" aria-hidden />
          <div>
            <div style={{ fontWeight: 800 }}>Fitness</div>
            <div className="muted" style={{ fontSize: 12 }}>
              Dashboard
            </div>
          </div>
        </div>

        <nav className="navList">
          {filteredNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`navItem ${active ? "navItemActive" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span style={{ fontWeight: 650 }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <hr className="hr" />

        <button className="btn" onClick={() => setDrawerOpen(true)}>
          Profile & Settings
        </button>
        <button
          className="btn btnDanger"
          style={{ marginTop: 10 }}
          onClick={async () => {
            await logout();
            router.replace("/login");
          }}
        >
          Logout
        </button>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="btn mobileNavBtn" onClick={() => setDrawerOpen(true)}>
            Menu
          </button>
          <div style={{ fontWeight: 800 }}>Fitness Dashboard</div>
          <div style={{ flex: 1 }} />
          <span className="badge" title="Signed-in user">
            {user.email ?? "Signed in"}
          </span>
          <button className="btn" onClick={() => setDrawerOpen(true)}>
            Profile
          </button>
        </header>

        <main className="content">{children}</main>
      </div>

      {drawerOpen && <ProfileDrawer onClose={() => setDrawerOpen(false)} isAdmin={isAdmin} />}
    </div>
  );
}
