import { z } from "zod";

export const ApiErrorSchema = z.object({
  detail: z.union([z.string(), z.array(z.any())]).optional()
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

export function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL || "").replace(/\/*$/, "").replace(/\/+$/, "");
}

export type StartedPlannedSessionResponse = {
  workout_log_id: string;
  planned_session_id: string;
};

export type PlannedSessionStatusResponse = {
  planned_session_id: string;
  status: string;
};

export type GoalResponse = {
  id: string;
  goal_type: string;
  target: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
};

export type GoalCreateRequest = {
  goal_type: string;
  target?: string | null;
  start_date?: string | null;
  end_date?: string | null;
};

export type ActivityLogResponse = {
  id: string;
  occurred_on: string;
  steps: number | null;
  cardio_minutes: number | null;
};

export type ActivityLogCreateRequest = {
  occurred_on: string;
  steps?: number | null;
  cardio_minutes?: number | null;
};

export type BodyMetricResponse = {
  id: string;
  measured_at: string;
  weight_kg: number | null;
  body_fat_pct: number | null;
  measurements: Record<string, unknown> | null;
};

export type BodyMetricCreateRequest = {
  measured_at: string;
  weight_kg?: number | null;
  body_fat_pct?: number | null;
  measurements?: Record<string, unknown> | null;
  notes?: string | null;
};

export type PersonalRecordResponse = {
  id: string;
  pr_type: string;
  value: number;
  achieved_at: string;
};

export type PersonalRecordCreateRequest = {
  exercise_id?: string | null;
  pr_type: string;
  value: number;
  achieved_at: string;
  notes?: string | null;
};

export type NotificationScheduleResponse = {
  id: string;
  notification_type: string;
  channel: string;
  title: string | null;
  body: string | null;
  is_enabled: boolean;
  next_run_at: string | null;
};

export type NotificationScheduleCreateRequest = {
  notification_type: string;
  channel: string;
  title?: string | null;
  body?: string | null;
  cron?: string | null;
  scheduled_at?: string | null;
  timezone?: string | null;
  is_enabled?: boolean;
  meta?: Record<string, unknown> | null;
};

export type AnalyticsSummaryResponse = {
  window_days: number;
  workouts_count: number;
  steps_sum: number;
  latest_weight_kg: number | null;
};

export type ShareArtifactResponse = {
  id: string;
  artifact_type: string;
  title: string | null;
  description: string | null;
  share_token: string;
  is_public: boolean;
  expires_at: string | null;
};

export type ShareArtifactCreateRequest = {
  artifact_type: string;
  ref_table?: string | null;
  ref_id?: string | null;
  title?: string | null;
  description?: string | null;
  is_public?: boolean;
  expires_at?: string | null;
};

export type ShareArtifactResolved = {
  artifact_type: string;
  title: string | null;
  description: string | null;
  ref_table: string | null;
  ref_id: string | null;
  created_at: string;
};

export type AdminContentResponse = {
  id: string;
  content_type: string;
  title: string;
  slug: string;
  summary: string | null;
  body_markdown: string | null;
  tags: string[];
  is_published: boolean;
  published_at: string | null;
};

export type AdminContentCreateRequest = {
  content_type: string;
  title: string;
  slug: string;
  summary?: string | null;
  body_markdown?: string | null;
  tags?: string[];
  is_published?: boolean;
  published_at?: string | null;
};

export type ExerciseResponse = {
  id: string;
  name: string;
  description: string | null;
  primary_muscle_group: string | null;
  equipment: string[];
  is_public: boolean;
  is_archived: boolean;
};

export type ExerciseCreateRequest = {
  name: string;
  description?: string | null;
  primary_muscle_group?: string | null;
  secondary_muscle_groups?: string[] | null;
  equipment?: string[] | null;
  movement_pattern?: string | null;
  difficulty?: string | null;
  instructions?: string | null;
  media?: Record<string, unknown> | null;
  is_public?: boolean;
};

export type TemplateResponse = {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  is_public: boolean;
  is_archived: boolean;
};

export type TemplateCreateRequest = {
  title: string;
  description?: string | null;
  tags?: string[] | null;
  is_public?: boolean;
};

export type WorkoutLogResponse = {
  id: string;
  started_at: string;
  ended_at: string | null;
  title: string | null;
  notes: string | null;
  rpe: number | null;
};

export type WorkoutLogCreateRequest = {
  planned_session_id?: string | null;
  started_at: string;
  ended_at?: string | null;
  title?: string | null;
  notes?: string | null;
  rpe?: number | null;
  calories_burned?: number | null;
  exercises: Array<{
    exercise_id?: string | null;
    position: number;
    notes?: string | null;
    sets: Array<{
      set_number: number;
      reps?: number | null;
      weight_kg?: number | null;
      duration_seconds?: number | null;
      distance_meters?: number | null;
      is_warmup?: boolean;
      rpe?: number | null;
      notes?: string | null;
    }>;
  }>;
};

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

// PUBLIC_INTERFACE
export async function startPlannedSession(
  sessionId: string,
  token: string | null
): Promise<StartedPlannedSessionResponse> {
  /** Start a planned workout session by asking backend to create a prefilled workout_log. */
  return apiFetch<StartedPlannedSessionResponse>(`/api/plans/sessions/${sessionId}/start`, {
    method: "POST",
    token
  });
}

// PUBLIC_INTERFACE
export async function updatePlannedSessionStatus(
  sessionId: string,
  status: "planned" | "in_progress" | "completed" | "skipped" | "cancelled",
  token: string | null
): Promise<PlannedSessionStatusResponse> {
  /** Update planned session status (e.g., mark completed/skipped). */
  return apiFetch<PlannedSessionStatusResponse>(`/api/plans/sessions/${sessionId}/status`, {
    method: "PATCH",
    token,
    body: { status }
  });
}

// PUBLIC_INTERFACE
export async function listGoals(token: string | null): Promise<GoalResponse[]> {
  /** List goal history for the current user. */
  return apiFetch<GoalResponse[]>("/api/goals", { token });
}

// PUBLIC_INTERFACE
export async function createGoal(req: GoalCreateRequest, token: string | null): Promise<GoalResponse> {
  /** Create a new goal for the current user. */
  return apiFetch<GoalResponse>("/api/goals", { method: "POST", token, body: req });
}

// PUBLIC_INTERFACE
export async function listActivityLogs(token: string | null): Promise<ActivityLogResponse[]> {
  /** List activity logs for the current user. */
  return apiFetch<ActivityLogResponse[]>("/api/activity", { token });
}

// PUBLIC_INTERFACE
export async function createActivityLog(
  req: ActivityLogCreateRequest,
  token: string | null
): Promise<ActivityLogResponse> {
  /** Create an activity log entry for the current user. */
  return apiFetch<ActivityLogResponse>("/api/activity", { method: "POST", token, body: req });
}

// PUBLIC_INTERFACE
export async function listBodyMetrics(token: string | null): Promise<BodyMetricResponse[]> {
  /** List body metrics for the current user. */
  return apiFetch<BodyMetricResponse[]>("/api/progress/metrics", { token });
}

// PUBLIC_INTERFACE
export async function createBodyMetric(req: BodyMetricCreateRequest, token: string | null): Promise<BodyMetricResponse> {
  /** Create a body metric for the current user. */
  return apiFetch<BodyMetricResponse>("/api/progress/metrics", { method: "POST", token, body: req });
}

// PUBLIC_INTERFACE
export async function listPersonalRecords(token: string | null): Promise<PersonalRecordResponse[]> {
  /** List PRs for the current user. */
  return apiFetch<PersonalRecordResponse[]>("/api/progress/prs", { token });
}

// PUBLIC_INTERFACE
export async function createPersonalRecord(
  req: PersonalRecordCreateRequest,
  token: string | null
): Promise<PersonalRecordResponse> {
  /** Create a PR for the current user. */
  return apiFetch<PersonalRecordResponse>("/api/progress/prs", { method: "POST", token, body: req });
}

// PUBLIC_INTERFACE
export async function listNotificationSchedules(token: string | null): Promise<NotificationScheduleResponse[]> {
  /** List reminder/notification schedules for the current user. */
  return apiFetch<NotificationScheduleResponse[]>("/api/notifications", { token });
}

// PUBLIC_INTERFACE
export async function createNotificationSchedule(
  req: NotificationScheduleCreateRequest,
  token: string | null
): Promise<NotificationScheduleResponse> {
  /** Create a reminder/notification schedule for the current user. */
  return apiFetch<NotificationScheduleResponse>("/api/notifications", { method: "POST", token, body: req });
}

// PUBLIC_INTERFACE
export async function analyticsSummary(days: number, token: string | null): Promise<AnalyticsSummaryResponse> {
  /** Fetch analytics summary for a given lookback window. */
  return apiFetch<AnalyticsSummaryResponse>(`/api/analytics/summary?days=${encodeURIComponent(String(days))}`, { token });
}

// PUBLIC_INTERFACE
export async function createShareArtifact(
  req: ShareArtifactCreateRequest,
  token: string | null
): Promise<ShareArtifactResponse> {
  /** Create a shareable artifact and get a share token. */
  return apiFetch<ShareArtifactResponse>("/api/share", { method: "POST", token, body: req });
}

// PUBLIC_INTERFACE
export async function resolveShareArtifact(shareToken: string): Promise<ShareArtifactResolved> {
  /** Resolve a public share token (no auth). */
  return apiFetch<ShareArtifactResolved>(`/api/share/${encodeURIComponent(shareToken)}`, { method: "GET" });
}

// PUBLIC_INTERFACE
export async function listAdminContent(token: string | null): Promise<AdminContentResponse[]> {
  /** Admin-only: list content entries. */
  return apiFetch<AdminContentResponse[]>("/api/admin/content", { token });
}

// PUBLIC_INTERFACE
export async function createAdminContent(
  req: AdminContentCreateRequest,
  token: string | null
): Promise<AdminContentResponse> {
  /** Admin-only: create content entry. */
  return apiFetch<AdminContentResponse>("/api/admin/content", { method: "POST", token, body: req });
}

// PUBLIC_INTERFACE
export async function listExercises(token: string | null, q?: string): Promise<ExerciseResponse[]> {
  /** List exercises visible to current user (public + own). */
  const suffix = q ? `?q=${encodeURIComponent(q)}` : "";
  return apiFetch<ExerciseResponse[]>(`/api/exercises${suffix}`, { token });
}

// PUBLIC_INTERFACE
export async function adminCreateExercise(req: ExerciseCreateRequest, token: string | null): Promise<ExerciseResponse> {
  /** Admin-only: create a public exercise. */
  return apiFetch<ExerciseResponse>("/api/exercises", { method: "POST", token, body: req });
}

// PUBLIC_INTERFACE
export async function listTemplates(token: string | null): Promise<TemplateResponse[]> {
  /** List workout templates visible to current user (public + own). */
  return apiFetch<TemplateResponse[]>("/api/templates", { token });
}

// PUBLIC_INTERFACE
export async function adminCreateTemplate(req: TemplateCreateRequest, token: string | null): Promise<TemplateResponse> {
  /** Admin-only: create a public workout template. */
  return apiFetch<TemplateResponse>("/api/templates", { method: "POST", token, body: req });
}

// PUBLIC_INTERFACE
export async function listWorkoutLogs(token: string | null): Promise<WorkoutLogResponse[]> {
  /** List workout logs (header-level info) for the current user. */
  return apiFetch<WorkoutLogResponse[]>("/api/workouts", { token });
}

// PUBLIC_INTERFACE
export async function createWorkoutLog(req: WorkoutLogCreateRequest, token: string | null): Promise<WorkoutLogResponse> {
  /** Create a workout log (supports nested exercises/sets). */
  return apiFetch<WorkoutLogResponse>("/api/workouts", { method: "POST", token, body: req });
}
