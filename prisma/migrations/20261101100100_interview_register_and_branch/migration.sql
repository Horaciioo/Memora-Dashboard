-- AlterTable
ALTER TABLE "recruitment_candidates" ADD COLUMN "formal" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "recruitment_answers" ADD COLUMN "branch" TEXT;
