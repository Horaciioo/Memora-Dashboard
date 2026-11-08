-- AlterEnum
ALTER TYPE "PlayGame" ADD VALUE 'NAVAL';

-- CreateEnum
CREATE TYPE "NavalPhase" AS ENUM ('PLACEMENT', 'BATTLE', 'OVER');

-- CreateEnum
CREATE TYPE "NavalMatchStatus" AS ENUM ('WAITING', 'LIVE', 'DONE');

-- CreateEnum
CREATE TYPE "NavalShotResult" AS ENUM ('MISS', 'HIT', 'SUNK');

-- CreateTable
CREATE TABLE "play_naval_games" (
    "sessionId" TEXT NOT NULL,
    "phase" "NavalPhase" NOT NULL DEFAULT 'PLACEMENT',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "phaseEndsAt" TIMESTAMP(3) NOT NULL,
    "rev" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "play_naval_games_pkey" PRIMARY KEY ("sessionId")
);

-- CreateTable
CREATE TABLE "play_naval_players" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,
    "fleet" JSONB,
    "readyAt" TIMESTAMP(3),
    "eliminatedAt" TIMESTAMP(3),
    "place" INTEGER,
    "strikes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "play_naval_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "play_naval_matches" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "slot" INTEGER NOT NULL,
    "fighters" TEXT[],
    "status" "NavalMatchStatus" NOT NULL DEFAULT 'WAITING',
    "turnId" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "turnEndsAt" TIMESTAMP(3) NOT NULL,
    "winnerId" TEXT,

    CONSTRAINT "play_naval_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "play_naval_shots" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "rev" INTEGER NOT NULL,
    "shooterId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "result" "NavalShotResult" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "play_naval_shots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "play_naval_players_sessionId_accountId_key" ON "play_naval_players"("sessionId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "play_naval_matches_sessionId_round_slot_key" ON "play_naval_matches"("sessionId", "round", "slot");

-- CreateIndex
CREATE INDEX "play_naval_shots_sessionId_rev_idx" ON "play_naval_shots"("sessionId", "rev");

-- CreateIndex
CREATE INDEX "play_naval_shots_matchId_idx" ON "play_naval_shots"("matchId");

-- AddForeignKey
ALTER TABLE "play_naval_games" ADD CONSTRAINT "play_naval_games_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_naval_players" ADD CONSTRAINT "play_naval_players_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_naval_players" ADD CONSTRAINT "play_naval_players_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_naval_matches" ADD CONSTRAINT "play_naval_matches_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_naval_shots" ADD CONSTRAINT "play_naval_shots_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
