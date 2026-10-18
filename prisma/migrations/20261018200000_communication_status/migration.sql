-- CreateEnum
CREATE TYPE "CommunicationStatus" AS ENUM ('PLANNED', 'WRITING', 'WRITTEN', 'PUBLISHED', 'CANCELLED');

-- AlterTable
ALTER TABLE "communications" ADD COLUMN "status" "CommunicationStatus" NOT NULL DEFAULT 'PLANNED';

-- Dated announcements were already published
UPDATE "communications" SET "status" = 'PUBLISHED' WHERE "publishedAt" IS NOT NULL;
