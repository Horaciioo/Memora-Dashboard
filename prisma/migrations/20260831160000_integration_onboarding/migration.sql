-- AlterEnum
ALTER TYPE "MemberStatus" ADD VALUE 'PENDING' BEFORE 'ACADEMY';

-- CreateEnum
CREATE TYPE "IntegrationLinkKind" AS ENUM ('ACCOUNT', 'PROFILE', 'ACADEMY');

-- CreateEnum
CREATE TYPE "ConstraintKind" AS ENUM ('MEDICAL', 'ILLNESS', 'PRIVATE');

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN "theme" TEXT,
ADD COLUMN "colorVision" TEXT,
ADD COLUMN "fontScale" TEXT;

-- AlterTable
ALTER TABLE "youtubers" ADD COLUMN "bannerUrl" TEXT;

-- CreateTable
CREATE TABLE "youtuber_functions" (
    "id" TEXT NOT NULL,
    "youtuberId" TEXT NOT NULL,
    "functionId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "youtuber_functions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "youtuber_functions_youtuberId_functionId_key" ON "youtuber_functions"("youtuberId", "functionId");

-- CreateIndex
CREATE INDEX "youtuber_functions_functionId_idx" ON "youtuber_functions"("functionId");

-- AddForeignKey
ALTER TABLE "youtuber_functions" ADD CONSTRAINT "youtuber_functions_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youtuber_functions" ADD CONSTRAINT "youtuber_functions_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "job_functions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "social_networks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "urlPrefix" TEXT NOT NULL,
    "accent" TEXT,
    "avatarUrl" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_networks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "social_networks_name_key" ON "social_networks"("name");

-- AlterTable
ALTER TABLE "social_links" ADD COLUMN "networkId" TEXT;

-- CreateIndex
CREATE INDEX "social_links_networkId_idx" ON "social_links"("networkId");

-- AddForeignKey
ALTER TABLE "social_links" ADD CONSTRAINT "social_links_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "social_networks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "account_constraints" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "kind" "ConstraintKind" NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_constraints_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_constraints_accountId_kind_key" ON "account_constraints"("accountId", "kind");

-- AddForeignKey
ALTER TABLE "account_constraints" ADD CONSTRAINT "account_constraints_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameTable
ALTER TABLE "session_invites" RENAME TO "integration_invites";

-- RenameConstraint
ALTER TABLE "integration_invites" RENAME CONSTRAINT "session_invites_pkey" TO "integration_invites_pkey";
ALTER TABLE "integration_invites" RENAME CONSTRAINT "session_invites_sessionId_fkey" TO "integration_invites_sessionId_fkey";
ALTER TABLE "integration_invites" RENAME CONSTRAINT "session_invites_dispositifId_fkey" TO "integration_invites_dispositifId_fkey";
ALTER TABLE "integration_invites" RENAME CONSTRAINT "session_invites_createdById_fkey" TO "integration_invites_createdById_fkey";

-- RenameIndex
ALTER INDEX "session_invites_token_key" RENAME TO "integration_invites_token_key";
ALTER INDEX "session_invites_sessionId_idx" RENAME TO "integration_invites_sessionId_idx";

-- AlterTable
ALTER TABLE "integration_invites" ADD COLUMN "kind" "IntegrationLinkKind" NOT NULL DEFAULT 'ACCOUNT',
ADD COLUMN "youtuberId" TEXT,
ADD COLUMN "functionId" TEXT,
ADD COLUMN "recruitmentSessionId" TEXT,
ALTER COLUMN "sessionId" DROP NOT NULL;

-- Every link opened before this migration admitted into an Academy session
UPDATE "integration_invites" SET "kind" = 'ACADEMY' WHERE "sessionId" IS NOT NULL;

-- CreateIndex
CREATE INDEX "integration_invites_recruitmentSessionId_idx" ON "integration_invites"("recruitmentSessionId");

-- CreateIndex
CREATE INDEX "integration_invites_youtuberId_idx" ON "integration_invites"("youtuberId");

-- AddForeignKey
ALTER TABLE "integration_invites" ADD CONSTRAINT "integration_invites_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_invites" ADD CONSTRAINT "integration_invites_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "job_functions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "integration_claims" (
    "id" TEXT NOT NULL,
    "inviteId" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "discordUsername" TEXT,
    "discordAvatarHash" TEXT,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "accountId" TEXT,

    CONSTRAINT "integration_claims_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "integration_claims_inviteId_discordId_key" ON "integration_claims"("inviteId", "discordId");

-- CreateIndex
CREATE INDEX "integration_claims_discordId_idx" ON "integration_claims"("discordId");

-- AddForeignKey
ALTER TABLE "integration_claims" ADD CONSTRAINT "integration_claims_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "integration_invites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_claims" ADD CONSTRAINT "integration_claims_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "recruitment_sessions" ADD COLUMN "academySessionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "recruitment_sessions_academySessionId_key" ON "recruitment_sessions"("academySessionId");

-- AddForeignKey
ALTER TABLE "recruitment_sessions" ADD CONSTRAINT "recruitment_sessions_academySessionId_fkey" FOREIGN KEY ("academySessionId") REFERENCES "academy_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_invites" ADD CONSTRAINT "integration_invites_recruitmentSessionId_fkey" FOREIGN KEY ("recruitmentSessionId") REFERENCES "recruitment_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
