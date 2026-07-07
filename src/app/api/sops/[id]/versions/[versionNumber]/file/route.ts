import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { resolveUploadPath } from "@/lib/storage";

const DOCX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

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

  // Everyone with access to the SOP can download the current version; only
  // Employees can reach older, superseded versions.
  const isCurrentVersion = sop.versions[0]?.id === version.id;
  if (!isCurrentVersion && session.user.role !== "EMPLOYEE") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const buffer = await readFile(resolveUploadPath(version.filePath));
  const filename = `${sop.title} v${version.versionNumber}.docx`.replace(
    /[/\\]/g,
    "-",
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": DOCX_MIME_TYPE,
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
