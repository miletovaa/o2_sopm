import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { extractDocxText } from "@/lib/docx";
import { convertDocxToPdf } from "@/lib/pdf";
import { saveSopVersionFile, saveSopVersionPdf } from "@/lib/storage";
import {
  findOrCreateFoodCategory,
  findOrCreateInstrument,
  resolveAnalysisType,
} from "@/lib/taxonomy";

const DOCX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "EMPLOYEE") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
  const file = formData.get("file");

  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof analysisTypeLevel1 !== "string" ||
    !analysisTypeLevel1.trim() ||
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

  const buffer = Buffer.from(await file.arrayBuffer());
  const [text, pdfBuffer] = await Promise.all([
    extractDocxText(buffer),
    convertDocxToPdf(buffer),
  ]);

  // Generate the id up front so the files can be written to their final,
  // deterministic paths before either DB row exists. The Sop + SopVersion
  // rows are then created together in one transaction, so a mid-write
  // failure never leaves an orphan Sop with no version pointing at it.
  const sopId = randomUUID();
  const [relativeFilePath] = await Promise.all([
    saveSopVersionFile(sopId, 1, buffer),
    saveSopVersionPdf(sopId, 1, pdfBuffer),
  ]);

  await prisma.$transaction([
    prisma.sop.create({
      data: {
        id: sopId,
        title: title.trim(),
        analysisTypeId: analysisType.id,
        foodCategoryId: foodCategory.id,
        instrumentId: instrument?.id,
        referenceMaterials:
          referenceMaterialIds.length > 0
            ? { connect: referenceMaterialIds.map((id) => ({ id })) }
            : undefined,
      },
    }),
    prisma.sopVersion.create({
      data: {
        sopId,
        versionNumber: 1,
        filePath: relativeFilePath,
        extractedText: text,
        uploadedById: session.user.id,
      },
    }),
  ]);

  return NextResponse.redirect(new URL(`/sops/${sopId}`, request.nextUrl), {
    status: 303,
  });
}
