import { z } from "zod";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/error";
import { fieldErrors } from "../../utils/content";
import { notifyAdminOfInquiry } from "../notifications/email";

const inquirySchema = z.object({
  name: z.string().trim().min(2, "Name must be 2–100 characters.").max(100),
  email: z.string().trim().email("Enter a valid email address.").max(160),
  phone: z.string().trim().max(30, "Phone must be at most 30 characters.").optional().or(z.literal("")),
  message: z.string().trim().min(10, "Message must be 10–2000 characters.").max(2000),
});

export async function createInquiry(body: unknown) {
  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    throw new AppError(400, "Validation failed", fieldErrors(parsed.error));
  }

  const phone = parsed.data.phone?.trim() || null;
  const inquiry = await prisma.inquiry.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      phone,
      message: parsed.data.message,
    },
  });

  await prisma.adminNotice.create({
    data: {
      kind: "INQUIRY",
      title: "New message",
      body: `${inquiry.name} (${inquiry.email}) sent a message.`,
      inquiryId: inquiry.id,
    },
  });

  await notifyAdminOfInquiry({
    inquiryId: inquiry.id,
    name: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone,
    message: inquiry.message,
    submittedAt: inquiry.createdAt,
  });

  return {
    data: {
      id: inquiry.id,
      createdAt: inquiry.createdAt.toISOString(),
    },
  };
}
