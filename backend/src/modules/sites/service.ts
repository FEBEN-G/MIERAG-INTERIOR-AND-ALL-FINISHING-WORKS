import { Prisma, SiteStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/error";
import { fieldErrors, imageUrlSchema } from "../../utils/content";

const SITE_STATUSES = new Set<string>(Object.values(SiteStatus));

const siteInclude = {
  requiredSkills: {
    include: {
      skillCategory: {
        select: { id: true, name: true, slug: true },
      },
    },
  },
} satisfies Prisma.SiteInclude;

type SiteWithSkills = Prisma.SiteGetPayload<{ include: typeof siteInclude }>;

export type SiteDto = {
  id: string;
  name: string;
  description: string;
  status: SiteStatus;
  address: string;
  latitude: number | null;
  longitude: number | null;
  estimatedDuration: string;
  startDate: string | null;
  expectedCompletionDate: string | null;
  currentWorkerCount: number;
  coverImageUrl: string;
  compensationMin: number | null;
  compensationMax: number | null;
  compensationNote: string | null;
  isPreview: boolean;
  isRecruiting: boolean;
  requiredSkills: {
    id: string;
    name: string;
    slug: string;
    workersNeeded: number | null;
  }[];
  createdAt: string;
  updatedAt: string;
};

function toSiteDto(site: SiteWithSkills): SiteDto {
  return {
    id: site.id,
    name: site.name,
    description: site.description,
    status: site.status,
    address: site.address,
    latitude: site.latitude,
    longitude: site.longitude,
    estimatedDuration: site.estimatedDuration,
    startDate: site.startDate?.toISOString() ?? null,
    expectedCompletionDate: site.expectedCompletionDate?.toISOString() ?? null,
    currentWorkerCount: site.currentWorkerCount,
    coverImageUrl: site.coverImageUrl,
    compensationMin: site.compensationMin,
    compensationMax: site.compensationMax,
    compensationNote: site.compensationNote,
    isPreview: site.isPreview,
    isRecruiting: site.status !== SiteStatus.COMPLETED,
    requiredSkills: site.requiredSkills.map((item) => ({
      id: item.skillCategory.id,
      name: item.skillCategory.name,
      slug: item.skillCategory.slug,
      workersNeeded: item.workersNeeded,
    })),
    createdAt: site.createdAt.toISOString(),
    updatedAt: site.updatedAt.toISOString(),
  };
}

function firstString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) {
    return value[0].trim();
  }
  return undefined;
}

function optionalInt(value: unknown, field: string): number | undefined {
  const raw = firstString(value);
  if (raw === undefined) {
    return undefined;
  }
  const parsed = Number(raw);
  if (!Number.isInteger(parsed)) {
    throw new AppError(400, "Invalid query parameter", { [field]: `Must be an integer` });
  }
  return parsed;
}

export async function listSites(query: Record<string, unknown>) {
  const statusParam = firstString(query.status);
  const skill = firstString(query.skill);
  const location = firstString(query.location);
  const search = firstString(query.search);
  const minRate = optionalInt(query.minRate, "minRate");
  const maxRate = optionalInt(query.maxRate, "maxRate");
  const page = Math.max(1, optionalInt(query.page, "page") ?? 1);
  const requestedPageSize = optionalInt(query.pageSize, "pageSize") ?? 12;
  const pageSize = Math.min(50, Math.max(1, requestedPageSize));

  if (statusParam && !SITE_STATUSES.has(statusParam)) {
    throw new AppError(400, "Invalid query parameter", {
      status: "Must be a valid project status",
    });
  }

  if (minRate !== undefined && minRate < 0) {
    throw new AppError(400, "Invalid query parameter", { minRate: "Must be non-negative" });
  }
  if (maxRate !== undefined && maxRate < 0) {
    throw new AppError(400, "Invalid query parameter", { maxRate: "Must be non-negative" });
  }

  const where: Prisma.SiteWhereInput = {};
  const andFilters: Prisma.SiteWhereInput[] = [];

  if (statusParam) {
    where.status = statusParam as SiteStatus;
  }

  if (location) {
    andFilters.push({ address: { contains: location, mode: "insensitive" } });
  }

  if (search) {
    andFilters.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (skill) {
    andFilters.push({
      requiredSkills: {
        some: {
          skillCategory: { slug: skill },
        },
      },
    });
  }

  if (minRate !== undefined || maxRate !== undefined) {
    const rateFilter: Prisma.SiteWhereInput[] = [];
    if (minRate !== undefined) {
      rateFilter.push({
        OR: [{ compensationMax: null }, { compensationMax: { gte: minRate } }],
      });
    }
    if (maxRate !== undefined) {
      rateFilter.push({
        OR: [{ compensationMin: null }, { compensationMin: { lte: maxRate } }],
      });
    }
    andFilters.push({ AND: rateFilter });
  }

  if (andFilters.length > 0) {
    where.AND = andFilters;
  }

  const [rows, total, allCount, completedCount] = await prisma.$transaction([
    prisma.site.findMany({
      where,
      include: siteInclude,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.site.count({ where }),
    prisma.site.count(),
    prisma.site.count({ where: { status: SiteStatus.COMPLETED } }),
  ]);

  const active = allCount - completedCount;

  return {
    data: rows.map(toSiteDto),
    meta: {
      total,
      page,
      pageSize,
      source: "api" as const,
    },
    stats: {
      total: allCount,
      active,
      completed: completedCount,
      recruiting: active,
    },
  };
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getSiteById(siteId: string): Promise<SiteDto> {
  if (!UUID_PATTERN.test(siteId)) {
    throw new AppError(404, "Project not found");
  }

  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: siteInclude,
  });

  if (!site) {
    throw new AppError(404, "Project not found");
  }

  return toSiteDto(site);
}

const siteWriteSchema = z.object({
  name: z.string().trim().min(2, "Name must be 2–140 characters.").max(140),
  description: z.string().trim().min(10, "Description must be 10–4000 characters.").max(4000),
  status: z.enum(["STRUCTURAL_WORK", "ROUGH_IN", "FINAL_FINISHING", "COMPLETED"]),
  address: z.string().trim().min(2, "Address must be 2–200 characters.").max(200),
  estimatedDuration: z.string().trim().min(2, "Duration must be 2–80 characters.").max(80),
  coverImageUrl: imageUrlSchema,
  compensationMin: z.number().int().nonnegative().nullable().optional(),
  compensationMax: z.number().int().nonnegative().nullable().optional(),
  compensationNote: z.string().trim().max(300).optional(),
  currentWorkerCount: z.number().int().nonnegative().max(500).default(0),
  isPreview: z.boolean().default(true),
  skillCategoryIds: z.array(z.string().uuid()).max(12).default([]),
});

async function parseSiteWrite(body: unknown) {
  const parsed = siteWriteSchema.safeParse(body);
  if (!parsed.success) {
    throw new AppError(400, "Validation failed", fieldErrors(parsed.error));
  }
  const input = parsed.data;
  if (
    input.compensationMin != null &&
    input.compensationMax != null &&
    input.compensationMin > input.compensationMax
  ) {
    throw new AppError(400, "Validation failed", {
      compensationMax: "Maximum rate must be greater than or equal to the minimum.",
    });
  }
  if (input.skillCategoryIds.length > 0) {
    const found = await prisma.skillCategory.count({
      where: { id: { in: input.skillCategoryIds }, isActive: true },
    });
    if (found !== input.skillCategoryIds.length) {
      throw new AppError(400, "Validation failed", {
        skillCategoryIds: "One or more skills are not available.",
      });
    }
  }
  return input;
}

function siteData(input: z.infer<typeof siteWriteSchema>) {
  return {
    name: input.name,
    description: input.description,
    status: input.status as SiteStatus,
    address: input.address,
    estimatedDuration: input.estimatedDuration,
    coverImageUrl: input.coverImageUrl,
    compensationMin: input.compensationMin ?? null,
    compensationMax: input.compensationMax ?? null,
    compensationNote: input.compensationNote?.trim() || null,
    currentWorkerCount: input.currentWorkerCount,
    isPreview: input.isPreview,
  };
}

export async function createSite(body: unknown) {
  const input = await parseSiteWrite(body);
  const site = await prisma.site.create({
    data: {
      ...siteData(input),
      requiredSkills: {
        create: input.skillCategoryIds.map((skillCategoryId) => ({ skillCategoryId })),
      },
    },
    include: siteInclude,
  });
  return { data: toSiteDto(site) };
}

export async function updateSite(siteId: string, body: unknown) {
  if (!UUID_PATTERN.test(siteId)) throw new AppError(404, "Project not found");
  const input = await parseSiteWrite(body);
  const existing = await prisma.site.findUnique({ where: { id: siteId }, select: { id: true } });
  if (!existing) throw new AppError(404, "Project not found");
  const site = await prisma.$transaction(async (tx) => {
    // Keep the workers-needed count for skills that stay selected; the admin form does not edit it.
    const current = await tx.siteRequiredSkill.findMany({
      where: { siteId },
      select: { skillCategoryId: true, workersNeeded: true },
    });
    const workersNeeded = new Map(current.map((row) => [row.skillCategoryId, row.workersNeeded]));
    await tx.siteRequiredSkill.deleteMany({ where: { siteId } });
    return tx.site.update({
      where: { id: siteId },
      data: {
        ...siteData(input),
        requiredSkills: {
          create: input.skillCategoryIds.map((skillCategoryId) => ({
            skillCategoryId,
            workersNeeded: workersNeeded.get(skillCategoryId) ?? null,
          })),
        },
      },
      include: siteInclude,
    });
  });
  return { data: toSiteDto(site) };
}

export async function deleteSite(siteId: string) {
  if (!UUID_PATTERN.test(siteId)) throw new AppError(404, "Project not found");
  const existing = await prisma.site.findUnique({ where: { id: siteId }, select: { id: true } });
  if (!existing) throw new AppError(404, "Project not found");
  await prisma.site.delete({ where: { id: siteId } });
}
