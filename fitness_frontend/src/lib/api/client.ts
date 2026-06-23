import { z } from "zod";

export const ApiErrorSchema = z.object({
  detail: z.union([z.string(), z.array(z.any())]).optional()
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

export function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL || "").replace(/\/+$/, "");
}

// PUBLIC_INTERFACE
export async function apiFetch<T>(
  path: string,
  opts: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    token?: string | null;
    body?: unknown;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  /** Fetch wrapper for the backend API using NEXT_PUBLIC_BACKEND_API_BASE_URL and Firebase ID token. */
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      "Backend API base URL is not configured. Set NEXT_PUBLIC_BACKEND_API_BASE_URL in the frontend environment."
    );
  }

  const res = await fetch(`${base}${path.startsWith("/") ? path : `/${path}`}`, {
    method: opts.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
      ...(opts.headers ?? {})
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });

  if (!res.ok) {
    const text = await res.text();
    let parsed: ApiError | null = null;
    try {
      parsed = ApiErrorSchema.parse(JSON.parse(text));
    } catch {
      parsed = null;
    }
    const msg = parsed?.detail ? JSON.stringify(parsed.detail) : text || `HTTP ${res.status}`;
    throw new Error(`API error: ${msg}`);
  }

  return (await res.json()) as T;
}
