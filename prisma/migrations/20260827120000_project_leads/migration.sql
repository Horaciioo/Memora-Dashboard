-- CreateTable
CREATE TABLE "project_leads" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_leads_projectId_accountId_key" ON "project_leads"("projectId", "accountId");

-- AddForeignKey
ALTER TABLE "project_leads" ADD CONSTRAINT "project_leads_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_leads" ADD CONSTRAINT "project_leads_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Carry the existing single lead of each project into the join table
INSERT INTO "project_leads" ("id", "projectId", "accountId", "createdAt")
SELECT gen_random_uuid(), "id", "leadId", now()
FROM "projects"
WHERE "leadId" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_leadId_fkey";

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "leadId";
