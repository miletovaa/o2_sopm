import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { SopVersionExplorer } from "@/components/SopVersionExplorer";

export default async function SopDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [session, sop] = await Promise.all([
    auth(),
    prisma.sop.findUnique({
      where: { id },
      include: {
        analysisType: true,
        foodCategory: true,
        versions: {
          orderBy: { versionNumber: "desc" },
          include: { uploadedBy: { select: { username: true } } },
        },
      },
    }),
  ]);

  if (!sop || sop.versions.length === 0) {
    notFound();
  }

  const isEmployee = session?.user?.role === "EMPLOYEE";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-12">
      <Link
        href="/"
        className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
      >
        ← Back to SOPs
      </Link>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {sop.analysisType.name} / {sop.foodCategory.name}
      </p>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          {sop.title}
        </h1>
        {isEmployee && (
          <a
            href={`/sops/${sop.id}/edit`}
            className="rounded bg-black px-3 py-1 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Upload new version
          </a>
        )}
      </div>

      <SopVersionExplorer
        sopId={sop.id}
        showHistory={isEmployee}
        versions={sop.versions.map((version) => ({
          versionNumber: version.versionNumber,
          uploadedAt: version.uploadedAt.toISOString(),
          uploadedByUsername: version.uploadedBy.username,
          changeNote: version.changeNote,
        }))}
      />
    </div>
  );
}
