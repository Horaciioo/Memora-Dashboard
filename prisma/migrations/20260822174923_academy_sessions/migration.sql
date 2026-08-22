-- CreateEnum
CREATE TYPE "AcademyProgram" AS ENUM ('PIMT', 'PIMY', 'PIMD', 'PIMP');

-- CreateEnum
CREATE TYPE "AcademyTrack" AS ENUM ('ENTREE', 'ADAPTATION');

-- CreateEnum
CREATE TYPE "AcademySessionStatus" AS ENUM ('PLANNED', 'RUNNING', 'CLOSED');

-- CreateEnum
CREATE TYPE "AcademyJuniorStatus" AS ENUM ('ACTIVE', 'VALIDATED', 'STOPPED');

-- CreateEnum
CREATE TYPE "AcademyEventKind" AS ENUM ('FORMATION', 'BILAN_VOCAL', 'ENTREVUE', 'POINT_RESPONSABLE', 'SESSION_TRAVAIL');

-- AlterTable
ALTER TABLE "trainings" ADD COLUMN     "program" "AcademyProgram";

-- CreateTable
CREATE TABLE "academy_sessions" (
    "id" TEXT NOT NULL,
    "program" "AcademyProgram" NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "status" "AcademySessionStatus" NOT NULL DEFAULT 'PLANNED',
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academy_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_session_trainers" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academy_session_trainers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_juniors" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "trainerId" TEXT,
    "track" "AcademyTrack" NOT NULL DEFAULT 'ENTREE',
    "status" "AcademyJuniorStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validatedAt" TIMESTAMP(3),
    "liveCount" INTEGER NOT NULL DEFAULT 0,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academy_juniors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_events" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "juniorId" TEXT,
    "authorId" TEXT,
    "kind" "AcademyEventKind" NOT NULL,
    "title" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "doneAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academy_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_reviews" (
    "id" TEXT NOT NULL,
    "juniorId" TEXT NOT NULL,
    "authorId" TEXT,
    "heldAt" TIMESTAMP(3) NOT NULL,
    "feeling" TEXT,
    "axes" JSONB,
    "objectives" TEXT NOT NULL DEFAULT '',
    "strategies" TEXT,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academy_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "academy_sessions_program_startsAt_idx" ON "academy_sessions"("program", "startsAt");

-- CreateIndex
CREATE INDEX "academy_sessions_status_idx" ON "academy_sessions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "academy_session_trainers_sessionId_accountId_key" ON "academy_session_trainers"("sessionId", "accountId");

-- CreateIndex
CREATE INDEX "academy_juniors_status_idx" ON "academy_juniors"("status");

-- CreateIndex
CREATE UNIQUE INDEX "academy_juniors_sessionId_accountId_key" ON "academy_juniors"("sessionId", "accountId");

-- CreateIndex
CREATE INDEX "academy_events_sessionId_scheduledAt_idx" ON "academy_events"("sessionId", "scheduledAt");

-- CreateIndex
CREATE INDEX "academy_events_kind_idx" ON "academy_events"("kind");

-- CreateIndex
CREATE INDEX "academy_reviews_juniorId_heldAt_idx" ON "academy_reviews"("juniorId", "heldAt");

-- CreateIndex
CREATE INDEX "trainings_program_idx" ON "trainings"("program");

-- AddForeignKey
ALTER TABLE "academy_session_trainers" ADD CONSTRAINT "academy_session_trainers_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "academy_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_session_trainers" ADD CONSTRAINT "academy_session_trainers_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_juniors" ADD CONSTRAINT "academy_juniors_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "academy_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_juniors" ADD CONSTRAINT "academy_juniors_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_juniors" ADD CONSTRAINT "academy_juniors_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_events" ADD CONSTRAINT "academy_events_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "academy_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_events" ADD CONSTRAINT "academy_events_juniorId_fkey" FOREIGN KEY ("juniorId") REFERENCES "academy_juniors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_events" ADD CONSTRAINT "academy_events_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_reviews" ADD CONSTRAINT "academy_reviews_juniorId_fkey" FOREIGN KEY ("juniorId") REFERENCES "academy_juniors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_reviews" ADD CONSTRAINT "academy_reviews_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

