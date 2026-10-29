import { z } from "zod";

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

export const imageUrlSchema = z
  .string()
  .trim()
  .min(1, "An image address is required.")
  .max(500, "The image address is too long.")
  .refine(
    (value) => value.startsWith("/") || value.startsWith("https://images.unsplash.com/"),
    "Use a site image path, such as /assets/preview/living.jpg.",
  );

export function slugFromTitle(title: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base || "post"}-${suffix}`;
}

export function fieldErrors(error: z.ZodError) {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}
