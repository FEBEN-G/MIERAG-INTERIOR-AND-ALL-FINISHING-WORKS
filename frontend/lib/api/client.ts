import type { ApiError } from "@/types";

export const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export function isApiConfigured() {
  return process.env.NEXT_PUBLIC_API_URL !== undefined;
}

/** The API's per-field messages when it sent them, otherwise its general message. */
export function errorMessage(err: unknown, fallback: string) {
  if (!(err instanceof Error)) return fallback;
  const fields = (err as Error & { fields?: Record<string, string> }).fields;
  const details = fields ? Object.values(fields) : [];
  return details.length > 0 ? details.join(" ") : err.message || fallback;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "include",
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const body = (await response.json().catch(() => null)) as T | ApiError | null;

  // The studio session ended (it lasts 8 hours): go to sign-in instead of showing a failed save.
  if (response.status === 401 && path.startsWith("/api/admin/") && !path.startsWith("/api/admin/auth/") && typeof window !== "undefined" && window.location.pathname !== "/admin/login") {
    // A full reload also discards the studio's data; this file has no router.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/admin/login");
  }

  if (!response.ok) {
    const message =
      body && typeof body === "object" && "error" in body
        ? body.error.message
        : "The request could not be completed. Please try again.";
    const error = new Error(message) as Error & { fields?: Record<string, string>; status: number };
    error.status = response.status;
    if (body && typeof body === "object" && "error" in body) {
      error.fields = body.error.fields;
    }
    throw error;
  }

  return body as T;
}
