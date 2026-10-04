-- AlterTable
ALTER TABLE "lives" ADD COLUMN     "instructions" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "moderation_actions" ADD COLUMN     "offenseId" TEXT,
ADD COLUMN     "onBehalfOfId" TEXT,
ADD COLUMN     "rung" INTEGER;

-- CreateTable
CREATE TABLE "modview_focuses" (
    "id" TEXT NOT NULL,
    "liveId" TEXT NOT NULL,
    "watcherId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "modview_focuses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "modview_focuses_liveId_endedAt_idx" ON "modview_focuses"("liveId", "endedAt");

-- CreateIndex
CREATE INDEX "modview_focuses_watcherId_idx" ON "modview_focuses"("watcherId");

-- CreateIndex
CREATE INDEX "moderation_actions_targetPlatformUserId_occurredAt_idx" ON "moderation_actions"("targetPlatformUserId", "occurredAt");

-- AddForeignKey
ALTER TABLE "moderation_actions" ADD CONSTRAINT "moderation_actions_onBehalfOfId_fkey" FOREIGN KEY ("onBehalfOfId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modview_focuses" ADD CONSTRAINT "modview_focuses_liveId_fkey" FOREIGN KEY ("liveId") REFERENCES "lives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modview_focuses" ADD CONSTRAINT "modview_focuses_watcherId_fkey" FOREIGN KEY ("watcherId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modview_focuses" ADD CONSTRAINT "modview_focuses_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

