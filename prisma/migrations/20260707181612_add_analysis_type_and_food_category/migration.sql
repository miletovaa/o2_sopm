/*
  Warnings:

  - You are about to drop the column `category` on the `Sop` table. All the data in the column will be lost.
  - Added the required column `analysisTypeId` to the `Sop` table without a default value. This is not possible if the table is not empty.
  - Added the required column `foodCategoryId` to the `Sop` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sop" DROP COLUMN "category",
ADD COLUMN     "analysisTypeId" TEXT NOT NULL,
ADD COLUMN     "foodCategoryId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "AnalysisType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalysisType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FoodCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnalysisType_name_key" ON "AnalysisType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FoodCategory_name_key" ON "FoodCategory"("name");

-- CreateIndex
CREATE INDEX "Sop_analysisTypeId_idx" ON "Sop"("analysisTypeId");

-- CreateIndex
CREATE INDEX "Sop_foodCategoryId_idx" ON "Sop"("foodCategoryId");

-- AddForeignKey
ALTER TABLE "Sop" ADD CONSTRAINT "Sop_analysisTypeId_fkey" FOREIGN KEY ("analysisTypeId") REFERENCES "AnalysisType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sop" ADD CONSTRAINT "Sop_foodCategoryId_fkey" FOREIGN KEY ("foodCategoryId") REFERENCES "FoodCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
