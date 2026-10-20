-- AlterEnum
ALTER TYPE "MeetingAudience" ADD VALUE 'ADMINISTRATION';

-- AlterTable
ALTER TABLE "meetings" ALTER COLUMN "scheduledAt" DROP NOT NULL;
