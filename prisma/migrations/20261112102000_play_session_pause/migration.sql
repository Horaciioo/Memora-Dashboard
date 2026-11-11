-- AlterEnum
ALTER TYPE "PlaySessionStatus" ADD VALUE 'PAUSED';

-- AlterTable
ALTER TABLE "play_sessions" ADD COLUMN "pausedAt" TIMESTAMP(3),
ADD COLUMN "pausedById" TEXT,
ADD COLUMN "pauseReason" TEXT;
