-- CreateEnum
CREATE TYPE "TrainingStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'DONE', 'ABANDONED');

-- AlterTable
ALTER TABLE "training_records" ADD COLUMN     "abandonedAt" TIMESTAMP(3),
ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "juniorId" TEXT,
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "status" "TrainingStatus" NOT NULL DEFAULT 'NOT_STARTED';

-- CreateIndex
CREATE INDEX "training_records_juniorId_idx" ON "training_records"("juniorId");

-- AddForeignKey
ALTER TABLE "training_records" ADD CONSTRAINT "training_records_juniorId_fkey" FOREIGN KEY ("juniorId") REFERENCES "academy_juniors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: a stored line always means something was at least started
UPDATE "training_records" SET "status" = 'DONE' WHERE "completedAt" IS NOT NULL;
UPDATE "training_records" SET "status" = 'IN_PROGRESS' WHERE "completedAt" IS NULL;
UPDATE "training_records" SET "startedAt" = "createdAt";

-- Backfill: provenance only when the account carries exactly one FSI, left null otherwise
UPDATE "training_records" tr
SET "juniorId" = single."id"
FROM (
  SELECT "accountId", MIN("id") AS "id"
  FROM "academy_juniors"
  GROUP BY "accountId"
  HAVING COUNT(*) = 1
) AS single
WHERE tr."accountId" = single."accountId";
