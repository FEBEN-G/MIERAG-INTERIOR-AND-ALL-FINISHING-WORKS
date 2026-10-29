import { filterPreviewSites, getPreviewSite, type SiteFilters } from "@/lib/data/projects";
import { previewSkills } from "@/lib/data/skills";
import { apiFetch, isApiConfigured } from "@/lib/api/client";
import type { Site, SiteListResponse, SkillCategory } from "@/types";

function queryString(filters: SiteFilters) {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.skill) params.set("skill", filters.skill);
  if (filters.location) params.set("location", filters.location);
  if (filters.search) params.set("search", filters.search);
  if (filters.minRate != null) params.set("minRate", String(filters.minRate));
  if (filters.maxRate != null) params.set("maxRate", String(filters.maxRate));
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
  const value = params.toString();
  return value ? `?${value}` : "";
}

export async function getSites(filters: SiteFilters = {}): Promise<SiteListResponse> {
  if (!isApiConfigured()) {
    return filterPreviewSites(filters);
  }

  return apiFetch<SiteListResponse>(`/api/sites${queryString(filters)}`);
}

const MAX_PAGE_SIZE = 50;

/** Fetches every matching site, following pages (the API returns at most 50 per page). */
export async function getAllSites(filters: Omit<SiteFilters, "page" | "pageSize"> = {}): Promise<SiteListResponse> {
  const first = await getSites({ ...filters, page: 1, pageSize: MAX_PAGE_SIZE });
  const data = [...first.data];
  for (let page = 2; data.length < first.meta.total; page += 1) {
    const next = await getSites({ ...filters, page, pageSize: MAX_PAGE_SIZE });
    if (next.data.length === 0) break;
    data.push(...next.data);
  }
  return { ...first, data, meta: { ...first.meta, page: 1, pageSize: data.length } };
}

export async function getSite(id: string): Promise<Site> {
  if (!isApiConfigured()) {
    const site = getPreviewSite(id);
    if (!site) {
      throw Object.assign(new Error("This project could not be found."), { status: 404 });
    }
    return site;
  }

  const result = await apiFetch<{ data: Site }>(`/api/sites/${id}`);
  return result.data;
}

export async function getSkills(): Promise<SkillCategory[]> {
  if (!isApiConfigured()) return previewSkills;
  const result = await apiFetch<{ data: SkillCategory[] }>("/api/skills");
  return result.data;
}
