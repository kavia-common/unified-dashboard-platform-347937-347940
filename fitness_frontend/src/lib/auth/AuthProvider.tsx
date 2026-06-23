"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { firebaseApp, firebaseAuth } from "@/lib/firebase";

export type AuthContextValue = {
  user: User | null;
  loading: boolean;
  firebaseConfigured: boolean;
  // PUBLIC_INTERFACE
  getIdToken: () => Promise<string | null>;
  // PUBLIC_INTERFACE
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const firebaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );

  useEffect(() => {
    // If firebase wasn't configured properly, we still render the app but keep user null.
    if (!firebaseConfigured || !firebaseApp) {
      setUser(null);
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(firebaseAuth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return () => unsub();
  }, [firebaseConfigured]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      firebaseConfigured,
      // PUBLIC_INTERFACE
      getIdToken: async () => {
        if (!user) return null;
        return await user.getIdToken();
      },
      // PUBLIC_INTERFACE
      logout: async () => {
        if (!firebaseConfigured) return;
        await signOut(firebaseAuth);
      }
    }),
    [user, loading, firebaseConfigured]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** React hook that exposes the current authenticated user and helper methods. */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider />");
  return ctx;
}
