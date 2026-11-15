-- AlterTable
ALTER TABLE "play_stopgo_players" ADD COLUMN     "shields" TEXT[] DEFAULT ARRAY[]::TEXT[];
