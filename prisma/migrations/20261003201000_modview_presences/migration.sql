-- CreateEnum
CREATE TYPE "PresenceCloseReason" AS ENUM ('CLOSED', 'TIMEOUT', 'LIVE_ENDED');

-- CreateTable
CREATE TABLE "modview_presences" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "liveId" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastBeatAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "visibleSeconds" INTEGER NOT NULL DEFAULT 0,
    "activeSeconds" INTEGER NOT NULL DEFAULT 0,
    "closeReason" "PresenceCloseReason",

CONSTRAINT "modview_presences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "modview_presences_liveId_accountId_idx" ON "modview_presences"("liveId", "accountId");

-- CreateIndex
CREATE INDEX "modview_presences_accountId_openedAt_idx" ON "modview_presences"("accountId", "openedAt");

-- AddForeignKey
ALTER TABLE "modview_presences" ADD CONSTRAINT "modview_presences_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modview_presences" ADD CONSTRAINT "modview_presences_liveId_fkey" FOREIGN KEY ("liveId") REFERENCES "lives"("id") ON DELETE CASCADE ON UPDATE CASCADE;
