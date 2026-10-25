-- CreateEnum
CREATE TYPE "PlayGame" AS ENUM ('BACCALAUREAT', 'GOLF', 'BOMB', 'LUDO');

-- CreateEnum
CREATE TYPE "PlaySessionStatus" AS ENUM ('LOBBY', 'RUNNING', 'FINISHED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "PlayOutcome" AS ENUM ('WIN', 'DRAW', 'LOSS');

-- CreateTable
CREATE TABLE "play_tournaments" (
    "id" TEXT NOT NULL,
    "game" "PlayGame" NOT NULL,
    "hostId" TEXT NOT NULL,
    "gamesCount" INTEGER NOT NULL,
    "status" "PlaySessionStatus" NOT NULL DEFAULT 'RUNNING',
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "play_tournaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "play_sessions" (
    "id" TEXT NOT NULL,
    "game" "PlayGame" NOT NULL,
    "status" "PlaySessionStatus" NOT NULL DEFAULT 'LOBBY',
    "hostId" TEXT NOT NULL,
    "tournamentId" TEXT,
    "tournamentIndex" INTEGER,
    "settings" JSONB NOT NULL,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "play_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "play_seats" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "outcome" "PlayOutcome",
    "xp" INTEGER NOT NULL DEFAULT 0,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "kickedAt" TIMESTAMP(3),

    CONSTRAINT "play_seats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "play_game_stats" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "game" "PlayGame" NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "played" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "abandons" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "bestStreak" INTEGER NOT NULL DEFAULT 0,
    "playSeconds" INTEGER NOT NULL DEFAULT 0,
    "tournamentsPlayed" INTEGER NOT NULL DEFAULT 0,
    "tournamentsWon" INTEGER NOT NULL DEFAULT 0,
    "extra" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "play_game_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "play_baccalaureat_rounds" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "letter" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "stoppedById" TEXT,
    "closedAt" TIMESTAMP(3),
    "reviewEndsAt" TIMESTAMP(3),
    "scoredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "play_baccalaureat_rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "play_baccalaureat_answers" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "valid" BOOLEAN,
    "points" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "play_baccalaureat_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "play_baccalaureat_votes" (
    "id" TEXT NOT NULL,
    "answerId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "accepted" BOOLEAN NOT NULL,

    CONSTRAINT "play_baccalaureat_votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "play_sessions_status_game_idx" ON "play_sessions"("status", "game");

-- CreateIndex
CREATE INDEX "play_sessions_tournamentId_tournamentIndex_idx" ON "play_sessions"("tournamentId", "tournamentIndex");

-- CreateIndex
CREATE INDEX "play_seats_accountId_leftAt_idx" ON "play_seats"("accountId", "leftAt");

-- CreateIndex
CREATE UNIQUE INDEX "play_seats_sessionId_accountId_key" ON "play_seats"("sessionId", "accountId");

-- CreateIndex
CREATE INDEX "play_game_stats_game_xp_idx" ON "play_game_stats"("game", "xp");

-- CreateIndex
CREATE UNIQUE INDEX "play_game_stats_accountId_game_key" ON "play_game_stats"("accountId", "game");

-- CreateIndex
CREATE UNIQUE INDEX "play_baccalaureat_rounds_sessionId_index_key" ON "play_baccalaureat_rounds"("sessionId", "index");

-- CreateIndex
CREATE UNIQUE INDEX "play_baccalaureat_answers_roundId_accountId_category_key" ON "play_baccalaureat_answers"("roundId", "accountId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "play_baccalaureat_votes_answerId_voterId_key" ON "play_baccalaureat_votes"("answerId", "voterId");

-- AddForeignKey
ALTER TABLE "play_tournaments" ADD CONSTRAINT "play_tournaments_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_sessions" ADD CONSTRAINT "play_sessions_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_sessions" ADD CONSTRAINT "play_sessions_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "play_tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_seats" ADD CONSTRAINT "play_seats_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_seats" ADD CONSTRAINT "play_seats_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_game_stats" ADD CONSTRAINT "play_game_stats_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_baccalaureat_rounds" ADD CONSTRAINT "play_baccalaureat_rounds_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_baccalaureat_answers" ADD CONSTRAINT "play_baccalaureat_answers_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "play_baccalaureat_rounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_baccalaureat_answers" ADD CONSTRAINT "play_baccalaureat_answers_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_baccalaureat_votes" ADD CONSTRAINT "play_baccalaureat_votes_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "play_baccalaureat_answers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_baccalaureat_votes" ADD CONSTRAINT "play_baccalaureat_votes_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

