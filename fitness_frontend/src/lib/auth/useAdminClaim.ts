"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";

// PUBLIC_INTERFACE
export function useAdminClaim(user: User | null) {
  /** React hook that resolves whether the current Firebase user has an `admin` custom claim. */
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      try {
        if (!user) {
          if (mounted) setIsAdmin(false);
          return;
        }
        const tokenResult = await user.getIdTokenResult();
        const claim = Boolean((tokenResult.claims as Record<string, unknown>)["admin"]);
        // Cache on the user object so nav gating can be immediate after first resolution.
        (user as unknown as { __isAdmin?: boolean }).__isAdmin = claim;
        if (mounted) setIsAdmin(claim);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [user]);

  return { isAdmin, loading };
}
