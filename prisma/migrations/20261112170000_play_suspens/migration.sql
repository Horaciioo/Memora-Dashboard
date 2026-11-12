-- AlterEnum
ALTER TYPE "PlayGame" ADD VALUE 'SUSPENS';

-- CreateTable
CREATE TABLE "play_suspens_games" (
    "sessionId" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "rounds" INTEGER NOT NULL,
    "order" JSONB NOT NULL,
    "setterId" TEXT NOT NULL,
    "word" TEXT,
    "display" TEXT,
    "tried" TEXT[],
    "errors" INTEGER NOT NULL DEFAULT 0,
    "turnNo" INTEGER NOT NULL DEFAULT 0,
    "turnId" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "pickEndsAt" TIMESTAMP(3) NOT NULL,
    "turnEndsAt" TIMESTAMP(3),
    "revealUntil" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "play_suspens_games_pkey" PRIMARY KEY ("sessionId")
);

-- CreateTable
CREATE TABLE "play_suspens_rounds" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "setterId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "errors" INTEGER NOT NULL DEFAULT 0,
    "isSolved" BOOLEAN NOT NULL DEFAULT false,
    "solverId" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "play_suspens_rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "play_suspens_moves" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "accountId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "value" TEXT,
    "isHit" BOOLEAN NOT NULL DEFAULT false,
    "cells" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "play_suspens_moves_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "play_suspens_rounds_sessionId_round_key" ON "play_suspens_rounds"("sessionId", "round");

-- CreateIndex
CREATE INDEX "play_suspens_moves_sessionId_round_idx" ON "play_suspens_moves"("sessionId", "round");

-- AddForeignKey
ALTER TABLE "play_suspens_games" ADD CONSTRAINT "play_suspens_games_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_suspens_rounds" ADD CONSTRAINT "play_suspens_rounds_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_suspens_rounds" ADD CONSTRAINT "play_suspens_rounds_setterId_fkey" FOREIGN KEY ("setterId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_suspens_moves" ADD CONSTRAINT "play_suspens_moves_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_suspens_moves" ADD CONSTRAINT "play_suspens_moves_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
