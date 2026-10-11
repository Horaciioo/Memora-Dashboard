-- AlterEnum
ALTER TYPE "EventVisibility" ADD VALUE 'TEAM';

-- AlterTable
ALTER TABLE "calendar_events" ADD COLUMN     "audienceLeadsOnly" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "audienceSessionId" TEXT,
ADD COLUMN     "audienceTeamId" TEXT;
