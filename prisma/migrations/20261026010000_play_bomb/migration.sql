-- CreateEnum
CREATE TYPE "BombMoveKind" AS ENUM ('WORD', 'BLAST', 'LIFE');

-- CreateTable
CREATE TABLE "play_bomb_games" (
    "sessionId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "promptAge" INTEGER NOT NULL DEFAULT 0,
    "turnId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "explodesAt" TIMESTAMP(3) NOT NULL,
    "draft" TEXT NOT NULL DEFAULT '',
    "missWord" TEXT,
    "missReason" TEXT,
    "blastAt" TIMESTAMP(3),
    "blastId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "play_bomb_games_pkey" PRIMARY KEY ("sessionId")
);

-- CreateTable
CREATE TABLE "play_bomb_players" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "lives" INTEGER NOT NULL,
    "letters" TEXT NOT NULL DEFAULT '',
    "eliminatedAt" TIMESTAMP(3),

    CONSTRAINT "play_bomb_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "play_bomb_moves" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "kind" "BombMoveKind" NOT NULL,
    "word" TEXT,
    "prompt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "play_bomb_moves_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "play_bomb_players_sessionId_accountId_key" ON "play_bomb_players"("sessionId", "accountId");

-- CreateIndex
CREATE INDEX "play_bomb_moves_sessionId_createdAt_idx" ON "play_bomb_moves"("sessionId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "play_bomb_moves_sessionId_word_key" ON "play_bomb_moves"("sessionId", "word");

-- AddForeignKey
ALTER TABLE "play_bomb_games" ADD CONSTRAINT "play_bomb_games_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_bomb_players" ADD CONSTRAINT "play_bomb_players_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_bomb_players" ADD CONSTRAINT "play_bomb_players_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_bomb_moves" ADD CONSTRAINT "play_bomb_moves_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_bomb_moves" ADD CONSTRAINT "play_bomb_moves_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
