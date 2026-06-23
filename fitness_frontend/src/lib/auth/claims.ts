import type { User } from "firebase/auth";

// PUBLIC_INTERFACE
export function hasAdminClaim(user: User | null): boolean {
  /** Returns true when the user has an `admin` custom claim on their Firebase ID token. */
  // We can't synchronously read custom claims without calling getIdTokenResult(),
  // so we use a best-effort heuristic via token storage in local state.
  // The Admin page will also hard-gate via a runtime token-result fetch.
  return Boolean((user as unknown as { __isAdmin?: boolean })?.__isAdmin);
}
