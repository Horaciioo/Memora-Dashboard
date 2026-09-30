-- CreateEnum
CREATE TYPE "SanctionPanel" AS ENUM ('TWITCH', 'YOUTUBE', 'DISCORD');

-- CreateEnum
CREATE TYPE "SanctionGravity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterEnum
ALTER TYPE "SanctionKind" ADD VALUE 'NONE';
ALTER TYPE "SanctionKind" ADD VALUE 'COMMENT';
ALTER TYPE "SanctionKind" ADD VALUE 'REPORT';

-- DropIndex
DROP INDEX "sanction_offenses_youtuberId_position_idx";

-- DropIndex
DROP INDEX "sanction_offenses_youtuberId_name_key";

-- AlterTable
ALTER TABLE "livecon_levels" ADD COLUMN     "icon" TEXT;

-- AlterTable
ALTER TABLE "sanction_offenses" ADD COLUMN     "panel" "SanctionPanel" NOT NULL DEFAULT 'TWITCH',
ADD COLUMN     "toleratedExample" TEXT;

-- CreateTable
CREATE TABLE "sanction_offense_levels" (
    "id" TEXT NOT NULL,
    "offenseId" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "gravity" "SanctionGravity" NOT NULL DEFAULT 'LOW',

    CONSTRAINT "sanction_offense_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sanction_tier_measures" (
    "tierId" TEXT NOT NULL,
    "measureId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "sanction_tier_measures_pkey" PRIMARY KEY ("tierId","measureId")
);

-- CreateIndex
CREATE INDEX "sanction_offense_levels_levelId_idx" ON "sanction_offense_levels"("levelId");

-- CreateIndex
CREATE UNIQUE INDEX "sanction_offense_levels_offenseId_levelId_key" ON "sanction_offense_levels"("offenseId", "levelId");

-- CreateIndex
CREATE INDEX "sanction_tier_measures_measureId_idx" ON "sanction_tier_measures"("measureId");

-- CreateIndex
CREATE INDEX "sanction_offenses_youtuberId_panel_position_idx" ON "sanction_offenses"("youtuberId", "panel", "position");

-- CreateIndex
CREATE UNIQUE INDEX "sanction_offenses_youtuberId_panel_name_key" ON "sanction_offenses"("youtuberId", "panel", "name");

-- AddForeignKey
ALTER TABLE "sanction_offense_levels" ADD CONSTRAINT "sanction_offense_levels_offenseId_fkey" FOREIGN KEY ("offenseId") REFERENCES "sanction_offenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sanction_offense_levels" ADD CONSTRAINT "sanction_offense_levels_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "livecon_levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sanction_tier_measures" ADD CONSTRAINT "sanction_tier_measures_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "sanction_tiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sanction_tier_measures" ADD CONSTRAINT "sanction_tier_measures_measureId_fkey" FOREIGN KEY ("measureId") REFERENCES "sanction_measures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Every existing step keeps its single measure, now as the first of its list
INSERT INTO "sanction_tier_measures" ("tierId", "measureId", "position")
SELECT "id", "measureId", 0 FROM "sanction_tiers" WHERE "measureId" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "sanction_tiers" DROP CONSTRAINT "sanction_tiers_measureId_fkey";

-- AlterTable
ALTER TABLE "sanction_tiers" DROP COLUMN "measureId";
