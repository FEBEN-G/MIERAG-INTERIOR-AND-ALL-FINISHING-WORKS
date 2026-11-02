import { z } from "zod";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/error";
import { fieldErrors, imageUrlSchema } from "../../utils/content";

/** Every replaceable image on the public site. Keep in sync with frontend/lib/site-images.ts. */
export const IMAGE_SLOTS = [
  "logo",
  "hero",
  "about1",
  "about2",
  "service-interior",
  "service-exterior",
  "service-gypsum",
  "service-tile",
  "service-painting",
  "service-renovation",
  "before",
  "after",
  "galleryBanner",
  "contactBackground",
] as const;

const CONTACT_FIELDS = ["phone", "email", "address"] as const;
const IMAGE_PREFIX = "image.";
const CONTACT_PREFIX = "contact.";

const settingsSchema = z.object({
  contact: z
    .object({
      phone: z.string().trim().max(40, "Phone must be at most 40 characters."),
      email: z.string().trim().email("Enter a valid email address.").max(160).or(z.literal("")),
      address: z.string().trim().max(200, "Address must be at most 200 characters."),
    })
    .optional(),
  images: z.record(z.enum(IMAGE_SLOTS), imageUrlSchema.nullable()).optional(),
});

export async function getSettings() {
  const rows = await prisma.siteSetting.findMany();
  const contact = { phone: "", email: "", address: "" };
  const images: Record<string, string> = {};
  for (const row of rows) {
    if (row.key.startsWith(IMAGE_PREFIX)) {
      images[row.key.slice(IMAGE_PREFIX.length)] = row.value;
    } else if (row.key.startsWith(CONTACT_PREFIX)) {
      const field = row.key.slice(CONTACT_PREFIX.length) as (typeof CONTACT_FIELDS)[number];
      if (CONTACT_FIELDS.includes(field)) contact[field] = row.value;
    }
  }
  return { data: { contact, images } };
}

/** An empty contact field or a null image removes the setting, restoring the site default. */
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

  await prisma.$transaction(
    changes.map(({ key, value }) =>
      value === null
        ? prisma.siteSetting.deleteMany({ where: { key } })
        : prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } }),
    ),
  );
  return getSettings();
}
