import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { DocxViewer } from "@/components/DocxViewer";

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

  const currentVersion = sop.versions[0];
  const olderVersions = sop.versions.slice(1);
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
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
        {sop.title}
      </h1>
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Version {currentVersion.versionNumber} — uploaded{" "}
          {currentVersion.uploadedAt.toLocaleString()} by{" "}
          {currentVersion.uploadedBy.username}
        </p>
        <div className="flex items-center gap-2">
          <a
            href={`/api/sops/${sop.id}/versions/${currentVersion.versionNumber}/file`}
            className="rounded border border-black/10 px-3 py-1 text-xs font-medium text-black hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/10"
          >
            Download original (.docx)
          </a>
          {isEmployee && (
            <a
              href={`/sops/${sop.id}/edit`}
              className="rounded bg-black px-3 py-1 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Upload new version
            </a>
          )}
        </div>
      </div>

      <DocxViewer
        src={`/api/sops/${sop.id}/versions/${currentVersion.versionNumber}/file`}
      />

      {isEmployee && (
        <div className="mt-4 flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-black dark:text-zinc-50">
            Version history
          </h2>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-xs uppercase text-zinc-500 dark:border-white/10 dark:text-zinc-400">
                <th className="py-2 pr-4">Version</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Author</th>
                <th className="py-2 pr-4">Change note</th>
                <th className="py-2">Download</th>
              </tr>
            </thead>
            <tbody>
              {sop.versions.map((version) => (
                <tr
                  key={version.id}
                  className="border-b border-black/5 dark:border-white/5"
                >
                  <td className="py-2 pr-4 text-zinc-700 dark:text-zinc-300">
                    v{version.versionNumber}
                    {version.id === currentVersion.id && (
                      <span className="ml-2 rounded bg-zinc-200 px-1.5 py-0.5 text-xs text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                        current
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-4 text-zinc-700 dark:text-zinc-300">
                    {version.uploadedAt.toLocaleString()}
                  </td>
                  <td className="py-2 pr-4 text-zinc-700 dark:text-zinc-300">
                    {version.uploadedBy.username}
                  </td>
                  <td className="py-2 pr-4 text-zinc-700 dark:text-zinc-300">
                    {version.changeNote ?? "—"}
                  </td>
                  <td className="py-2">
                    <a
                      href={`/api/sops/${sop.id}/versions/${version.versionNumber}/file`}
                      className="text-black hover:underline dark:text-zinc-50"
                    >
                      Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {olderVersions.length === 0 && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              No prior versions yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
