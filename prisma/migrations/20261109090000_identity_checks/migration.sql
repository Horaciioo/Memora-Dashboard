-- Accounts of accepted candidates opened by a responsable, no link needed
ALTER TABLE "recruitment_sessions" ADD COLUMN "accountsActivatedAt" TIMESTAMP(3);

-- Discord identity checked before any session opens
CREATE TYPE "IdentityCheckStatus" AS ENUM ('OPEN', 'ESCALATED', 'RESOLVED', 'DONE');

CREATE TABLE "identity_checks" (
    "id" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "discordUsername" TEXT,
    "discordAvatarHash" TEXT,
    "accountId" TEXT,
    "status" "IdentityCheckStatus" NOT NULL DEFAULT 'OPEN',
    "typedName" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "candidateId" TEXT,
    "resolvedDiscordId" TEXT,
    "resolvedById" TEXT,
    "linkToken" TEXT,
    "linkExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "identity_checks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "identity_checks_linkToken_key" ON "identity_checks"("linkToken");
CREATE INDEX "identity_checks_status_createdAt_idx" ON "identity_checks"("status", "createdAt");

ALTER TABLE "identity_checks" ADD CONSTRAINT "identity_checks_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "identity_checks" ADD CONSTRAINT "identity_checks_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "recruitment_candidates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "identity_checks" ADD CONSTRAINT "identity_checks_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
