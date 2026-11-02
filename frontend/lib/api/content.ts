import { apiFetch } from "@/lib/api/client";
import type { ImageSlot } from "@/lib/site-images";
import type { ApplicationStatus, GalleryItem, Site, SiteStatus, SkillCategory } from "@/types";

export const POST_CATEGORIES = [
  "interior",
  "exterior",
  "living",
  "kitchens",
  "bathrooms",
  "flooring",
  "ceilings",
  "painting",
] as const;

export type PostCategory = (typeof POST_CATEGORIES)[number];

export type WorkPost = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: PostCategory;
  imageUrl: string;
  published: boolean;
  customized: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PostInput = {
  title: string;
  description: string;
  category: PostCategory;
  imageUrl: string;
  published: boolean;
};

export type SiteInput = {
  name: string;
  description: string;
  status: SiteStatus;
  address: string;
  estimatedDuration: string;
  coverImageUrl: string;
  compensationMin: number | null;
  compensationMax: number | null;
  compensationNote?: string;
  currentWorkerCount: number;
  isPreview: boolean;
  latitude: number | null;
  longitude: number | null;
  startDate: string | null;
  expectedCompletionDate: string | null;
  requiredSkills: { skillCategoryId: string; workersNeeded: number | null }[];
};

export type AdminSkill = SkillCategory & { isActive: boolean };

export type SiteSettings = {
  contact: { phone: string; email: string; address: string };
  images: Partial<Record<ImageSlot, string>>;
};

export type SiteSettingsPatch = {
  contact?: SiteSettings["contact"];
  images?: Partial<Record<ImageSlot, string | null>>;
};

export type InquiryInput = {
  name: string;
  email: string;
  phone?: string;
  message: string;
};

export type AdminNotice = {
  id: string;
  kind: "APPLICATION" | "INQUIRY";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  inquiry: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    message: string;
  } | null;
};

export function toGalleryItem(post: WorkPost): GalleryItem {
  return {
    id: post.id,
    title: post.title,
    category: post.category,
    description: post.description,
    // Built-in posts keep their translated captions until the admin edits them.
    captionKey: post.customized ? null : post.slug,
    image: {
      src: post.imageUrl,
      alt: post.title,
      credit: "ከMIERAG ስቱዲዮ የታተመ።",
    },
  };
}

export async function getPublishedPosts() {
  const result = await apiFetch<{ data: WorkPost[] }>("/api/posts");
  return result.data;
}

export async function getAdminPosts() {
  const result = await apiFetch<{ data: WorkPost[] }>("/api/admin/posts");
  return result.data;
}

export async function savePost(input: PostInput, id?: string) {
  const result = await apiFetch<{ data: WorkPost }>(id ? `/api/admin/posts/${id}` : "/api/admin/posts", {
    method: id ? "PATCH" : "POST",
    body: JSON.stringify(input),
  });
  return result.data;
}

export async function deletePost(id: string) {
  await apiFetch<void>(`/api/admin/posts/${id}`, { method: "DELETE" });
}

export async function saveSite(input: SiteInput, id?: string) {
  const result = await apiFetch<{ data: Site }>(id ? `/api/admin/sites/${id}` : "/api/admin/sites", {
    method: id ? "PATCH" : "POST",
    body: JSON.stringify(input),
  });
  return result.data;
}

export async function deleteSite(id: string) {
  await apiFetch<void>(`/api/admin/sites/${id}`, { method: "DELETE" });
}

export async function getAdminSkills() {
  const result = await apiFetch<{ data: AdminSkill[] }>("/api/admin/skills");
  return result.data;
}

export async function saveSkill(input: { name?: string; isActive?: boolean }, id?: string) {
  const result = await apiFetch<{ data: AdminSkill }>(id ? `/api/admin/skills/${id}` : "/api/admin/skills", {
    method: id ? "PATCH" : "POST",
    body: JSON.stringify(input),
  });
  return result.data;
}

export async function getSiteSettings() {
  const result = await apiFetch<{ data: SiteSettings }>("/api/settings");
  return result.data;
}

export async function updateSiteSettings(patch: SiteSettingsPatch) {
  const result = await apiFetch<{ data: SiteSettings }>("/api/admin/settings", {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return result.data;
}

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export async function uploadImage(file: File) {
  const result = await apiFetch<{ data: { url: string } }>("/api/admin/uploads", {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
  });
  return result.data.url;
}

export async function submitInquiry(input: InquiryInput) {
  return apiFetch<{ data: { id: string; createdAt: string } }>("/api/inquiries", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getNotices() {
  return apiFetch<{ data: AdminNotice[]; meta: { unread: number } }>("/api/admin/notices");
}

export async function deleteNotice(id: string) {
  await apiFetch<void>(`/api/admin/notices/${id}`, { method: "DELETE" });
}

export async function markNotice(id: string, read: boolean) {
  await apiFetch(`/api/admin/notices/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ read }),
  });
}

export type { ApplicationStatus, SkillCategory };
