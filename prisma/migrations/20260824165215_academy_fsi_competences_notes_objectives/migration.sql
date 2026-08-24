-- CreateEnum
CREATE TYPE "NoteKind" AS ENUM ('POSITIVE', 'NEGATIVE');

-- CreateEnum
CREATE TYPE "ObjectiveStatus" AS ENUM ('OPEN', 'REACHED', 'MISSED');

-- CreateEnum
CREATE TYPE "ReviewAdvice" AS ENUM ('PASS', 'BONUS', 'STOP');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'VALIDATED', 'REJECTED');

-- AlterTable
ALTER TABLE "academy_juniors" ADD COLUMN     "bonusLives" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stage" "AcademyStage" NOT NULL DEFAULT 'PREPARATION';

-- AlterTable, new columns staged nullable so existing rows can be backfilled first
ALTER TABLE "academy_reviews" ADD COLUMN     "advice" "ReviewAdvice",
ADD COLUMN     "decidedAt" TIMESTAMP(3),
ADD COLUMN     "decidedById" TEXT,
ADD COLUMN     "decisionNote" TEXT,
ADD COLUMN     "durationMinutes" INTEGER,
ADD COLUMN     "stage" "AcademyStage",
ADD COLUMN     "status" "ReviewStatus" NOT NULL DEFAULT 'DRAFT';

-- Fold the removed axes/objectives/strategies columns into summary, nothing is lost
UPDATE "academy_reviews" SET
  "summary" = COALESCE("summary", '') ||
    CASE WHEN "axes" IS NOT NULL AND "axes"::text <> '{}'
      THEN E'\n\n**Axes**\n' || (
        SELECT string_agg('- ' || key || ': ' || value, E'\n')
        FROM jsonb_each_text("axes"::jsonb)
      )
      ELSE ''
    END ||
    CASE WHEN "objectives" IS NOT NULL AND "objectives" <> ''
      THEN E'\n\n**Objectifs**\n' || "objectives"
      ELSE ''
    END ||
    CASE WHEN "strategies" IS NOT NULL AND "strategies" <> ''
      THEN E'\n\n**Stratégies**\n' || "strategies"
      ELSE ''
    END,
  "stage" = 'REVIEW_ONE',
  "advice" = 'PASS',
  "status" = 'SUBMITTED';

-- AlterTable, columns backfilled, now enforce their final constraints
ALTER TABLE "academy_reviews" ALTER COLUMN "summary" SET NOT NULL,
ALTER COLUMN "summary" SET DEFAULT '',
ALTER COLUMN "stage" SET NOT NULL,
ALTER COLUMN "advice" SET NOT NULL;

-- AlterTable
ALTER TABLE "academy_reviews" DROP COLUMN "axes",
DROP COLUMN "objectives",
DROP COLUMN "strategies";

-- CreateTable
CREATE TABLE "junior_skills" (
    "id" TEXT NOT NULL,
    "juniorId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "percent" INTEGER NOT NULL DEFAULT 0,
    "validatorId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "junior_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "junior_notes" (
    "id" TEXT NOT NULL,
    "juniorId" TEXT NOT NULL,
    "authorId" TEXT,
    "stage" "AcademyStage" NOT NULL,
    "kind" "NoteKind" NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "junior_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "junior_objectives" (
    "id" TEXT NOT NULL,
    "juniorId" TEXT NOT NULL,
    "authorId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueAt" TIMESTAMP(3),
    "status" "ObjectiveStatus" NOT NULL DEFAULT 'OPEN',
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "junior_objectives_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "junior_skills_juniorId_skillId_key" ON "junior_skills"("juniorId", "skillId");

-- CreateIndex
CREATE INDEX "junior_notes_juniorId_createdAt_idx" ON "junior_notes"("juniorId", "createdAt");

-- CreateIndex
CREATE INDEX "junior_objectives_juniorId_position_idx" ON "junior_objectives"("juniorId", "position");

-- AddForeignKey
ALTER TABLE "junior_skills" ADD CONSTRAINT "junior_skills_juniorId_fkey" FOREIGN KEY ("juniorId") REFERENCES "academy_juniors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "junior_skills" ADD CONSTRAINT "junior_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "junior_skills" ADD CONSTRAINT "junior_skills_validatorId_fkey" FOREIGN KEY ("validatorId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "junior_notes" ADD CONSTRAINT "junior_notes_juniorId_fkey" FOREIGN KEY ("juniorId") REFERENCES "academy_juniors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "junior_notes" ADD CONSTRAINT "junior_notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "junior_objectives" ADD CONSTRAINT "junior_objectives_juniorId_fkey" FOREIGN KEY ("juniorId") REFERENCES "academy_juniors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "junior_objectives" ADD CONSTRAINT "junior_objectives_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_reviews" ADD CONSTRAINT "academy_reviews_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
