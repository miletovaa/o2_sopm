import { rm } from "node:fs/promises";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { canManageContent } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { pdfPathFor, resolveUploadPath } from "@/lib/storage";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; versionNumber: string }> },
) {
  const session = await auth();
  if (!session || !canManageContent(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: sopId, versionNumber: versionNumberParam } = await params;
  const versionNumber = Number(versionNumberParam);
  if (!Number.isInteger(versionNumber)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const versions = await prisma.sopVersion.findMany({ where: { sopId } });
  const target = versions.find((v) => v.versionNumber === versionNumber);
  if (!target) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (versions.length <= 1) {
    return NextResponse.json(
      {
        error:
          "Can't delete the only version of a SOP — delete the SOP itself instead.",
      },
      { status: 400 },
    );
  }

  await prisma.sopVersion.delete({ where: { id: target.id } });

  await Promise.all([
    rm(resolveUploadPath(target.filePath), { force: true }),
    rm(resolveUploadPath(pdfPathFor(target.filePath)), { force: true }),
  ]);

  return NextResponse.json({ ok: true });
}
