import path from "node:path";
import { rm } from "node:fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { canManageContent } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { resolveUploadPath } from "@/lib/storage";
import { publicUrl } from "@/lib/public-url";
import {
  findOrCreateFoodCategory,
  findOrCreateInstrument,
  resolveAnalysisType,
} from "@/lib/taxonomy";

// Updates title / analysis type (+ subtypes) / food category / instrument.
// Does not touch versions or files.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session || !canManageContent(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const sop = await prisma.sop.findUnique({ where: { id } });
  if (!sop) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const title = formData.get("title");
  const analysisTypeLevel1 = formData.get("analysisTypeLevel1");
  const analysisTypeLevel2 = formData.get("analysisTypeLevel2");
  const analysisTypeLevel3 = formData.get("analysisTypeLevel3");
  const foodCategoryName = formData.get("foodCategory");
  const instrumentName = formData.get("instrument");
  const referenceMaterialIds = formData
    .getAll("referenceMaterialIds")
    .filter((v): v is string => typeof v === "string");

  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof analysisTypeLevel1 !== "string" ||
    !analysisTypeLevel1.trim() ||
    typeof foodCategoryName !== "string" ||
    !foodCategoryName.trim()
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const [analysisType, foodCategory, instrument] = await Promise.all([
    resolveAnalysisType(
      analysisTypeLevel1,
      typeof analysisTypeLevel2 === "string" ? analysisTypeLevel2 : null,
      typeof analysisTypeLevel3 === "string" ? analysisTypeLevel3 : null,
    ),
    findOrCreateFoodCategory(foodCategoryName),
    typeof instrumentName === "string" && instrumentName.trim()
      ? findOrCreateInstrument(instrumentName)
      : Promise.resolve(null),
  ]);

  await prisma.sop.update({
    where: { id },
    data: {
      title: title.trim(),
      analysisTypeId: analysisType.id,
      foodCategoryId: foodCategory.id,
      instrumentId: instrument?.id ?? null,
      // `set` (not `connect`) so deselecting a reference material in the
      // multi-select actually detaches it, not just leaves it un-added.
      referenceMaterials: { set: referenceMaterialIds.map((rid) => ({ id: rid })) },
    },
  });

  return NextResponse.redirect(publicUrl(request, `/sops/${id}`), {
    status: 303,
  });
}

// Deletes the SOP, cascading to all its versions (DB-level ON DELETE
// CASCADE), then best-effort removes the whole uploads/sops/<id> directory.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session || !canManageContent(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const sop = await prisma.sop.findUnique({ where: { id } });
  if (!sop) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.sop.delete({ where: { id } });
  await rm(resolveUploadPath(path.join("sops", id)), {
    recursive: true,
    force: true,
  });

  return NextResponse.json({ ok: true });
}
