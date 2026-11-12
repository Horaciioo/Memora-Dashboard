-- AlterEnum
ALTER TYPE "PlayGame" ADD VALUE 'JUMBLE';

-- CreateTable
CREATE TABLE "play_jumble_games" (
    "sessionId" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "answer" TEXT NOT NULL,
    "display" TEXT NOT NULL,
    "scrambled" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "hintAt" TIMESTAMP(3) NOT NULL,
    "isHinted" BOOLEAN NOT NULL DEFAULT false,
    "solverId" TEXT,
    "solvedAt" TIMESTAMP(3),
    "revealUntil" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "play_jumble_games_pkey" PRIMARY KEY ("sessionId")
);

-- CreateTable
CREATE TABLE "play_jumble_rounds" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "word" TEXT NOT NULL,
    "solverId" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "ms" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "play_jumble_rounds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "play_jumble_rounds_sessionId_round_key" ON "play_jumble_rounds"("sessionId", "round");

-- AddForeignKey
ALTER TABLE "play_jumble_games" ADD CONSTRAINT "play_jumble_games_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_jumble_rounds" ADD CONSTRAINT "play_jumble_rounds_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_jumble_rounds" ADD CONSTRAINT "play_jumble_rounds_solverId_fkey" FOREIGN KEY ("solverId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
