-- Pieces kept so several departures can share one announcement
ALTER TABLE "departure_notices" ADD COLUMN "username" TEXT,
ADD COLUMN "discordId" TEXT,
ADD COLUMN "period" TEXT,
ADD COLUMN "mergedAt" TIMESTAMP(3);
