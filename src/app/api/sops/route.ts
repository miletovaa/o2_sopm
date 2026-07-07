import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { extractDocx } from "@/lib/docx";
import { saveSopVersionFile } from "@/lib/storage";
import { findOrCreateAnalysisType, findOrCreateFoodCategory } from "@/lib/taxonomy";

const DOCX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "EMPLOYEE") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const title = formData.get("title");
  const analysisTypeName = formData.get("analysisType");
  const foodCategoryName = formData.get("foodCategory");
  const file = formData.get("file");

  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof analysisTypeName !== "string" ||
    !analysisTypeName.trim() ||
    typeof foodCategoryName !== "string" ||
    !foodCategoryName.trim() ||
    !(file instanceof File)
  ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const looksLikeDocx =
    file.name.toLowerCase().endsWith(".docx") ||
    file.type === DOCX_MIME_TYPE;
  if (!looksLikeDocx) {
    return NextResponse.json(
      { error: "Only .docx files are supported" },
      { status: 400 },
    );
  }

  const [analysisType, foodCategory] = await Promise.all([
    findOrCreateAnalysisType(analysisTypeName),
    findOrCreateFoodCategory(foodCategoryName),
  ]);

  const buffer = Buffer.from(await file.arrayBuffer());
  const { html, text } = await extractDocx(buffer);

  // Generate the id up front so the file can be written to its final,
  // deterministic path before either DB row exists. The Sop + SopVersion
  // rows are then created together in one transaction, so a mid-write
  // failure never leaves an orphan Sop with no version pointing at it.
  const sopId = randomUUID();
  const relativeFilePath = await saveSopVersionFile(sopId, 1, buffer);

  await prisma.$transaction([
    prisma.sop.create({
      data: {
        id: sopId,
        title: title.trim(),
        analysisTypeId: analysisType.id,
        foodCategoryId: foodCategory.id,
      },
    }),
    prisma.sopVersion.create({
      data: {
        sopId,
        versionNumber: 1,
        filePath: relativeFilePath,
        extractedHtml: html,
        extractedText: text,
        uploadedById: session.user.id,
      },
    }),
  ]);

  return NextResponse.redirect(new URL(`/sops/${sopId}`, request.url), {
    status: 303,
  });
}
