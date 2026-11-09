-- Internal chat between the team of one live
CREATE TABLE "live_team_messages" (
    "id" TEXT NOT NULL,
    "liveId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "mentions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "live_team_messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "live_team_messages_liveId_createdAt_idx" ON "live_team_messages"("liveId", "createdAt");

ALTER TABLE "live_team_messages" ADD CONSTRAINT "live_team_messages_liveId_fkey" FOREIGN KEY ("liveId") REFERENCES "lives"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "live_team_messages" ADD CONSTRAINT "live_team_messages_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
