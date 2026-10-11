-- CreateTable
CREATE TABLE "team_leads" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_leads_pkey" PRIMARY KEY ("id")
);

-- Keep every existing lead
INSERT INTO "team_leads" ("id", "teamId", "accountId")
SELECT 'tl_' || "id", "id", "leadId" FROM "teams" WHERE "leadId" IS NOT NULL;

-- CreateIndex
CREATE INDEX "team_leads_accountId_idx" ON "team_leads"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "team_leads_teamId_accountId_key" ON "team_leads"("teamId", "accountId");

-- AddForeignKey
ALTER TABLE "team_leads" ADD CONSTRAINT "team_leads_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_leads" ADD CONSTRAINT "team_leads_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "teams" DROP CONSTRAINT "teams_leadId_fkey";

-- DropIndex
DROP INDEX "teams_leadId_idx";

-- AlterTable
ALTER TABLE "teams" DROP COLUMN "leadId";

-- Several channels per platform
DROP INDEX "youtuber_channels_youtuberId_platform_key";

-- CreateIndex
CREATE INDEX "youtuber_channels_youtuberId_idx" ON "youtuber_channels"("youtuberId");
