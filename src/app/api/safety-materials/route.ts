import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { saveSafetyMaterialFile } from "@/lib/storage";

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "EMPLOYEE") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const name = formData.get("name");
  const file = formData.get("file");

  if (typeof name !== "string" || !name.trim() || !(file instanceof File)) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const id = randomUUID();
  const buffer = Buffer.from(await file.arrayBuffer());
  const relativeFilePath = await saveSafetyMaterialFile(id, buffer);

  await prisma.safetyMaterial.create({
    data: {
      id,
      name: name.trim(),
      filePath: relativeFilePath,
      originalFilename: file.name,
    },
  });

  return NextResponse.redirect(new URL("/safety-materials", request.url), {
    status: 303,
  });
}
