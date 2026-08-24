-- CreateEnum
CREATE TYPE "AcademyStage" AS ENUM ('PREPARATION', 'DISCOVERY', 'REVIEW_ONE', 'PRACTICE', 'REVIEW_FINAL', 'BONUS');

-- CreateEnum
CREATE TYPE "StepAnchor" AS ENUM ('DAY', 'LIVE');

-- CreateEnum
CREATE TYPE "StepOwner" AS ENUM ('RESPONSABLE', 'FORMATEURS', 'BOTH', 'JUNIOR');

-- CreateTable
CREATE TABLE "dispositifs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT,
    "accent" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dispositifs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "accent" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skill_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "categoryId" TEXT NOT NULL,
    "functionId" TEXT,
    "dispositifId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pim_step_templates" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "functionId" TEXT,
    "dispositifId" TEXT,
    "stage" "AcademyStage" NOT NULL,
    "anchor" "StepAnchor" NOT NULL,
    "offset" INTEGER NOT NULL,
    "owner" "StepOwner" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pim_step_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dispositifs_name_key" ON "dispositifs"("name");

-- CreateIndex
CREATE UNIQUE INDEX "skill_categories_name_key" ON "skill_categories"("name");

-- CreateIndex
CREATE INDEX "skills_functionId_dispositifId_idx" ON "skills"("functionId", "dispositifId");

-- CreateIndex
CREATE UNIQUE INDEX "skills_name_functionId_dispositifId_key" ON "skills"("name", "functionId", "dispositifId");

-- CreateIndex
CREATE INDEX "pim_step_templates_functionId_dispositifId_idx" ON "pim_step_templates"("functionId", "dispositifId");

-- CreateIndex
CREATE UNIQUE INDEX "pim_step_templates_title_functionId_dispositifId_key" ON "pim_step_templates"("title", "functionId", "dispositifId");

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "skill_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "job_functions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_dispositifId_fkey" FOREIGN KEY ("dispositifId") REFERENCES "dispositifs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pim_step_templates" ADD CONSTRAINT "pim_step_templates_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "job_functions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pim_step_templates" ADD CONSTRAINT "pim_step_templates_dispositifId_fkey" FOREIGN KEY ("dispositifId") REFERENCES "dispositifs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
