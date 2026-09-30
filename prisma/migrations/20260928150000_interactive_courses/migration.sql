-- AlterTable
ALTER TABLE "trainings" ADD COLUMN     "curriculumKey" TEXT;

-- AlterTable
ALTER TABLE "training_records" ADD COLUMN     "progress" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "trainings_curriculumKey_key" ON "trainings"("curriculumKey");
