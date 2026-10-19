-- AlterTable
ALTER TABLE "event_attendances" ADD COLUMN "availableFrom" TIMESTAMP(3),
ADD COLUMN "availableTo" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "live_mod_stints" (
    "id" TEXT NOT NULL,
    "liveId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stoppedAt" TIMESTAMP(3),

    CONSTRAINT "live_mod_stints_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "live_mod_stints_liveId_accountId_idx" ON "live_mod_stints"("liveId", "accountId");

-- CreateIndex
CREATE INDEX "live_mod_stints_accountId_startedAt_idx" ON "live_mod_stints"("accountId", "startedAt");

-- AddForeignKey
ALTER TABLE "live_mod_stints" ADD CONSTRAINT "live_mod_stints_liveId_fkey" FOREIGN KEY ("liveId") REFERENCES "lives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_mod_stints" ADD CONSTRAINT "live_mod_stints_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
