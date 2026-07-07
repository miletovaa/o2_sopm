import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function UploadNewVersionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const sop = await prisma.sop.findUnique({
    where: { id },
    include: {
      analysisType: true,
      foodCategory: true,
      versions: { orderBy: { versionNumber: "desc" }, take: 1 },
    },
  });

  if (!sop) {
    notFound();
  }

  const currentVersion = sop.versions[0];

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-12">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {sop.analysisType.name} / {sop.foodCategory.name}
        </p>
        <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
          Upload new version — {sop.title}
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Current version: v{currentVersion?.versionNumber ?? 0}
        </p>
      </div>
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
          className="mt-2 rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Upload new version
        </button>
      </form>
    </div>
  );
}
