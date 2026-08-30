-- AlterTable
ALTER TABLE "absences" ADD COLUMN     "reasonCode" INTEGER;

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "anonymisedAt" TIMESTAMP(3),
ADD COLUMN     "discordAvatarHash" TEXT,
ADD COLUMN     "discordSyncedAt" TIMESTAMP(3),
ADD COLUMN     "discordUsername" TEXT,
ADD COLUMN     "historyConsentAt" TIMESTAMP(3),
ADD COLUMN     "historyConsentVersion" INTEGER;

-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "address" TEXT,
ADD COLUMN     "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "discord_tokens" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discord_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "discord_tokens_accountId_key" ON "discord_tokens"("accountId");

-- CreateIndex
CREATE INDEX "discord_tokens_expiresAt_idx" ON "discord_tokens"("expiresAt");

-- AddForeignKey
ALTER TABLE "discord_tokens" ADD CONSTRAINT "discord_tokens_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
