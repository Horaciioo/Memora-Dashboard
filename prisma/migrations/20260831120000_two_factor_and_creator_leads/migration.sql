-- Second factor of one member, its secret encrypted at rest
CREATE TABLE "two_factor_credentials" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "lastStep" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "two_factor_credentials_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "two_factor_credentials_accountId_key" ON "two_factor_credentials"("accountId");

ALTER TABLE "two_factor_credentials" ADD CONSTRAINT "two_factor_credentials_accountId_fkey"
    FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Single-use fallback code, only ever stored as a digest
CREATE TABLE "two_factor_recovery_codes" (
    "id" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "digest" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "two_factor_recovery_codes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "two_factor_recovery_codes_credentialId_idx" ON "two_factor_recovery_codes"("credentialId");
CREATE UNIQUE INDEX "two_factor_recovery_codes_credentialId_digest_key" ON "two_factor_recovery_codes"("credentialId", "digest");

ALTER TABLE "two_factor_recovery_codes" ADD CONSTRAINT "two_factor_recovery_codes_credentialId_fkey"
    FOREIGN KEY ("credentialId") REFERENCES "two_factor_credentials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- How long a session keeps its sensitive data unsealed
ALTER TABLE "sessions" ADD COLUMN "unsealedAt" TIMESTAMP(3);

-- Responsable anchored on one creator, optionally narrowed to one of its teams
CREATE TABLE "youtuber_leads" (
    "id" TEXT NOT NULL,
    "youtuberId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "teamId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "youtuber_leads_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "youtuber_leads_accountId_idx" ON "youtuber_leads"("accountId");
CREATE INDEX "youtuber_leads_teamId_idx" ON "youtuber_leads"("teamId");
CREATE UNIQUE INDEX "youtuber_leads_youtuberId_accountId_key" ON "youtuber_leads"("youtuberId", "accountId");

ALTER TABLE "youtuber_leads" ADD CONSTRAINT "youtuber_leads_youtuberId_fkey"
    FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "youtuber_leads" ADD CONSTRAINT "youtuber_leads_accountId_fkey"
    FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "youtuber_leads" ADD CONSTRAINT "youtuber_leads_teamId_fkey"
    FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
