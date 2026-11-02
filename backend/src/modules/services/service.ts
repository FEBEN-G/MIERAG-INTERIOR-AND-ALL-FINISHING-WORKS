import { z } from "zod";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/error";
import { fieldErrors, imageUrlSchema, reorderSchema, slugFromTitle } from "../../utils/content";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const title = z.string().trim().min(2, "Titles must be 2–120 characters.").max(120, "Titles must be 2–120 characters.");
const description = z
  .string()
  .trim()
  .min(2, "Descriptions must be 2–800 characters.")
  .max(800, "Descriptions must be 2–800 characters.");

const serviceSchema = z.object({
  titleAm: title,
  titleEn: title,
  descriptionAm: description,
  descriptionEn: description,
  imageUrl: imageUrlSchema,
  published: z.boolean().default(true),
});

const select = {
  id: true,
  slug: true,
  titleAm: true,
  titleEn: true,
  descriptionAm: true,
  descriptionEn: true,
  imageUrl: true,
  published: true,
} as const;

const order = [{ sortOrder: "asc" }, { createdAt: "asc" }] as const;

export function publishedServices() {
  return prisma.service.findMany({ where: { published: true }, select, orderBy: [...order] });
}

export async function listAllServices() {
  return { data: await prisma.service.findMany({ select, orderBy: [...order] }) };
}

function parseService(body: unknown) {
  const parsed = serviceSchema.safeParse(body);
  if (!parsed.success) throw new AppError(400, "Validation failed", fieldErrors(parsed.error));
  return parsed.data;
}

export async function createService(body: unknown) {
  const input = parseService(body);
  const last = await prisma.service.aggregate({ _max: { sortOrder: true } });
  const row = await prisma.service.create({
    data: { ...input, slug: slugFromTitle(input.titleEn, "service"), sortOrder: (last._max.sortOrder ?? 0) + 1 },
    select,
  });
  return { data: row };
}

async function assertExists(serviceId: string) {
  if (!UUID_PATTERN.test(serviceId)) throw new AppError(404, "Service not found");
  const existing = await prisma.service.findUnique({ where: { id: serviceId }, select: { id: true } });
  if (!existing) throw new AppError(404, "Service not found");
}

export async function updateService(serviceId: string, body: unknown) {
  await assertExists(serviceId);
  const input = parseService(body);
  return { data: await prisma.service.update({ where: { id: serviceId }, data: input, select }) };
}

export async function deleteService(serviceId: string) {
  await assertExists(serviceId);
  await prisma.service.delete({ where: { id: serviceId } });
}

export async function reorderServices(body: unknown) {
  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) throw new AppError(400, "Validation failed", fieldErrors(parsed.error));
  await prisma.$transaction(
    parsed.data.ids.map((id, index) =>
      prisma.service.updateMany({ where: { id }, data: { sortOrder: index + 1 } }),
    ),
  );
  return listAllServices();
}
