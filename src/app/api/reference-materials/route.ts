import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { saveReferenceMaterialFile } from "@/lib/storage";
import { publicUrl } from "@/lib/public-url";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "EMPLOYEE") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const name = formData.get("name");
  const file = formData.get("file");
  const sopIds = formData.getAll("sopIds").filter((v) => typeof v === "string");

  if (typeof name !== "string" || !name.trim() || !(file instanceof File)) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const id = randomUUID();
  const buffer = Buffer.from(await file.arrayBuffer());
  const relativeFilePath = await saveReferenceMaterialFile(id, buffer);

  await prisma.referenceMaterial.create({
    data: {
      id,
      name: name.trim(),
      filePath: relativeFilePath,
      originalFilename: file.name,
      sops:
        sopIds.length > 0
          ? { connect: sopIds.map((sopId) => ({ id: sopId as string })) }
          : undefined,
    },
  });

  return NextResponse.redirect(publicUrl(request, "/reference-materials"), {
    status: 303,
  });
}
