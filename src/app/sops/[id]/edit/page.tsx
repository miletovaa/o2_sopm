import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EditSopForm } from "@/components/EditSopForm";
import { buildAnalysisTypeTree } from "@/lib/analysisTypeTree";

export default async function EditSopPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [sop, analysisTypeRows, foodCategories, instruments, referenceMaterials] =
    await Promise.all([
      prisma.sop.findUnique({
        where: { id },
        include: {
          analysisType: { include: { parent: { include: { parent: true } } } },
          foodCategory: true,
          instrument: true,
          referenceMaterials: { select: { id: true } },
          versions: { orderBy: { versionNumber: "desc" }, take: 1 },
        },
      }),
      prisma.analysisType.findMany({ orderBy: { name: "asc" } }),
      prisma.foodCategory.findMany({ orderBy: { name: "asc" } }),
      prisma.instrument.findMany({ orderBy: { name: "asc" } }),
      prisma.referenceMaterial.findMany({ orderBy: { name: "asc" } }),
    ]);

  if (!sop) {
    notFound();
  }

  const currentVersion = sop.versions[0];

  // Walk from root to the SOP's chosen level so the picker starts prefilled.
  const analysisTypePath: string[] = [];
  if (sop.analysisType.parent?.parent) {
    analysisTypePath.push(sop.analysisType.parent.parent.name);
  }
  if (sop.analysisType.parent) {
    analysisTypePath.push(sop.analysisType.parent.name);
  }
  analysisTypePath.push(sop.analysisType.name);

  return (
    <div className="mx-auto my-8 flex w-full max-w-5xl flex-1 flex-col gap-10 px-4">
      <div id="details" className="flex scroll-mt-6 flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {sop.analysisType.name} / {sop.foodCategory.name}
          </p>
          <h1 className="text-xl font-semibold text-heading">
            Edit SOP details — {sop.title}
          </h1>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm sm:p-8 dark:bg-zinc-900">
          <EditSopForm
            sopId={sop.id}
            sopTitle={sop.title}
            analysisTypes={buildAnalysisTypeTree(analysisTypeRows)}
            foodCategories={foodCategories.map((f) => f.name)}
            instruments={instruments.map((i) => i.name)}
            referenceMaterials={referenceMaterials.map((r) => ({
              id: r.id,
              name: r.name,
            }))}
            initialTitle={sop.title}
            initialAnalysisTypeLevel1={analysisTypePath[0] ?? ""}
            initialAnalysisTypeLevel2={analysisTypePath[1] ?? ""}
            initialAnalysisTypeLevel3={analysisTypePath[2] ?? ""}
            initialFoodCategory={sop.foodCategory.name}
            initialInstrument={sop.instrument?.name ?? ""}
            initialReferenceMaterialIds={sop.referenceMaterials.map(
              (r) => r.id,
            )}
          />
        </div>
      </div>

      <div id="new-version" className="flex scroll-mt-6 flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-heading">
            Upload new version
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Current version: v{currentVersion?.versionNumber ?? 0}
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm sm:p-8 dark:bg-zinc-900">
          <form
            action={`/api/sops/${sop.id}/versions`}
            method="post"
            encType="multipart/form-data"
            className="flex flex-col gap-4"
          >
            <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
              Word document (.docx)
              <input
                name="file"
                type="file"
                accept=".docx"
                required
                className="rounded border border-black/10 bg-transparent px-3 py-2 text-black outline-none focus:border-black/40 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/40"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
              Change note (optional)
              <textarea
                name="changeNote"
                rows={3}
                placeholder="What changed in this version?"
                className="rounded border border-black/10 bg-transparent px-3 py-2 text-black outline-none focus:border-black/40 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/40"
              />
            </label>
            <button
              type="submit"
              className="mt-2 self-start rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
            >
              Upload new version
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
