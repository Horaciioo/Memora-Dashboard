-- Play bots are accounts with a level
CREATE TYPE "PlayBotKind" AS ENUM ('EASY', 'MEDIUM', 'HARD');
ALTER TABLE "accounts" ADD COLUMN "botKind" "PlayBotKind";
