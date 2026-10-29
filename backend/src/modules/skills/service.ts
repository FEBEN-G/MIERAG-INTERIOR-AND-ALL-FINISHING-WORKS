import { prisma } from "../../config/prisma";

export async function listActiveSkills() {
  const skills = await prisma.skillCategory.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });

  return { data: skills };
}
