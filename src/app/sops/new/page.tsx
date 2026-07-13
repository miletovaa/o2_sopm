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
    <div className="mx-auto my-8 flex w-full max-w-5xl flex-1 flex-col gap-4 px-4">
      <h1 className="text-xl font-semibold text-heading">
        Upload new SOP
      </h1>
      <div className="rounded-lg bg-white p-6 shadow-sm sm:p-8 dark:bg-zinc-900">
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
    </div>
  );
}
