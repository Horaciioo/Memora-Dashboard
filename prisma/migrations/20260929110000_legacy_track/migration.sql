-- CreateEnum
CREATE TYPE "LegacyStatus" AS ENUM ('RUNNING', 'PASSED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "legacy_tracks" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "functionId" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" "LegacyStatus" NOT NULL DEFAULT 'RUNNING',
    "decidedById" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legacy_tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legacy_module_results" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "moduleKey" TEXT NOT NULL,
    "progress" JSONB,
    "autoScore" INTEGER NOT NULL DEFAULT 0,
    "evaluatorScore" INTEGER,
    "total" INTEGER NOT NULL DEFAULT 0,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "gradedById" TEXT,
    "gradedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legacy_module_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "legacy_tracks_accountId_status_idx" ON "legacy_tracks"("accountId", "status");

-- CreateIndex
CREATE INDEX "legacy_tracks_status_endsAt_idx" ON "legacy_tracks"("status", "endsAt");

-- CreateIndex
CREATE UNIQUE INDEX "legacy_module_results_trackId_moduleKey_key" ON "legacy_module_results"("trackId", "moduleKey");

-- AddForeignKey
ALTER TABLE "legacy_tracks" ADD CONSTRAINT "legacy_tracks_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legacy_tracks" ADD CONSTRAINT "legacy_tracks_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "job_functions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legacy_tracks" ADD CONSTRAINT "legacy_tracks_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legacy_module_results" ADD CONSTRAINT "legacy_module_results_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "legacy_tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legacy_module_results" ADD CONSTRAINT "legacy_module_results_gradedById_fkey" FOREIGN KEY ("gradedById") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

