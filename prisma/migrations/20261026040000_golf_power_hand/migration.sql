-- Up to three powers in hand, the one held kept
ALTER TABLE "play_golf_players" ADD COLUMN "powers" TEXT[] DEFAULT ARRAY[]::TEXT[];
UPDATE "play_golf_players" SET "powers" = ARRAY["power"] WHERE "power" IS NOT NULL;
ALTER TABLE "play_golf_players" DROP COLUMN "power";
