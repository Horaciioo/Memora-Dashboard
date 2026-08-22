-- AlterTable
ALTER TABLE "teams" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "teams_youtuberId_archived_idx" ON "teams"("youtuberId", "archived");

