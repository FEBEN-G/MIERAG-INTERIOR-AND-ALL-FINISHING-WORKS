import { z } from "zod";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/error";
import { fieldErrors, slugFromTitle } from "../../utils/content";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const skillName = z.string().trim().min(2, "Name must be 2–60 characters.").max(60, "Name must be 2–60 characters.");
const createSchema = z.object({ name: skillName });
const updateSchema = z.object({ name: skillName.optional(), isActive: z.boolean().optional() });

const skillSelect = { id: true, name: true, slug: true, isActive: true } as const;

export async function listActiveSkills() {
  const skills = await prisma.skillCategory.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });

  return { data: skills };
}

export async function listAllSkills() {
  const skills = await prisma.skillCategory.findMany({ select: skillSelect, orderBy: { name: "asc" } });
  return { data: skills };
}

export async function createSkill(body: unknown) {
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) throw new AppError(400, "Validation failed", fieldErrors(parsed.error));
  const skill = await prisma.skillCategory.create({
    data: { name: parsed.data.name, slug: slugFromTitle(parsed.data.name, "skill") },
    select: skillSelect,
  });
  return { data: skill };
}

export async function updateSkill(skillId: string, body: unknown) {
  if (!UUID_PATTERN.test(skillId)) throw new AppError(404, "Skill not found");
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) throw new AppError(400, "Validation failed", fieldErrors(parsed.error));
  const existing = await prisma.skillCategory.findUnique({ where: { id: skillId }, select: { id: true } });
  if (!existing) throw new AppError(404, "Skill not found");
  const skill = await prisma.skillCategory.update({
    where: { id: skillId },
    data: parsed.data,
    select: skillSelect,
  });
  return { data: skill };
}
