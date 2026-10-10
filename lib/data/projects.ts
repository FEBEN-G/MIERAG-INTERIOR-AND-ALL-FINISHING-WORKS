import { images } from "@/lib/assets";
import { previewSkills } from "@/lib/data/skills";
import type { Site, SiteListResponse, SiteStatus } from "@/types";

function skill(...slugs: string[]) {
  return previewSkills.filter((item) => slugs.includes(item.slug));
}

const now = "2026-03-01T00:00:00.000Z";

export const previewSites: Site[] = [
  {
    id: "preview-bole-residence",
    name: "Preview: Bole Residence Finishing",
    description:
      "[PREVIEW RECORD] Replace with an actual MIERAG site. A residential finishing sequence covering gypsum, paint, and final interior surfaces.",
    status: "FINAL_FINISHING",
    address: "Bole, Addis Ababa",
    latitude: 8.9806,
    longitude: 38.7876,
    estimatedDuration: "12 weeks",
    startDate: "2026-01-12",
    expectedCompletionDate: "2026-04-06",
    currentWorkerCount: 8,
    coverImageUrl: images.exterior.src,
    compensationMin: 800,
    compensationMax: 1400,
    compensationNote: "Daily rate by trade, confirmed on engagement.",
    isPreview: true,
    isRecruiting: true,
    requiredSkills: skill("gypsum", "painting", "flooring"),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "preview-kazanchis-apartments",
    name: "Preview: Kazanchis Apartment Interiors",
    description:
      "[PREVIEW RECORD] Replace with an actual MIERAG site. Multi-unit interior finishing with tile, wet areas, and decorative paint.",
    status: "ROUGH_IN",
    address: "Kazanchis, Addis Ababa",
    estimatedDuration: "18 weeks",
    startDate: "2026-02-02",
    expectedCompletionDate: "2026-06-08",
    currentWorkerCount: 14,
    coverImageUrl: images.kitchen.src,
    compensationMin: 700,
    compensationMax: 1300,
    isPreview: true,
    isRecruiting: true,
    requiredSkills: skill("tile-installation", "plumbing", "electrical-work"),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "preview-cmc-villa",
    name: "Preview: CMC Villa Envelope",
    description:
      "[PREVIEW RECORD] Replace with an actual MIERAG site. Exterior finishing and interior first-fix coordination on a detached residence.",
    status: "STRUCTURAL_WORK",
    address: "CMC, Addis Ababa",
    estimatedDuration: "22 weeks",
    startDate: "2026-02-20",
    expectedCompletionDate: "2026-07-24",
    currentWorkerCount: 11,
    coverImageUrl: images.facade.src,
    compensationMin: 750,
    compensationMax: 1500,
    isPreview: true,
    isRecruiting: true,
    requiredSkills: skill("carpentry", "gypsum", "other"),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "preview-old-airport",
    name: "Preview: Old Airport Townhouse",
    description:
      "[PREVIEW RECORD] Replace with an actual MIERAG site. A completed finishing record used only to demonstrate the directory’s completed state.",
    status: "COMPLETED",
    address: "Old Airport, Addis Ababa",
    estimatedDuration: "16 weeks",
    startDate: "2025-08-04",
    expectedCompletionDate: "2025-11-28",
    currentWorkerCount: 0,
    coverImageUrl: images.philosophy.src,
    compensationNote: "Recruitment closed.",
    isPreview: true,
    isRecruiting: false,
    requiredSkills: skill("painting", "flooring", "tile-installation"),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "preview-piassa-atelier",
    name: "Preview: Piassa Interior Suite",
    description:
      "[PREVIEW RECORD] Replace with an actual MIERAG site. Compact interior finishing with ceiling works and decorative surfaces.",
    status: "FINAL_FINISHING",
    address: "Piassa, Addis Ababa",
    estimatedDuration: "8 weeks",
    startDate: "2026-02-16",
    expectedCompletionDate: "2026-04-13",
    currentWorkerCount: 6,
    coverImageUrl: images.ceiling.src,
    compensationMin: 850,
    compensationMax: 1600,
    isPreview: true,
    isRecruiting: true,
    requiredSkills: skill("gypsum", "painting", "carpentry"),
    createdAt: now,
    updatedAt: now,
  },
];

export type SiteFilters = {
  status?: SiteStatus | "all" | "";
  skill?: string;
  location?: string;
  search?: string;
  minRate?: number;
  maxRate?: number;
  page?: number;
  pageSize?: number;
};

export function filterPreviewSites(filters: SiteFilters = {}): SiteListResponse {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 12;

  const filtered = previewSites.filter((site) => {
    if (filters.status && filters.status !== "all" && site.status !== filters.status) return false;
    if (filters.skill && !site.requiredSkills.some((item) => item.slug === filters.skill)) return false;
    if (filters.location && !site.address.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const haystack = `${site.name} ${site.description} ${site.address}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (filters.minRate != null && (site.compensationMax ?? site.compensationMin ?? 0) < filters.minRate) {
      return false;
    }
    if (filters.maxRate != null && (site.compensationMin ?? site.compensationMax ?? Infinity) > filters.maxRate) {
      return false;
    }
    return true;
  });

  const start = (page - 1) * pageSize;
  const statsBase = previewSites;

  return {
    data: filtered.slice(start, start + pageSize),
    meta: {
      total: filtered.length,
      page,
      pageSize,
      source: "preview",
    },
    stats: {
      total: statsBase.length,
      active: statsBase.filter((site) => site.status !== "COMPLETED").length,
      completed: statsBase.filter((site) => site.status === "COMPLETED").length,
      recruiting: statsBase.filter((site) => site.isRecruiting).length,
    },
  };
}

export function getPreviewSite(id: string) {
  return previewSites.find((site) => site.id === id) ?? null;
}
