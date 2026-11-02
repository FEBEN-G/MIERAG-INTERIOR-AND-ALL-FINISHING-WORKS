import { z } from "zod";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/error";
import { fieldErrors, imageUrlSchema } from "../../utils/content";
import { publishedServices } from "../services/service";

/** Every replaceable image on the public site. Keep in sync with frontend/lib/site-images.ts. */
export const IMAGE_SLOTS = [
  "logo",
  "hero",
  "about1",
  "about2",
  "before",
  "after",
  "galleryBanner",
  "contactBackground",
] as const;

/** Homepage sections that can be hidden. Keep in sync with frontend/lib/site-images.ts. */
export const SECTIONS = ["services", "about", "work", "transformation", "projects", "contact"] as const;

const CONTACT_FIELDS = ["phone", "email", "address", "companyName"] as const;
const IMAGE_PREFIX = "image.";
const CONTACT_PREFIX = "contact.";
const TEXT_PREFIX = "text.";
const HIDDEN_SECTIONS_KEY = "layout.hiddenSections";

const textOverrides = z
  .record(
    z.string().max(120).regex(/^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*$/, "Unknown text item."),
    z.string().max(3000, "Text must be at most 3000 characters.").nullable(),
  )
  .optional();

const settingsSchema = z.object({
  contact: z
    .object({
      phone: z.string().trim().max(40, "Phone must be at most 40 characters."),
      email: z.string().trim().email("Enter a valid email address.").max(160).or(z.literal("")),
      address: z.string().trim().max(200, "Address must be at most 200 characters."),
      companyName: z.string().trim().max(120, "Company name must be at most 120 characters."),
    })
    .optional(),
  images: z.record(z.enum(IMAGE_SLOTS), imageUrlSchema.nullable()).optional(),
  text: z.object({ am: textOverrides, en: textOverrides }).optional(),
  hiddenSections: z.array(z.enum(SECTIONS)).optional(),
});

export async function getSettings() {
  const [rows, services] = await Promise.all([prisma.siteSetting.findMany(), publishedServices()]);
  const contact = { phone: "", email: "", address: "", companyName: "" };
  const images: Record<string, string> = {};
  const text: { am: Record<string, string>; en: Record<string, string> } = { am: {}, en: {} };
  let hiddenSections: string[] = [];

  for (const row of rows) {
    if (row.key === HIDDEN_SECTIONS_KEY) {
      hiddenSections = row.value.split(",").filter(Boolean);
    } else if (row.key.startsWith(IMAGE_PREFIX)) {
      images[row.key.slice(IMAGE_PREFIX.length)] = row.value;
    } else if (row.key.startsWith(CONTACT_PREFIX)) {
      const field = row.key.slice(CONTACT_PREFIX.length) as (typeof CONTACT_FIELDS)[number];
      if (CONTACT_FIELDS.includes(field)) contact[field] = row.value;
    } else if (row.key.startsWith(TEXT_PREFIX)) {
      const rest = row.key.slice(TEXT_PREFIX.length);
      const locale = rest.slice(0, 2);
      if (locale === "am" || locale === "en") text[locale][rest.slice(3)] = row.value;
    }
  }
  return { data: { contact, images, text, hiddenSections, services } };
}

/**
 * Null removes a setting, restoring the site default. An empty contact field does the same;
 * empty website text is kept, so a sentence can be blanked out on purpose.
 */
export async function updateSettings(body: unknown) {
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    throw new AppError(400, "Validation failed", fieldErrors(parsed.error));
  }

  const changes: { key: string; value: string | null }[] = [];
  for (const field of CONTACT_FIELDS) {
    const value = parsed.data.contact?.[field];
    if (value !== undefined) changes.push({ key: `${CONTACT_PREFIX}${field}`, value: value || null });
  }
  for (const [slot, value] of Object.entries(parsed.data.images ?? {})) {
    changes.push({ key: `${IMAGE_PREFIX}${slot}`, value });
  }
  for (const locale of ["am", "en"] as const) {
    for (const [path, value] of Object.entries(parsed.data.text?.[locale] ?? {})) {
      changes.push({ key: `${TEXT_PREFIX}${locale}.${path}`, value });
    }
  }
  if (parsed.data.hiddenSections) {
    changes.push({ key: HIDDEN_SECTIONS_KEY, value: parsed.data.hiddenSections.join(",") || null });
  }

  await prisma.$transaction(
    changes.map(({ key, value }) =>
      value === null
        ? prisma.siteSetting.deleteMany({ where: { key } })
        : prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } }),
    ),
  );
  return getSettings();
}
