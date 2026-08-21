import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { canManageContent } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { extractDocxText } from "@/lib/docx";
import { convertDocxToPdf } from "@/lib/pdf";
import { saveSopVersionFile, saveSopVersionPdf } from "@/lib/storage";
import { publicUrl } from "@/lib/public-url";

const DOCX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session || !canManageContent(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: sopId } = await params;

  const sop = await prisma.sop.findUnique({
    where: { id: sopId },
    include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
  });
  if (!sop) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const changeNote = formData.get("changeNote");
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const looksLikeDocx =
    file.name.toLowerCase().endsWith(".docx") || file.type === DOCX_MIME_TYPE;
  if (!looksLikeDocx) {
    return NextResponse.json(
      { error: "Only .docx files are supported" },
      { status: 400 },
    );
  }

  const nextVersionNumber = (sop.versions[0]?.versionNumber ?? 0) + 1;
  const buffer = Buffer.from(await file.arrayBuffer());
  const [text, pdfBuffer] = await Promise.all([
    extractDocxText(buffer),
    convertDocxToPdf(buffer),
  ]);
  const [relativeFilePath] = await Promise.all([
    saveSopVersionFile(sopId, nextVersionNumber, buffer),
    saveSopVersionPdf(sopId, nextVersionNumber, pdfBuffer),
  ]);

  try {
    await prisma.sopVersion.create({
      data: {
        sopId,
        versionNumber: nextVersionNumber,
        filePath: relativeFilePath,
        extractedText: text,
        changeNote:
          typeof changeNote === "string" && changeNote.trim()
            ? changeNote.trim()
            : null,
        uploadedById: session.user.id,
      },
    });
  } catch (error) {
    // Two concurrent uploads for the same SOP could both compute the same
    // "next" version number; the @@unique([sopId, versionNumber]) constraint
    // catches that instead of silently overwriting a version.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Another version was uploaded concurrently. Please retry." },
        { status: 409 },
      );
    }
    throw error;
  }

  return NextResponse.redirect(publicUrl(request, `/sops/${sopId}`), {
    status: 303,
  });
}
