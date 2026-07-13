import path from "node:path";
import { rm } from "node:fs/promises";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { resolveUploadPath } from "@/lib/storage";

// Renames a safety material. The file itself is untouched.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (session?.user?.role !== "EMPLOYEE") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const name = body?.name;

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const safetyMaterial = await prisma.safetyMaterial.findUnique({
    where: { id },
  });
  if (!safetyMaterial) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.safetyMaterial.update({
    where: { id },
    data: { name: name.trim() },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (session?.user?.role !== "EMPLOYEE") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const safetyMaterial = await prisma.safetyMaterial.findUnique({
    where: { id },
  });
  if (!safetyMaterial) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.safetyMaterial.delete({ where: { id } });
  await rm(resolveUploadPath(path.join("safety-materials", id)), {
    recursive: true,
    force: true,
  });

  return NextResponse.json({ ok: true });
}
