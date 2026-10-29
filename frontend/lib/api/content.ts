import { apiFetch } from "@/lib/api/client";
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
  skillCategoryIds: string[];
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

export async function submitInquiry(input: InquiryInput) {
  return apiFetch<{ data: { id: string; createdAt: string } }>("/api/inquiries", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getNotices() {
  return apiFetch<{ data: AdminNotice[]; meta: { unread: number } }>("/api/admin/notices");
}

export async function markNotice(id: string, read: boolean) {
  await apiFetch(`/api/admin/notices/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ read }),
  });
}

export type { ApplicationStatus, SkillCategory };
