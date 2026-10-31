-- AlterTable
ALTER TABLE "recruitment_candidates" ADD COLUMN "interviewStartedAt" TIMESTAMP(3),
ADD COLUMN "verdictAt" TIMESTAMP(3);

-- Interviews already taken count as started and given a verdict
UPDATE "recruitment_candidates"
SET "interviewStartedAt" = "updatedAt", "verdictAt" = "updatedAt"
WHERE "attended" = true;
