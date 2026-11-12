-- CreateEnum
CREATE TYPE "NexusAuditStatus" AS ENUM ('OK', 'REFUSED', 'FAILED', 'PREVIEWED');

-- CreateTable
CREATE TABLE "nexus_audits" (
    "id" TEXT NOT NULL,
    "nexusSessionId" TEXT,
    "accountId" TEXT NOT NULL,
    "commandId" TEXT,
    "input" TEXT NOT NULL,
    "level" TEXT,
    "status" "NexusAuditStatus" NOT NULL,
    "refusal" TEXT,
    "target" TEXT,
    "before" JSONB,
    "after" JSONB,
    "reversible" BOOLEAN NOT NULL DEFAULT false,
    "revertedById" TEXT,
    "requestId" TEXT NOT NULL,
    "durationMs" INTEGER NOT NULL DEFAULT 0,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nexus_audits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "nexus_audits_accountId_createdAt_idx" ON "nexus_audits"("accountId", "createdAt");

-- CreateIndex
CREATE INDEX "nexus_audits_target_createdAt_idx" ON "nexus_audits"("target", "createdAt");

-- CreateIndex
CREATE INDEX "nexus_audits_commandId_idx" ON "nexus_audits"("commandId");

-- CreateIndex
CREATE INDEX "nexus_audits_createdAt_idx" ON "nexus_audits"("createdAt");

