import { prisma } from "@/lib/prisma";

export async function findOrCreateAnalysisType(name: string) {
  const trimmed = name.trim();
  return prisma.analysisType.upsert({
    where: { name: trimmed },
    update: {},
    create: { name: trimmed },
  });
}

export async function findOrCreateFoodCategory(name: string) {
  const trimmed = name.trim();
  return prisma.foodCategory.upsert({
    where: { name: trimmed },
    update: {},
    create: { name: trimmed },
  });
}
