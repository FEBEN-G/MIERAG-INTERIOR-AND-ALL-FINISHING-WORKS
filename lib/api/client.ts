import type { ApiError } from "@/types";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export function isApiConfigured() {
  return API_BASE.length > 0;
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

  const body = (await response.json().catch(() => null)) as T | ApiError | null;

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
