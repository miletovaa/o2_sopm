-- RenameColumn
ALTER TABLE "ReferenceMaterial" RENAME COLUMN "title" TO "name";

-- DropColumn
ALTER TABLE "ReferenceMaterial" DROP COLUMN "url";

-- AlterColumn
ALTER TABLE "ReferenceMaterial" ALTER COLUMN "filePath" SET NOT NULL;

-- AddColumn
ALTER TABLE "ReferenceMaterial" ADD COLUMN "originalFilename" TEXT NOT NULL;
