-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'USER';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "permissions" JSONB NOT NULL DEFAULT '[]',
ALTER COLUMN "role" SET DEFAULT 'USER';
