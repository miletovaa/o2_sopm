-- DropIndex
DROP INDEX "AnalysisType_name_key";

-- AlterTable
ALTER TABLE "AnalysisType" ADD COLUMN "parentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AnalysisType_parentId_name_key" ON "AnalysisType"("parentId", "name");

-- AddForeignKey
ALTER TABLE "AnalysisType" ADD CONSTRAINT "AnalysisType_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "AnalysisType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
