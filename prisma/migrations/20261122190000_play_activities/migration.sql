-- Personal events of Play shown in the bell
CREATE TYPE "PlayActivityKind" AS ENUM ('XP', 'LEVEL', 'QUEST', 'TROPHY');

CREATE TABLE "play_activities" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "kind" "PlayActivityKind" NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER,
    "ref" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "play_activities_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "play_activities_accountId_createdAt_idx" ON "play_activities"("accountId", "createdAt");

ALTER TABLE "play_activities" ADD CONSTRAINT "play_activities_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
