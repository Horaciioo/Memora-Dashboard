-- AlterTable
ALTER TABLE "teams" ADD COLUMN     "functionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "teams_youtuberId_functionId_key" ON "teams"("youtuberId", "functionId");

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "job_functions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
