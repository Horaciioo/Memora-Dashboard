-- AlterTable
ALTER TABLE "academy_steps" ADD COLUMN     "anchor" "StepAnchor",
ADD COLUMN     "offset" INTEGER,
ADD COLUMN     "owner" "StepOwner",
ADD COLUMN     "required" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stage" "AcademyStage",
ADD COLUMN     "templateId" TEXT,
ADD COLUMN     "validatedAt" TIMESTAMP(3),
ADD COLUMN     "validatedById" TEXT,
ALTER COLUMN "kind" DROP NOT NULL,
ALTER COLUMN "scheduledAt" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "academy_steps_juniorId_stage_idx" ON "academy_steps"("juniorId", "stage");

-- AddForeignKey
ALTER TABLE "academy_steps" ADD CONSTRAINT "academy_steps_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "pim_step_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_steps" ADD CONSTRAINT "academy_steps_validatedById_fkey" FOREIGN KEY ("validatedById") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
