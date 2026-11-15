-- AlterEnum
ALTER TYPE "PlayGame" ADD VALUE 'STOP_GO';

-- CreateTable
CREATE TABLE "play_stopgo_games" (
    "sessionId" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "turnId" TEXT NOT NULL,
    "turnNo" INTEGER NOT NULL DEFAULT 0,
    "rev" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "turnEndsAt" TIMESTAMP(3) NOT NULL,
    "drawPile" JSONB NOT NULL,
    "discard" JSONB NOT NULL,
    "reshuffles" INTEGER NOT NULL DEFAULT 0,
    "pending" JSONB,
    "pendingEndsAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "play_stopgo_games_pkey" PRIMARY KEY ("sessionId")
);

-- CreateTable
CREATE TABLE "play_stopgo_players" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,
    "km" INTEGER NOT NULL DEFAULT 0,
    "hand" JSONB NOT NULL,
    "sealed" JSONB NOT NULL,
    "isGreen" BOOLEAN NOT NULL DEFAULT false,
    "hazards" TEXT[],
    "immunityUsedAt" TIMESTAMP(3),
    "cleanupUsedAt" TIMESTAMP(3),
    "strikes" INTEGER NOT NULL DEFAULT 0,
    "finishedAt" TIMESTAMP(3),
    "place" INTEGER,

    CONSTRAINT "play_stopgo_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "play_stopgo_moves" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "rev" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "targetIds" TEXT[],
    "card" TEXT,
    "km" INTEGER,
    "value" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "play_stopgo_moves_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "play_stopgo_players_sessionId_accountId_key" ON "play_stopgo_players"("sessionId", "accountId");

-- CreateIndex
CREATE INDEX "play_stopgo_moves_sessionId_rev_idx" ON "play_stopgo_moves"("sessionId", "rev");

-- AddForeignKey
ALTER TABLE "play_stopgo_games" ADD CONSTRAINT "play_stopgo_games_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_stopgo_players" ADD CONSTRAINT "play_stopgo_players_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_stopgo_players" ADD CONSTRAINT "play_stopgo_players_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_stopgo_moves" ADD CONSTRAINT "play_stopgo_moves_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_stopgo_moves" ADD CONSTRAINT "play_stopgo_moves_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
