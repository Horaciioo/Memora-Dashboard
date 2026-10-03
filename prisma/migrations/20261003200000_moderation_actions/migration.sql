-- CreateEnum
CREATE TYPE "ModerationKind" AS ENUM ('DELETE', 'TIMEOUT', 'BAN', 'UNBAN', 'WARN', 'AUTOMOD_APPROVE', 'AUTOMOD_DENY', 'TERM_ADD', 'TERM_REMOVE', 'MODE_CHANGE', 'UNBAN_REQUEST_APPROVE', 'UNBAN_REQUEST_DENY', 'MESSAGE_SEND');

-- CreateEnum
CREATE TYPE "ModerationOrigin" AS ENUM ('MEMORA', 'PLATFORM');

-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED');

-- CreateTable
CREATE TABLE "moderation_actions" (
    "id" TEXT NOT NULL,
    "liveId" TEXT NOT NULL,
    "platform" "LivePlatform" NOT NULL,
    "actorAccountId" TEXT,
    "actorPlatformUserId" TEXT,
    "actorLogin" TEXT,
    "targetPlatformUserId" TEXT,
    "targetLogin" TEXT,
    "kind" "ModerationKind" NOT NULL,
    "durationSeconds" INTEGER,
    "reason" TEXT,
    "liveconLevel" INTEGER,
    "messageExcerpt" TEXT,
    "origin" "ModerationOrigin" NOT NULL,
    "status" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "errorCode" TEXT,
    "idempotencyKey" TEXT,
    "externalEventId" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT "moderation_actions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "moderation_actions_idempotencyKey_key" ON "moderation_actions"("idempotencyKey");

-- CreateIndex
CREATE INDEX "moderation_actions_actorAccountId_occurredAt_idx" ON "moderation_actions"("actorAccountId", "occurredAt");

-- CreateIndex
CREATE INDEX "moderation_actions_liveId_occurredAt_idx" ON "moderation_actions"("liveId", "occurredAt");

-- CreateIndex
CREATE INDEX "moderation_actions_kind_idx" ON "moderation_actions"("kind");

-- CreateIndex
CREATE UNIQUE INDEX "moderation_actions_platform_externalEventId_key" ON "moderation_actions"("platform", "externalEventId");

-- AddForeignKey
ALTER TABLE "moderation_actions" ADD CONSTRAINT "moderation_actions_liveId_fkey" FOREIGN KEY ("liveId") REFERENCES "lives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_actions" ADD CONSTRAINT "moderation_actions_actorAccountId_fkey" FOREIGN KEY ("actorAccountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
