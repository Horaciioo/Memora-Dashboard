-- CreateEnum
CREATE TYPE "ErrorSeverity" AS ENUM ('FATAL', 'ERROR', 'WARNING');

-- CreateEnum
CREATE TYPE "ErrorSource" AS ENUM ('SERVER', 'CLIENT', 'API', 'PRISMA', 'WEBSOCKET', 'JOB', 'PLAY', 'FEATURE');

-- AlterTable
ALTER TABLE "activity_logs" ADD COLUMN "requestId" TEXT;

-- CreateTable
CREATE TABLE "error_events" (
    "id" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "occurrences" INTEGER NOT NULL DEFAULT 1,
    "firstAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "severity" "ErrorSeverity" NOT NULL,
    "service" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "source" "ErrorSource" NOT NULL,
    "route" TEXT,
    "accountId" TEXT,
    "sessionId" TEXT,
    "requestId" TEXT,
    "traceId" TEXT,
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "rootCause" TEXT,
    "context" JSONB,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "error_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_logs_requestId_idx" ON "activity_logs"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "error_events_fingerprint_key" ON "error_events"("fingerprint");

-- CreateIndex
CREATE INDEX "error_events_lastAt_idx" ON "error_events"("lastAt");

-- CreateIndex
CREATE INDEX "error_events_source_lastAt_idx" ON "error_events"("source", "lastAt");

-- CreateIndex
CREATE INDEX "error_events_severity_lastAt_idx" ON "error_events"("severity", "lastAt");

-- CreateIndex
CREATE INDEX "error_events_requestId_idx" ON "error_events"("requestId");

-- CreateIndex
CREATE INDEX "error_events_accountId_lastAt_idx" ON "error_events"("accountId", "lastAt");
