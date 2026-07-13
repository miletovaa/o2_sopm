-- RenameColumn
ALTER TABLE "SafetyMaterial" RENAME COLUMN "title" TO "name";

-- DropColumn
ALTER TABLE "SafetyMaterial" DROP COLUMN "url";

-- AlterColumn
ALTER TABLE "SafetyMaterial" ALTER COLUMN "filePath" SET NOT NULL;

-- AddColumn
ALTER TABLE "SafetyMaterial" ADD COLUMN "originalFilename" TEXT NOT NULL;
