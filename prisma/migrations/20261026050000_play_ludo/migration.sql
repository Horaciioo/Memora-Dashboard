-- CreateEnum
CREATE TYPE "LudoMoveKind" AS ENUM ('ROLL', 'MOVE', 'CAPTURE', 'HOME', 'SKIP', 'PENALTY', 'FINISH');

-- CreateTable
CREATE TABLE "play_ludo_games" (
    "sessionId" TEXT NOT NULL,
    "turnId" TEXT NOT NULL,
    "dice" INTEGER,
    "sixes" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "turnEndsAt" TIMESTAMP(3) NOT NULL,
    "rev" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "play_ludo_games_pkey" PRIMARY KEY ("sessionId")
);

-- CreateTable
CREATE TABLE "play_ludo_players" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "corner" INTEGER NOT NULL,
    "pawns" INTEGER[],
    "finishedAt" TIMESTAMP(3),
    "place" INTEGER,

    CONSTRAINT "play_ludo_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "play_ludo_moves" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "kind" "LudoMoveKind" NOT NULL,
    "rev" INTEGER NOT NULL,
    "dice" INTEGER,
    "pawn" INTEGER,
    "from" INTEGER,
    "to" INTEGER,
    "victimId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "play_ludo_moves_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "play_ludo_players_sessionId_accountId_key" ON "play_ludo_players"("sessionId", "accountId");

-- CreateIndex
CREATE INDEX "play_ludo_moves_sessionId_rev_idx" ON "play_ludo_moves"("sessionId", "rev");

-- AddForeignKey
ALTER TABLE "play_ludo_games" ADD CONSTRAINT "play_ludo_games_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_ludo_players" ADD CONSTRAINT "play_ludo_players_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_ludo_players" ADD CONSTRAINT "play_ludo_players_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_ludo_moves" ADD CONSTRAINT "play_ludo_moves_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_ludo_moves" ADD CONSTRAINT "play_ludo_moves_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
