import { SiteStatus } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/error";
import { notifyAdminOfApplication } from "../notifications/email";
import { validateApplicationInput } from "./validation";

const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;

export async function createApplication(body: unknown) {
  const validation = validateApplicationInput(body);
  if (!validation.success) {
    throw new AppError(400, validation.message, validation.fields);
  }

  const input = validation.data;

  const site = await prisma.site.findUnique({
    where: { id: input.siteId },
    select: { id: true, name: true, address: true, status: true },
  });

  if (!site) {
    throw new AppError(400, "Validation failed", {
      siteId: "The selected project does not exist.",
    });
  }

  if (site.status === SiteStatus.COMPLETED) {
    throw new AppError(400, "Applications are not accepted for completed projects.", {
      siteId: "Applications are not accepted for completed projects.",
    });
  }

  const skill = await prisma.skillCategory.findUnique({
    where: { id: input.skillCategoryId },
    select: { id: true, name: true, isActive: true },
  });

  if (!skill || !skill.isActive) {
    throw new AppError(400, "Validation failed", {
      skillCategoryId: "The selected skill is not available.",
    });
  }

  const duplicate = await prisma.application.findFirst({
    where: {
      siteId: input.siteId,
      phoneNumber: input.phoneNumber,
      createdAt: { gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
    },
    select: { id: true },
  });

  if (duplicate) {
    throw new AppError(
      409,
      "An application with this phone number was already submitted for this project in the last 24 hours.",
    );
  }

  const application = await prisma.application.create({
    data: {
      siteId: input.siteId,
      fullName: input.fullName,
      phoneNumber: input.phoneNumber,
      skillCategoryId: input.skillCategoryId,
      expectedRate: input.expectedRate,
      experienceYears: input.experienceYears,
      experienceDetails: input.experienceDetails,
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
    },
  });

  await prisma.adminNotice.create({
    data: {
      kind: "APPLICATION",
      title: "New application",
      body: `${input.fullName} (${input.phoneNumber}) applied for ${site.name}.`,
    },
  });

  try {
    await notifyAdminOfApplication({
      applicationId: application.id,
      applicantName: input.fullName,
      phoneNumber: input.phoneNumber,
      skillName: skill.name,
      expectedRate: input.expectedRate,
      experienceYears: input.experienceYears,
      projectName: site.name,
      location: site.address,
      submittedAt: application.createdAt,
    });
  } catch {
    await prisma.notificationFailure.create({
      data: {
        applicationId: application.id,
        reason: "Notification processing failed",
      },
    });
  }

  return {
    data: {
      id: application.id,
      status: application.status,
      createdAt: application.createdAt.toISOString(),
    },
  };
}
