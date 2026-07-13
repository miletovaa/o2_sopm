import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { resolveUploadPath } from "@/lib/storage";
import { guessContentType } from "@/lib/mimeType";
import { contentDisposition } from "@/lib/contentDisposition";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const safetyMaterial = await prisma.safetyMaterial.findUnique({
    where: { id },
  });
  if (!safetyMaterial) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const buffer = await readFile(resolveUploadPath(safetyMaterial.filePath));
  const filename = safetyMaterial.originalFilename.replace(/[/\\]/g, "-");

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": guessContentType(filename),
      "Content-Disposition": contentDisposition("attachment", filename),
    },
  });
}
