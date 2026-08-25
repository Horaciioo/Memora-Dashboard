-- CreateEnum
CREATE TYPE "SanctionKind" AS ENUM ('DELETE', 'WARN', 'TIMEOUT', 'BAN');

-- CreateTable
CREATE TABLE "sanction_measures" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "SanctionKind" NOT NULL DEFAULT 'TIMEOUT',
    "durationMinutes" INTEGER,
    "permanent" BOOLEAN NOT NULL DEFAULT false,
    "weight" INTEGER NOT NULL DEFAULT 0,
    "accent" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sanction_measures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sanction_offenses" (
    "id" TEXT NOT NULL,
    "youtuberId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT,
    "example" TEXT,
    "warningExample" TEXT,
    "accent" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sanction_offenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sanction_tiers" (
    "id" TEXT NOT NULL,
    "offenseId" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "step" INTEGER NOT NULL,
    "measureId" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "sanction_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sanction_measures_name_key" ON "sanction_measures"("name");

-- CreateIndex
CREATE INDEX "sanction_measures_weight_idx" ON "sanction_measures"("weight");

-- CreateIndex
CREATE INDEX "sanction_offenses_youtuberId_position_idx" ON "sanction_offenses"("youtuberId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "sanction_offenses_youtuberId_name_key" ON "sanction_offenses"("youtuberId", "name");

-- CreateIndex
CREATE INDEX "sanction_tiers_levelId_idx" ON "sanction_tiers"("levelId");

-- CreateIndex
CREATE UNIQUE INDEX "sanction_tiers_offenseId_levelId_step_key" ON "sanction_tiers"("offenseId", "levelId", "step");

-- AddForeignKey
ALTER TABLE "sanction_offenses" ADD CONSTRAINT "sanction_offenses_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sanction_tiers" ADD CONSTRAINT "sanction_tiers_offenseId_fkey" FOREIGN KEY ("offenseId") REFERENCES "sanction_offenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sanction_tiers" ADD CONSTRAINT "sanction_tiers_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "livecon_levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sanction_tiers" ADD CONSTRAINT "sanction_tiers_measureId_fkey" FOREIGN KEY ("measureId") REFERENCES "sanction_measures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
