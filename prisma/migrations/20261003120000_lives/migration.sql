-- CreateEnum
CREATE TYPE "LivePlatform" AS ENUM ('TWITCH', 'YOUTUBE');

-- CreateEnum
CREATE TYPE "LiveStatus" AS ENUM ('ANNOUNCED', 'LIVE', 'ENDED', 'CANCELLED');

-- AlterTable
ALTER TABLE "livecon_entries" ADD COLUMN     "liveId" TEXT;

-- CreateTable
CREATE TABLE "youtuber_channels" (
    "id" TEXT NOT NULL,
    "youtuberId" TEXT NOT NULL,
    "platform" "LivePlatform" NOT NULL,
    "externalId" TEXT NOT NULL,
    "login" TEXT,
    "displayName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "youtuber_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lives" (
    "id" TEXT NOT NULL,
    "youtuberId" TEXT NOT NULL,
    "platform" "LivePlatform" NOT NULL,
    "title" TEXT NOT NULL,
    "status" "LiveStatus" NOT NULL DEFAULT 'ANNOUNCED',
    "plannedStartAt" TIMESTAMP(3) NOT NULL,
    "plannedEndAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "announcedById" TEXT,
    "coordinatorId" TEXT,
    "streamExternalId" TEXT,
    "liveChatId" TEXT,
    "calendarEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_members" (
    "liveId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "convokedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "live_members_pkey" PRIMARY KEY ("liveId","accountId")
);

-- CreateTable
CREATE TABLE "platform_accounts" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "platform" "LivePlatform" NOT NULL,
    "externalUserId" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "displayName" TEXT,
    "scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "youtuber_channels_youtuberId_platform_key" ON "youtuber_channels"("youtuberId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "youtuber_channels_platform_externalId_key" ON "youtuber_channels"("platform", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "lives_calendarEventId_key" ON "lives"("calendarEventId");

-- CreateIndex
CREATE INDEX "lives_status_idx" ON "lives"("status");

-- CreateIndex
CREATE INDEX "lives_youtuberId_plannedStartAt_idx" ON "lives"("youtuberId", "plannedStartAt");

-- CreateIndex
CREATE INDEX "lives_coordinatorId_idx" ON "lives"("coordinatorId");

-- CreateIndex
CREATE UNIQUE INDEX "lives_platform_streamExternalId_key" ON "lives"("platform", "streamExternalId");

-- CreateIndex
CREATE INDEX "live_members_accountId_idx" ON "live_members"("accountId");

-- CreateIndex
CREATE INDEX "platform_accounts_expiresAt_idx" ON "platform_accounts"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "platform_accounts_accountId_platform_key" ON "platform_accounts"("accountId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "platform_accounts_platform_externalUserId_key" ON "platform_accounts"("platform", "externalUserId");

-- CreateIndex
CREATE INDEX "livecon_entries_liveId_idx" ON "livecon_entries"("liveId");

-- AddForeignKey
ALTER TABLE "livecon_entries" ADD CONSTRAINT "livecon_entries_liveId_fkey" FOREIGN KEY ("liveId") REFERENCES "lives"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youtuber_channels" ADD CONSTRAINT "youtuber_channels_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lives" ADD CONSTRAINT "lives_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lives" ADD CONSTRAINT "lives_announcedById_fkey" FOREIGN KEY ("announcedById") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lives" ADD CONSTRAINT "lives_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lives" ADD CONSTRAINT "lives_calendarEventId_fkey" FOREIGN KEY ("calendarEventId") REFERENCES "calendar_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_members" ADD CONSTRAINT "live_members_liveId_fkey" FOREIGN KEY ("liveId") REFERENCES "lives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_members" ADD CONSTRAINT "live_members_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_accounts" ADD CONSTRAINT "platform_accounts_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

