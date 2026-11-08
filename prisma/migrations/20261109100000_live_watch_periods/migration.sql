-- Stretches of a live during which the platform feed was received
CREATE TABLE "live_watch_periods" (
    "id" TEXT NOT NULL,
    "liveId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastBeatAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "live_watch_periods_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "live_watch_periods_liveId_startedAt_idx" ON "live_watch_periods"("liveId", "startedAt");

ALTER TABLE "live_watch_periods" ADD CONSTRAINT "live_watch_periods_liveId_fkey" FOREIGN KEY ("liveId") REFERENCES "lives"("id") ON DELETE CASCADE ON UPDATE CASCADE;
