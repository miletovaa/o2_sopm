import { prisma } from "@/lib/prisma";
import { NewSopForm } from "@/components/NewSopForm";
import { buildAnalysisTypeTree } from "@/lib/analysisTypeTree";

export default async function NewSopPage() {
  const [analysisTypeRows, foodCategories, instruments, referenceMaterials] =
    await Promise.all([
      prisma.analysisType.findMany({ orderBy: { name: "asc" } }),
      prisma.foodCategory.findMany({ orderBy: { name: "asc" } }),
      prisma.instrument.findMany({ orderBy: { name: "asc" } }),
      prisma.referenceMaterial.findMany({ orderBy: { name: "asc" } }),
    ]);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-12">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
        Upload new SOP
      </h1>
      <NewSopForm
        analysisTypes={buildAnalysisTypeTree(analysisTypeRows)}
        foodCategories={foodCategories.map((f) => f.name)}
        instruments={instruments.map((i) => i.name)}
        referenceMaterials={referenceMaterials.map((r) => ({
          id: r.id,
          name: r.name,
        }))}
      />
    </div>
  );
}
