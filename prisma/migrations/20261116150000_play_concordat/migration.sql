-- AlterEnum
ALTER TYPE "PlayGame" ADD VALUE 'CONCORDAT';
-- CreateTable
CREATE TABLE "play_concordat_games" (
    "sessionId" TEXT NOT NULL,
    "seed" INTEGER NOT NULL,
    "size" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "speed" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "map" BYTEA NOT NULL,
    "snapshot" BYTEA,
    "snapshotTick" INTEGER NOT NULL DEFAULT 0,
    "rev" INTEGER NOT NULL DEFAULT 0,
    "phase" TEXT NOT NULL,
    "ownerId" TEXT,
    "heartbeatAt" TIMESTAMP(3),
    "startsAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "play_concordat_games_pkey" PRIMARY KEY ("sessionId")
);
-- CreateTable
CREATE TABLE "play_concordat_players" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "nation" INTEGER NOT NULL,
    "tiles" INTEGER NOT NULL DEFAULT 0,
    "peakTiles" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "provinces" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "play_concordat_players_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "play_concordat_events" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "tick" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "actor" INTEGER NOT NULL DEFAULT 0,
    "victim" INTEGER NOT NULL DEFAULT 0,
    "tile" INTEGER NOT NULL DEFAULT -1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "play_concordat_events_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "play_concordat_players_sessionId_accountId_key" ON "play_concordat_players"("sessionId", "accountId");
-- CreateIndex
CREATE UNIQUE INDEX "play_concordat_players_sessionId_nation_key" ON "play_concordat_players"("sessionId", "nation");
-- CreateIndex
CREATE INDEX "play_concordat_events_sessionId_tick_idx" ON "play_concordat_events"("sessionId", "tick");
-- AddForeignKey
ALTER TABLE "play_concordat_games" ADD CONSTRAINT "play_concordat_games_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "play_concordat_players" ADD CONSTRAINT "play_concordat_players_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "play_concordat_players" ADD CONSTRAINT "play_concordat_players_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "play_concordat_events" ADD CONSTRAINT "play_concordat_events_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
