-- Mod View choices of a moderator, one row for the account and one per channel
CREATE TABLE "mod_view_preferences" (
    "accountId" TEXT NOT NULL,
    "scope" TEXT NOT NULL DEFAULT '',
    "values" JSONB NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mod_view_preferences_pkey" PRIMARY KEY ("accountId","scope")
);

ALTER TABLE "mod_view_preferences" ADD CONSTRAINT "mod_view_preferences_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
