-- CreateTable
CREATE TABLE "unban_links" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "youtuberId" TEXT NOT NULL,
    "expectedDiscordId" TEXT,
    "label" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "revokedById" TEXT,
    "createdById" TEXT,
    "expiredLoggedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unban_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unban_links_tokenHash_key" ON "unban_links"("tokenHash");

-- CreateIndex
CREATE INDEX "unban_links_youtuberId_createdAt_idx" ON "unban_links"("youtuberId", "createdAt");

-- CreateIndex
CREATE INDEX "unban_links_expiresAt_idx" ON "unban_links"("expiresAt");

-- AddForeignKey
ALTER TABLE "unban_links" ADD CONSTRAINT "unban_links_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unban_links" ADD CONSTRAINT "unban_links_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unban_links" ADD CONSTRAINT "unban_links_revokedById_fkey" FOREIGN KEY ("revokedById") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
