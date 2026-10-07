-- CreateEnum
CREATE TYPE "CoordinationStatus" AS ENUM ('ASKED', 'ACCEPTED', 'DECLINED');

-- CreateTable
CREATE TABLE "live_coordinations" (
    "id" TEXT NOT NULL,
    "liveId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "status" "CoordinationStatus" NOT NULL DEFAULT 'ASKED',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "askedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "live_coordinations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "live_coordinations_liveId_accountId_key" ON "live_coordinations"("liveId", "accountId");

-- CreateIndex
CREATE INDEX "live_coordinations_accountId_status_idx" ON "live_coordinations"("accountId", "status");

-- AddForeignKey
ALTER TABLE "live_coordinations" ADD CONSTRAINT "live_coordinations_liveId_fkey" FOREIGN KEY ("liveId") REFERENCES "lives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_coordinations" ADD CONSTRAINT "live_coordinations_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: a coordinator named before this change counts as agreed over the whole live
INSERT INTO "live_coordinations" ("id", "liveId", "accountId", "status", "startsAt", "endsAt", "respondedAt")
SELECT 'coord_' || "id", "id", "coordinatorId", 'ACCEPTED', "plannedStartAt", COALESCE("plannedEndAt", "plannedStartAt" + INTERVAL '3 hours'), CURRENT_TIMESTAMP
FROM "lives"
WHERE "coordinatorId" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "lives" DROP CONSTRAINT "lives_coordinatorId_fkey";

-- DropIndex
DROP INDEX "lives_coordinatorId_idx";

-- AlterTable
ALTER TABLE "lives" DROP COLUMN "coordinatorId";
