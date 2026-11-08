-- AlterEnum
ALTER TYPE "NavalShotResult" ADD VALUE 'SPOTTED';
ALTER TYPE "NavalShotResult" ADD VALUE 'CLEAR';

-- AlterTable
ALTER TABLE "play_naval_players" ADD COLUMN "ammo" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "offer" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "play_naval_shots" ADD COLUMN "weapon" TEXT NOT NULL DEFAULT 'cannon',
ADD COLUMN "orientation" INTEGER NOT NULL DEFAULT 0;
