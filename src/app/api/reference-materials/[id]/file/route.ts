import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { resolveUploadPath } from "@/lib/storage";

const MIME_TYPES_BY_EXTENSION: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  csv: "text/csv",
  txt: "text/plain",
};

function guessContentType(filename: string): string {
  const extension = filename.split(".").pop()?.toLowerCase() ?? "";
  return MIME_TYPES_BY_EXTENSION[extension] ?? "application/octet-stream";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const referenceMaterial = await prisma.referenceMaterial.findUnique({
    where: { id },
  });
  if (!referenceMaterial) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const buffer = await readFile(
    resolveUploadPath(referenceMaterial.filePath),
  );
  const filename = referenceMaterial.originalFilename.replace(/[/\\]/g, "-");

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": guessContentType(filename),
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
