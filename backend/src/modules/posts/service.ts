import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/error";
import { POST_CATEGORIES, fieldErrors, imageUrlSchema, reorderSchema, slugFromTitle } from "../../utils/content";
import { z } from "zod";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const postSchema = z.object({
  title: z.string().trim().min(2, "Title must be 2–120 characters.").max(120),
  description: z.string().trim().min(2, "Description must be 2–800 characters.").max(800),
  category: z.enum(POST_CATEGORIES, { message: "Choose a gallery category." }),
  imageUrl: imageUrlSchema,
  published: z.boolean().default(true),
});

function toPost(row: {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  published: boolean;
  customized: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category,
    imageUrl: row.imageUrl,
    published: row.published,
    customized: row.customized,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listPosts(publishedOnly: boolean) {
  const rows = await prisma.post.findMany({
    where: publishedOnly ? { published: true } : undefined,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return { data: rows.map(toPost) };
}

function parsePost(body: unknown) {
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    throw new AppError(400, "Validation failed", fieldErrors(parsed.error));
  }
  return parsed.data;
}

export async function createPost(body: unknown) {
  const input = parsePost(body);
  const row = await prisma.post.create({
    data: {
      slug: slugFromTitle(input.title),
      title: input.title,
      description: input.description,
      category: input.category,
      imageUrl: input.imageUrl,
      published: input.published,
      customized: true,
    },
  });
  return { data: toPost(row) };
}

export async function updatePost(postId: string, body: unknown) {
  if (!UUID_PATTERN.test(postId)) throw new AppError(404, "Post not found");
  const input = parsePost(body);
  const existing = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
  if (!existing) throw new AppError(404, "Post not found");
  const row = await prisma.post.update({
    where: { id: postId },
    data: {
      title: input.title,
      description: input.description,
      category: input.category,
      imageUrl: input.imageUrl,
      published: input.published,
      customized: true,
    },
  });
  return { data: toPost(row) };
}

export async function reorderPosts(body: unknown) {
  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) throw new AppError(400, "Validation failed", fieldErrors(parsed.error));
  await prisma.$transaction(
    parsed.data.ids.map((id, index) =>
      prisma.post.updateMany({ where: { id }, data: { sortOrder: index + 1 } }),
    ),
  );
  return listPosts(false);
}

export async function deletePost(postId: string) {
  if (!UUID_PATTERN.test(postId)) throw new AppError(404, "Post not found");
  const existing = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
  if (!existing) throw new AppError(404, "Post not found");
  await prisma.post.delete({ where: { id: postId } });
}
