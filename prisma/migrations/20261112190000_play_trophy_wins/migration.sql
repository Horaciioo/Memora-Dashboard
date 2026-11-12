-- AlterTable
ALTER TABLE "play_profiles" ADD COLUMN "trophiesClaimedAt" TIMESTAMP(3),
ADD COLUMN "trophyNotice" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "play_trophy_wins" (
    "accountId" TEXT NOT NULL,
    "trophy" TEXT NOT NULL,
    "xp" INTEGER NOT NULL,
    "backfill" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "play_trophy_wins_pkey" PRIMARY KEY ("accountId","trophy")
);

-- AddForeignKey
ALTER TABLE "play_trophy_wins" ADD CONSTRAINT "play_trophy_wins_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
