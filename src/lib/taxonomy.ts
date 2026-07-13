import { prisma } from "@/lib/prisma";

export async function findOrCreateAnalysisType(
  name: string,
  parentId: string | null,
) {
  const trimmed = name.trim();
  const existing = await prisma.analysisType.findFirst({
    where: { name: trimmed, parentId },
  });
  if (existing) return existing;
  return prisma.analysisType.create({ data: { name: trimmed, parentId } });
}

// Cascades up to 3 levels (e.g. Isotope Analysis > BSIA > CN), find-or-creating
// each level under its parent. Levels 2 and 3 are optional — most analysis
// types have no subtype. Returns the deepest level provided, which is what
// gets stored as the Sop's analysisTypeId.
export async function resolveAnalysisType(
  level1: string,
  level2?: string | null,
  level3?: string | null,
) {
  const root = await findOrCreateAnalysisType(level1, null);
  if (!level2?.trim()) return root;

  const sub = await findOrCreateAnalysisType(level2, root.id);
  if (!level3?.trim()) return sub;

  return findOrCreateAnalysisType(level3, sub.id);
}

export async function findOrCreateFoodCategory(name: string) {
  const trimmed = name.trim();
  return prisma.foodCategory.upsert({
    where: { name: trimmed },
    update: {},
    create: { name: trimmed },
  });
}

export async function findOrCreateInstrument(name: string) {
  const trimmed = name.trim();
  return prisma.instrument.upsert({
    where: { name: trimmed },
    update: {},
    create: { name: trimmed },
  });
}
