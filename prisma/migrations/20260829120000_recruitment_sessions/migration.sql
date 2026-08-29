-- CreateEnum
CREATE TYPE "RecruitmentStatus" AS ENUM ('DRAFT', 'ANNOUNCED', 'INTERVIEWS', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RecruitmentOwner" AS ENUM ('RESPONSABLE', 'RECRUTEURS', 'BOTH');

-- CreateTable
CREATE TABLE "recruitment_sessions" (
    "id" TEXT NOT NULL,
    "youtuberId" TEXT NOT NULL,
    "functionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "RecruitmentStatus" NOT NULL DEFAULT 'DRAFT',
    "summary" TEXT,
    "instructions" TEXT NOT NULL DEFAULT '',
    "opensAt" TIMESTAMP(3),
    "closesAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recruitment_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recruitment_candidates" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "formId" TEXT,
    "recruiterId" TEXT,
    "outcomeId" TEXT,
    "interviewAt" TIMESTAMP(3),
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "review" TEXT NOT NULL DEFAULT '',
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recruitment_candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recruitment_spectators" (
    "candidateId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,

    CONSTRAINT "recruitment_spectators_pkey" PRIMARY KEY ("candidateId","accountId")
);

-- CreateTable
CREATE TABLE "recruitment_comments" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "authorId" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recruitment_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recruitment_outcomes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "accent" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isTerminal" BOOLEAN NOT NULL DEFAULT false,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recruitment_outcomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recruitment_questions" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "hint" TEXT,
    "youtuberId" TEXT,
    "functionId" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recruitment_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recruitment_step_templates" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "youtuberId" TEXT,
    "functionId" TEXT,
    "offset" INTEGER NOT NULL DEFAULT 0,
    "owner" "RecruitmentOwner" NOT NULL DEFAULT 'RESPONSABLE',
    "required" BOOLEAN NOT NULL DEFAULT false,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recruitment_step_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recruitment_steps" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "templateId" TEXT,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "owner" "RecruitmentOwner" NOT NULL DEFAULT 'RESPONSABLE',
    "offset" INTEGER NOT NULL DEFAULT 0,
    "scheduledAt" TIMESTAMP(3),
    "doneAt" TIMESTAMP(3),
    "required" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recruitment_steps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recruitment_sessions_youtuberId_status_idx" ON "recruitment_sessions"("youtuberId", "status");

-- CreateIndex
CREATE INDEX "recruitment_sessions_functionId_idx" ON "recruitment_sessions"("functionId");

-- CreateIndex
CREATE UNIQUE INDEX "recruitment_sessions_youtuberId_functionId_name_key" ON "recruitment_sessions"("youtuberId", "functionId", "name");

-- CreateIndex
CREATE INDEX "recruitment_candidates_discordId_idx" ON "recruitment_candidates"("discordId");

-- CreateIndex
CREATE INDEX "recruitment_candidates_outcomeId_position_idx" ON "recruitment_candidates"("outcomeId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "recruitment_candidates_sessionId_discordId_key" ON "recruitment_candidates"("sessionId", "discordId");

-- CreateIndex
CREATE INDEX "recruitment_spectators_accountId_idx" ON "recruitment_spectators"("accountId");

-- CreateIndex
CREATE INDEX "recruitment_comments_candidateId_createdAt_idx" ON "recruitment_comments"("candidateId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "recruitment_outcomes_name_key" ON "recruitment_outcomes"("name");

-- CreateIndex
CREATE INDEX "recruitment_outcomes_position_idx" ON "recruitment_outcomes"("position");

-- CreateIndex
CREATE INDEX "recruitment_questions_position_idx" ON "recruitment_questions"("position");

-- CreateIndex
CREATE INDEX "recruitment_questions_youtuberId_functionId_idx" ON "recruitment_questions"("youtuberId", "functionId");

-- CreateIndex
CREATE INDEX "recruitment_step_templates_position_idx" ON "recruitment_step_templates"("position");

-- CreateIndex
CREATE INDEX "recruitment_step_templates_youtuberId_functionId_idx" ON "recruitment_step_templates"("youtuberId", "functionId");

-- CreateIndex
CREATE INDEX "recruitment_steps_sessionId_position_idx" ON "recruitment_steps"("sessionId", "position");

-- AddForeignKey
ALTER TABLE "recruitment_sessions" ADD CONSTRAINT "recruitment_sessions_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_sessions" ADD CONSTRAINT "recruitment_sessions_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "job_functions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_candidates" ADD CONSTRAINT "recruitment_candidates_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "recruitment_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_candidates" ADD CONSTRAINT "recruitment_candidates_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_candidates" ADD CONSTRAINT "recruitment_candidates_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "recruitment_outcomes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_spectators" ADD CONSTRAINT "recruitment_spectators_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "recruitment_candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_spectators" ADD CONSTRAINT "recruitment_spectators_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_comments" ADD CONSTRAINT "recruitment_comments_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "recruitment_candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_comments" ADD CONSTRAINT "recruitment_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_questions" ADD CONSTRAINT "recruitment_questions_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_questions" ADD CONSTRAINT "recruitment_questions_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "job_functions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_step_templates" ADD CONSTRAINT "recruitment_step_templates_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_step_templates" ADD CONSTRAINT "recruitment_step_templates_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "job_functions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_steps" ADD CONSTRAINT "recruitment_steps_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "recruitment_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_steps" ADD CONSTRAINT "recruitment_steps_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "recruitment_step_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

