-- Room of each internal message
ALTER TABLE "live_team_messages" ADD COLUMN "scope" TEXT NOT NULL DEFAULT 'all';

-- Emoji left on internal messages
CREATE TABLE "live_team_reactions" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "live_team_reactions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "live_team_reactions_messageId_idx" ON "live_team_reactions"("messageId");
CREATE UNIQUE INDEX "live_team_reactions_messageId_accountId_emoji_key" ON "live_team_reactions"("messageId", "accountId", "emoji");

ALTER TABLE "live_team_reactions" ADD CONSTRAINT "live_team_reactions_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "live_team_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "live_team_reactions" ADD CONSTRAINT "live_team_reactions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
