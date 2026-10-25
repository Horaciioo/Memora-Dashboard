-- CreateEnum
CREATE TYPE "PlayMessageKind" AS ENUM ('TEXT', 'JOINED', 'LEFT', 'KICKED');

-- AlterTable
ALTER TABLE "play_messages" ADD COLUMN "kind" "PlayMessageKind" NOT NULL DEFAULT 'TEXT';
