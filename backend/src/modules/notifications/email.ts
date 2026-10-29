import nodemailer from "nodemailer";
import { env, isSmtpConfigured } from "../../config/env";
import { prisma } from "../../config/prisma";
import { logger } from "../../utils/logger";

type ApplicationNotification = {
  applicationId: string;
  applicantName: string;
  phoneNumber: string;
  skillName: string;
  expectedRate: number;
  experienceYears: number;
  projectName: string;
  location: string;
  submittedAt: Date;
};

function sanitizeFailureReason(reason: string): string {
  return reason.replace(/\s+/g, " ").trim().slice(0, 500);
}

async function recordFailure(applicationId: string, reason: string) {
  await prisma.notificationFailure.create({
    data: {
      applicationId,
      reason: sanitizeFailureReason(reason),
    },
  });
}

type InquiryNotification = {
  inquiryId: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  submittedAt: Date;
};

export async function notifyAdminOfInquiry(payload: InquiryNotification): Promise<void> {
  if (!isSmtpConfigured) {
    logger.info("Inquiry saved without email", { inquiryId: payload.inquiryId });
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER
        ? {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
          }
        : undefined,
    });

    const text = [
      "A visitor sent a message from the website.",
      "",
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      `Phone: ${payload.phone ?? "Not supplied"}`,
      `Submitted: ${payload.submittedAt.toISOString()}`,
      "",
      payload.message,
      "",
      `Review in admin: ${env.FRONTEND_URL.replace(/\/$/, "")}/admin`,
    ].join("\n");

    await transporter.sendMail({
      from: env.SMTP_FROM,
      to: env.ADMIN_NOTIFICATION_EMAIL,
      replyTo: payload.email,
      subject: `New website message — ${payload.name}`,
      text,
    });
  } catch {
    logger.warn("Inquiry notification email failed", { inquiryId: payload.inquiryId });
  }
}

export async function notifyAdminOfApplication(payload: ApplicationNotification): Promise<void> {
  if (!isSmtpConfigured) {
    await recordFailure(payload.applicationId, "SMTP not configured");
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER
        ? {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
          }
        : undefined,
    });

    const submitted = payload.submittedAt.toISOString();
    const adminLink = `${env.FRONTEND_URL.replace(/\/$/, "")}/admin`;
    const text = [
      "A new worker application was submitted.",
      "",
      `Applicant name: ${payload.applicantName}`,
      `Phone: ${payload.phoneNumber}`,
      `Skill: ${payload.skillName}`,
      `Expected daily rate: ${payload.expectedRate} ETB`,
      `Years of experience: ${payload.experienceYears}`,
      `Project: ${payload.projectName}`,
      `Location: ${payload.location}`,
      `Application ID: ${payload.applicationId}`,
      `Submitted: ${submitted}`,
      "",
      `Review in admin: ${adminLink}`,
    ].join("\n");

    await transporter.sendMail({
      from: env.SMTP_FROM,
      to: env.ADMIN_NOTIFICATION_EMAIL,
      subject: `New Worker Application — ${payload.projectName}`,
      text,
    });
  } catch {
    logger.warn("Application notification email failed", {
      applicationId: payload.applicationId,
    });
    await recordFailure(payload.applicationId, "Email delivery failed");
  }
}
