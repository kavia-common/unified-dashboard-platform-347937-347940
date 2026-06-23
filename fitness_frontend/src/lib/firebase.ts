import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";

/**
 * Initializes Firebase client-side SDK.
 * If config is missing, we still export a stable auth object but login flows will show a helpful error.
 */
function initFirebase(): FirebaseApp | null {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!apiKey || !authDomain || !projectId) return null;

  if (getApps().length > 0) return getApps()[0]!;
  return initializeApp({
    apiKey,
    authDomain,
    projectId,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  });
}

export const firebaseApp = initFirebase();
export const firebaseAuth = getAuth(firebaseApp ?? initializeApp({ apiKey: "missing", projectId: "missing", appId: "missing" }));
