import { z } from "zod";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/error";
import { fieldErrors } from "../../utils/content";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const readSchema = z.object({
  read: z.boolean({ required_error: "Read state is required." }),
});

function toNotice(row: {
  id: string;
  kind: "APPLICATION" | "INQUIRY";
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
  inquiry: { id: string; name: string; email: string; phone: string | null; message: string } | null;
}) {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    body: row.body,
    read: row.read,
    createdAt: row.createdAt.toISOString(),
    inquiry: row.inquiry,
  };
}

const include = {
  inquiry: { select: { id: true, name: true, email: true, phone: true, message: true } },
} as const;

export async function listNotices() {
  const rows = await prisma.adminNotice.findMany({
    include,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const unread = rows.filter((row) => !row.read).length;
  return { data: rows.map(toNotice), meta: { unread } };
}

export async function markNotice(noticeId: string, body: unknown) {
  if (!UUID_PATTERN.test(noticeId)) throw new AppError(404, "Notice not found");
  const parsed = readSchema.safeParse(body);
  if (!parsed.success) throw new AppError(400, "Validation failed", fieldErrors(parsed.error));
  const existing = await prisma.adminNotice.findUnique({ where: { id: noticeId }, select: { id: true } });
  if (!existing) throw new AppError(404, "Notice not found");
  const row = await prisma.adminNotice.update({
    where: { id: noticeId },
    data: { read: parsed.data.read },
    include,
  });
  return { data: toNotice(row) };
}
