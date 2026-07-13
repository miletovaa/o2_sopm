-- CreateTable
CREATE TABLE "Instrument" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Instrument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Instrument_name_key" ON "Instrument"("name");

-- AlterTable
ALTER TABLE "Sop" ADD COLUMN "instrumentId" TEXT;

-- CreateIndex
CREATE INDEX "Sop_instrumentId_idx" ON "Sop"("instrumentId");

-- AddForeignKey
ALTER TABLE "Sop" ADD CONSTRAINT "Sop_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "Instrument"("id") ON DELETE SET NULL ON UPDATE CASCADE;
