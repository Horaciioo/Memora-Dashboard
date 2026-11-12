-- AlterEnum
ALTER TYPE "PlayGame" ADD VALUE 'CROQUIS';

-- CreateTable
CREATE TABLE "play_croquis_games" (
    "sessionId" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "rounds" INTEGER NOT NULL,
    "order" JSONB NOT NULL,
    "drawerId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "display" TEXT NOT NULL,
    "strokes" JSONB NOT NULL DEFAULT '[]',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "hintAt" TIMESTAMP(3) NOT NULL,
    "isHinted" BOOLEAN NOT NULL DEFAULT false,
    "revealUntil" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "play_croquis_games_pkey" PRIMARY KEY ("sessionId")
);

-- CreateTable
CREATE TABLE "play_croquis_rounds" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "drawerId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "solvers" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "play_croquis_rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "play_croquis_guesses" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "accountId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "ms" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "play_croquis_guesses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "play_croquis_rounds_sessionId_round_key" ON "play_croquis_rounds"("sessionId", "round");

-- CreateIndex
CREATE INDEX "play_croquis_guesses_sessionId_round_idx" ON "play_croquis_guesses"("sessionId", "round");

-- CreateIndex
CREATE UNIQUE INDEX "play_croquis_guesses_sessionId_round_accountId_key" ON "play_croquis_guesses"("sessionId", "round", "accountId");

-- AddForeignKey
ALTER TABLE "play_croquis_games" ADD CONSTRAINT "play_croquis_games_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_croquis_rounds" ADD CONSTRAINT "play_croquis_rounds_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_croquis_rounds" ADD CONSTRAINT "play_croquis_rounds_drawerId_fkey" FOREIGN KEY ("drawerId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_croquis_guesses" ADD CONSTRAINT "play_croquis_guesses_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_croquis_guesses" ADD CONSTRAINT "play_croquis_guesses_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
