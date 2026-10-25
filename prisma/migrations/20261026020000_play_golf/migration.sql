-- CreateEnum
CREATE TYPE "GolfMoveKind" AS ENUM ('SHOT', 'HOLED', 'POWER', 'FALL');

-- CreateTable
CREATE TABLE "play_golf_games" (
    "sessionId" TEXT NOT NULL,
    "hole" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "orbs" JSONB NOT NULL DEFAULT '[]',
    "hazards" JSONB NOT NULL DEFAULT '[]',
    "rev" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "play_golf_games_pkey" PRIMARY KEY ("sessionId")
);

-- CreateTable
CREATE TABLE "play_golf_players" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "z" DOUBLE PRECISION NOT NULL,
    "restsAt" TIMESTAMP(3) NOT NULL,
    "strokes" INTEGER NOT NULL DEFAULT 0,
    "holedAt" TIMESTAMP(3),
    "card" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "power" TEXT,
    "effects" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "play_golf_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "play_golf_moves" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "kind" "GolfMoveKind" NOT NULL,
    "hole" INTEGER NOT NULL,
    "strokes" INTEGER,
    "power" TEXT,
    "path" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "play_golf_moves_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "play_golf_players_sessionId_accountId_key" ON "play_golf_players"("sessionId", "accountId");

-- CreateIndex
CREATE INDEX "play_golf_moves_sessionId_createdAt_idx" ON "play_golf_moves"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "play_golf_moves_sessionId_kind_idx" ON "play_golf_moves"("sessionId", "kind");

-- AddForeignKey
ALTER TABLE "play_golf_games" ADD CONSTRAINT "play_golf_games_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_golf_players" ADD CONSTRAINT "play_golf_players_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_golf_players" ADD CONSTRAINT "play_golf_players_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_golf_moves" ADD CONSTRAINT "play_golf_moves_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_golf_moves" ADD CONSTRAINT "play_golf_moves_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

