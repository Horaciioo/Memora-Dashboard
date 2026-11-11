-- CreateEnum
CREATE TYPE "NexusStage" AS ENUM ('PASSWORD', 'UNLOCKED');

-- CreateEnum
CREATE TYPE "NexusAttemptKind" AS ENUM ('PASSWORD', 'DISCORD', 'REAUTH');

-- CreateTable
CREATE TABLE "nexus_sessions" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "stage" "NexusStage" NOT NULL,
    "passwordAt" TIMESTAMP(3) NOT NULL,
    "discordAt" TIMESTAMP(3),
    "reauthAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "writeUntil" TIMESTAMP(3),
    "dangerUntil" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "revokedReason" TEXT,
    "address" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nexus_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nexus_attempts" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "kind" "NexusAttemptKind" NOT NULL,
    "succeeded" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nexus_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nexus_lockouts" (
    "key" TEXT NOT NULL,
    "until" TIMESTAMP(3) NOT NULL,
    "strikes" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nexus_lockouts_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "nexus_sessions_tokenHash_key" ON "nexus_sessions"("tokenHash");

-- CreateIndex
CREATE INDEX "nexus_sessions_accountId_idx" ON "nexus_sessions"("accountId");

-- CreateIndex
CREATE INDEX "nexus_sessions_sessionId_idx" ON "nexus_sessions"("sessionId");

-- CreateIndex
CREATE INDEX "nexus_sessions_expiresAt_idx" ON "nexus_sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "nexus_attempts_accountId_createdAt_idx" ON "nexus_attempts"("accountId", "createdAt");

-- CreateIndex
CREATE INDEX "nexus_attempts_address_createdAt_idx" ON "nexus_attempts"("address", "createdAt");

-- AddForeignKey
ALTER TABLE "nexus_sessions" ADD CONSTRAINT "nexus_sessions_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nexus_sessions" ADD CONSTRAINT "nexus_sessions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

