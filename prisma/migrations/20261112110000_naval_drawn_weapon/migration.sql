-- AlterTable
ALTER TABLE "play_naval_players" DROP COLUMN "ammo",
DROP COLUMN "offer",
ADD COLUMN     "weapon" TEXT NOT NULL DEFAULT 'cannon';
