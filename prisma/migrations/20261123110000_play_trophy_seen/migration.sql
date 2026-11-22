-- AlterTable
ALTER TABLE "play_trophy_wins" ADD COLUMN "seen" BOOLEAN NOT NULL DEFAULT false;

-- Back payments are announced by their own notice
UPDATE "play_trophy_wins" SET "seen" = true WHERE "backfill" = true;
