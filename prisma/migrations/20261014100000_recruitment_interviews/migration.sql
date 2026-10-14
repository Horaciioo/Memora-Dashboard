-- CreateEnum
CREATE TYPE "RecruitmentPlatform" AS ENUM ('DISCORD', 'TWITCH');

-- CreateEnum
CREATE TYPE "AnswerAppreciation" AS ENUM ('LIKE', 'DISLIKE');

-- AlterTable
ALTER TABLE "recruitment_sessions" ADD COLUMN     "platform" "RecruitmentPlatform" NOT NULL DEFAULT 'DISCORD',
ADD COLUMN     "questionKeys" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "recruitment_answers" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "questionKey" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "appreciation" "AnswerAppreciation",
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recruitment_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recruitment_answers_candidateId_questionKey_key" ON "recruitment_answers"("candidateId", "questionKey");

-- AddForeignKey
ALTER TABLE "recruitment_answers" ADD CONSTRAINT "recruitment_answers_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "recruitment_candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
