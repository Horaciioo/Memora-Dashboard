-- CreateEnum
CREATE TYPE "MeetingAudience" AS ENUM ('EVERYONE', 'INVITED');

-- AlterEnum
ALTER TYPE "MemberRole" ADD VALUE 'JUNIOR';

-- AlterTable
ALTER TABLE "meetings" ADD COLUMN     "audience" "MeetingAudience" NOT NULL DEFAULT 'INVITED';

-- AlterTable
ALTER TABLE "pim_step_templates" ADD COLUMN     "destination" TEXT,
ADD COLUMN     "guide" TEXT,
ADD COLUMN     "icon" TEXT;

-- AlterTable
ALTER TABLE "academy_juniors" ADD COLUMN     "candidateId" TEXT,
ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ALTER COLUMN "dispositifId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "recruitment_candidates" ADD COLUMN     "displayName" TEXT;

-- AlterTable
ALTER TABLE "recruitment_outcomes" ADD COLUMN     "admits" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "academy_juniors_candidateId_key" ON "academy_juniors"("candidateId");

-- AddForeignKey
ALTER TABLE "academy_juniors" ADD CONSTRAINT "academy_juniors_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "recruitment_candidates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
