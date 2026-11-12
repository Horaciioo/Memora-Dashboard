-- AlterEnum
ALTER TYPE "PlayGame" ADD VALUE 'GLITCH';

-- CreateTable
CREATE TABLE "play_glitch_games" (
    "sessionId" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "seed" INTEGER NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "revealUntil" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "play_glitch_games_pkey" PRIMARY KEY ("sessionId")
);

-- CreateTable
CREATE TABLE "play_glitch_progress" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "accountId" TEXT NOT NULL,
    "found" INTEGER[],
    "misses" INTEGER NOT NULL DEFAULT 0,
    "lockUntil" TIMESTAMP(3),
    "rank" INTEGER,
    "points" INTEGER NOT NULL DEFAULT 0,
    "ms" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "play_glitch_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "play_glitch_progress_sessionId_round_idx" ON "play_glitch_progress"("sessionId", "round");

-- CreateIndex
CREATE UNIQUE INDEX "play_glitch_progress_sessionId_round_accountId_key" ON "play_glitch_progress"("sessionId", "round", "accountId");

-- AddForeignKey
ALTER TABLE "play_glitch_games" ADD CONSTRAINT "play_glitch_games_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_glitch_progress" ADD CONSTRAINT "play_glitch_progress_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_glitch_progress" ADD CONSTRAINT "play_glitch_progress_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
