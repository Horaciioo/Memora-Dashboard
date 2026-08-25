-- CreateEnum
CREATE TYPE "TrainingBlockKind" AS ENUM ('TEXT', 'QUIZ');

-- CreateTable
CREATE TABLE "training_chapters" (
    "id" TEXT NOT NULL,
    "trainingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_blocks" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "kind" "TrainingBlockKind" NOT NULL,
    "body" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_questions" (
    "id" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "multiple" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_choices" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "correct" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "quiz_choices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "junior_answers" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "choiceIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "correct" BOOLEAN NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "junior_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "training_chapters_trainingId_position_idx" ON "training_chapters"("trainingId", "position");

-- CreateIndex
CREATE INDEX "training_blocks_chapterId_position_idx" ON "training_blocks"("chapterId", "position");

-- CreateIndex
CREATE INDEX "quiz_questions_blockId_position_idx" ON "quiz_questions"("blockId", "position");

-- CreateIndex
CREATE INDEX "quiz_choices_questionId_position_idx" ON "quiz_choices"("questionId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "junior_answers_questionId_accountId_key" ON "junior_answers"("questionId", "accountId");

-- AddForeignKey
ALTER TABLE "training_chapters" ADD CONSTRAINT "training_chapters_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES "trainings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_blocks" ADD CONSTRAINT "training_blocks_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "training_chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "training_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_choices" ADD CONSTRAINT "quiz_choices_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "quiz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "junior_answers" ADD CONSTRAINT "junior_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "quiz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "junior_answers" ADD CONSTRAINT "junior_answers_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
