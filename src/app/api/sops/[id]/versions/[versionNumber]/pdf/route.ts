import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { canManageContent } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { pdfPathFor, resolveUploadPath } from "@/lib/storage";
import { contentDisposition } from "@/lib/contentDisposition";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; versionNumber: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, versionNumber: versionNumberParam } = await params;
  const versionNumber = Number(versionNumberParam);
  if (!Number.isInteger(versionNumber)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const sop = await prisma.sop.findUnique({
    where: { id },
    include: { versions: { orderBy: { versionNumber: "desc" } } },
  });
  if (!sop) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const version = sop.versions.find((v) => v.versionNumber === versionNumber);
  if (!version) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Same rule as the .docx download: current version is visible to anyone
  // with access to the SOP, older versions are Employee-only.
  const isCurrentVersion = sop.versions[0]?.id === version.id;
  if (!isCurrentVersion && !canManageContent(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const buffer = await readFile(resolveUploadPath(pdfPathFor(version.filePath)));
  const filename = `${sop.title} v${version.versionNumber}.pdf`.replace(
    /[/\\]/g,
    "-",
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      // inline (not attachment) so it renders in the <iframe>/browser's
      // native PDF viewer instead of triggering a download.
      "Content-Disposition": contentDisposition("inline", filename),
    },
  });
}
