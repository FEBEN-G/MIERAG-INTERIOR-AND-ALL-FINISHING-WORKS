import { ApplicationStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/error";
import { signAdminToken } from "../../middleware/auth";
import { updateApplicationStatusSchema } from "../applications/validation";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(200),
  password: z.string().min(1, "Password is required.").max(200),
});

const DUMMY_PASSWORD_HASH = bcrypt.hashSync("mierag-invalid-login-placeholder", 12);

const APPLICATION_STATUSES = new Set<string>(Object.values(ApplicationStatus));

const adminApplicationInclude = {
  site: { select: { id: true, name: true, address: true, status: true } },
  skillCategory: { select: { id: true, name: true, slug: true } },
} as const;

function toAdminApplication(row: {
  id: string;
  siteId: string;
  fullName: string;
  phoneNumber: string;
  skillCategoryId: string;
  expectedRate: number;
  experienceYears: number;
  experienceDetails: string | null;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
  site: { id: string; name: string; address: string; status: string };
  skillCategory: { id: string; name: string; slug: string };
}) {
  return {
    id: row.id,
    siteId: row.siteId,
    fullName: row.fullName,
    phoneNumber: row.phoneNumber,
    skillCategoryId: row.skillCategoryId,
    expectedRate: row.expectedRate,
    experienceYears: row.experienceYears,
    experienceDetails: row.experienceDetails,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    site: row.site,
    skill: row.skillCategory,
    skillCategory: row.skillCategory,
  };
}

function firstString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return undefined;
}

export async function login(body: unknown) {
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fields[key]) {
        fields[key] = issue.message;
      }
    }
    throw new AppError(400, "Validation failed", fields);
  }

  const email = parsed.data.email.toLowerCase();
  const admin = await prisma.admin.findUnique({ where: { email } });
  const matches = await bcrypt.compare(parsed.data.password, admin?.passwordHash ?? DUMMY_PASSWORD_HASH);

  if (!admin || admin.role !== "ADMIN" || !matches) {
    throw new AppError(401, "Invalid email or password");
  }

  return {
    email: admin.email,
    role: admin.role,
    token: signAdminToken({ id: admin.id, email: admin.email, role: admin.role }),
  };
}

export async function listApplications(query: Record<string, unknown>) {
  const statusParam = firstString(query.status);
  const siteId = firstString(query.siteId);

  if (statusParam && !APPLICATION_STATUSES.has(statusParam)) {
    throw new AppError(400, "Invalid query parameter", {
      status: "Must be a valid application status",
    });
  }

  const rows = await prisma.application.findMany({
    where: {
      ...(statusParam ? { status: statusParam as ApplicationStatus } : {}),
      ...(siteId ? { siteId } : {}),
    },
    include: adminApplicationInclude,
    orderBy: { createdAt: "desc" },
  });

  return { data: rows.map(toAdminApplication) };
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getApplicationById(applicationId: string) {
  if (!UUID_PATTERN.test(applicationId)) {
    throw new AppError(404, "Application not found");
  }

  const row = await prisma.application.findUnique({
    where: { id: applicationId },
    include: adminApplicationInclude,
  });

  if (!row) {
    throw new AppError(404, "Application not found");
  }

  return { data: toAdminApplication(row) };
}

export async function updateApplicationStatus(applicationId: string, body: unknown) {
  if (!UUID_PATTERN.test(applicationId)) {
    throw new AppError(404, "Application not found");
  }

  const parsed = updateApplicationStatusSchema.safeParse(body);
  if (!parsed.success) {
    throw new AppError(400, "Validation failed", {
      status: "A valid application status is required.",
    });
  }

  const existing = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { id: true },
  });

  if (!existing) {
    throw new AppError(404, "Application not found");
  }

  const row = await prisma.application.update({
    where: { id: applicationId },
    data: { status: parsed.data.status },
    include: adminApplicationInclude,
  });

  return { data: toAdminApplication(row) };
}
