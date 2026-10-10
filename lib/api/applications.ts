import { apiFetch, isApiConfigured } from "@/lib/api/client";
import type { ApplicationPayload, ApplicationResult, ApplicationStatus } from "@/types";

export async function submitApplication(payload: ApplicationPayload): Promise<ApplicationResult> {
  if (!isApiConfigured()) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
      id: `preview-${crypto.randomUUID()}`,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };
  }

  const result = await apiFetch<{ data: ApplicationResult }>("/api/applications", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return result.data;
}

export async function adminLogin(email: string, password: string) {
  return apiFetch<{ data: { email: string; role: string } }>("/api/admin/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function adminLogout() {
  return apiFetch<{ ok: boolean }>("/api/admin/auth/logout", { method: "POST" });
}

export async function getAdminMe() {
  return apiFetch<{ data: { email: string; role: string } }>("/api/admin/me");
}

export type AdminApplication = {
  id: string;
  fullName: string;
  phoneNumber: string;
  expectedRate: number;
  experienceYears: number;
  experienceDetails?: string | null;
  status: ApplicationStatus;
  createdAt: string;
  site: { id: string; name: string; address: string };
  skill: { id: string; name: string; slug: string };
};

export async function getAdminApplications() {
  const result = await apiFetch<{ data: AdminApplication[] }>("/api/admin/applications");
  return result.data;
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus) {
  return apiFetch<{ data: { id: string; status: ApplicationStatus } }>(
    `/api/admin/applications/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
}
