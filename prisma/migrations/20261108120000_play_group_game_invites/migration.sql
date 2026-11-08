-- A group chat line can invite to a game table
ALTER TABLE "play_group_messages" ADD COLUMN "game" "PlayGame", ADD COLUMN "sessionId" TEXT;
