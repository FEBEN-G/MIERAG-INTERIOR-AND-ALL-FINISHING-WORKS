export const SITE_STATUSES = [
  "STRUCTURAL_WORK",
  "ROUGH_IN",
  "FINAL_FINISHING",
  "COMPLETED",
] as const;

export type SiteStatus = (typeof SITE_STATUSES)[number];

export const APPLICATION_STATUSES = [
  "PENDING",
  "REVIEWED",
  "SHORTLISTED",
  "CONTACTED",
  "ACCEPTED",
  "REJECTED",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export type SkillCategory = {
  id: string;
  name: string;
  slug: string;
  workersNeeded?: number | null;
};

export type Site = {
  id: string;
  name: string;
  description: string;
  status: SiteStatus;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  estimatedDuration: string;
  startDate?: string | null;
  expectedCompletionDate?: string | null;
  currentWorkerCount: number;
  coverImageUrl: string;
  compensationMin?: number | null;
  compensationMax?: number | null;
  compensationNote?: string | null;
  isPreview: boolean;
  isRecruiting: boolean;
  requiredSkills: SkillCategory[];
  createdAt: string;
  updatedAt: string;
};

export type SiteListResponse = {
  data: Site[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    source: "api" | "preview";
  };
  stats: {
    total: number;
    active: number;
    completed: number;
    recruiting: number;
  };
};

export type ApplicationPayload = {
  siteId: string;
  fullName: string;
  phoneNumber: string;
  skillCategoryId: string;
  expectedRate: number;
  experienceYears: number;
  experienceDetails?: string;
};

export type ApplicationResult = {
  id: string;
  status: ApplicationStatus;
  createdAt: string;
};

export type ApiError = {
  error: {
    message: string;
    fields?: Record<string, string>;
  };
};

export type GalleryCategory =
  | "all"
  | "interior"
  | "exterior"
  | "living"
  | "kitchens"
  | "bathrooms"
  | "flooring"
  | "ceilings"
  | "painting";

export type GalleryItem = {
  id: string;
  title: string;
  category: Exclude<GalleryCategory, "all">;
  description: string;
  location?: string;
  image: PreviewImage;
};

export type PreviewImage = {
  src: string;
  alt: string;
  credit: string;
};

export type BeforeAfterPair = {
  id: string;
  title: string;
  description: string;
  before: PreviewImage;
  after: PreviewImage;
};

export type ServiceItem = {
  id: string;
  number: string;
  title: string;
  description: string;
  image: PreviewImage;
};

export type NavItem = {
  href: string;
  label: string;
  index: string;
};
