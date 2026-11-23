-- CreateEnum
CREATE TYPE "ChatHold" AS ENUM ('HELD', 'APPROVED', 'DENIED');

-- AlterTable
ALTER TABLE "live_chat_messages" ADD COLUMN "hold" "ChatHold";
