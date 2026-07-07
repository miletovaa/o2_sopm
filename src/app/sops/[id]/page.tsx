import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function SopDetailPage({
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
      versions: {
        orderBy: { versionNumber: "desc" },
        take: 1,
        include: { uploadedBy: { select: { username: true } } },
      },
    },
  });

  if (!sop || sop.versions.length === 0) {
    notFound();
  }

  const currentVersion = sop.versions[0];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-12">
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
        <a
          href={`/api/sops/${sop.id}/versions/${currentVersion.versionNumber}/file`}
          className="rounded border border-black/10 px-3 py-1 text-xs font-medium text-black hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/10"
        >
          Download original (.docx)
        </a>
      </div>
      {/*
        Safe to render directly: this HTML comes from mammoth's docx->HTML
        conversion, which emits a fixed set of semantic tags derived from the
        document's structure (paragraphs, formatting, tables, links, images
        as data URIs) — a .docx has no mechanism to inject <script> content,
        so there is no XSS vector here the way there would be for
        user-submitted raw HTML.
      */}
      <div
        className="prose prose-zinc max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: currentVersion.extractedHtml }}
      />
    </div>
  );
}
