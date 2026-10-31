-- CreateTable
CREATE TABLE "recruitment_bans" (
    "id" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "sessionId" TEXT,
    "displayName" TEXT,
    "reason" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recruitment_bans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recruitment_bans_discordId_key" ON "recruitment_bans"("discordId");

-- CreateIndex
CREATE INDEX "recruitment_bans_sessionId_idx" ON "recruitment_bans"("sessionId");

-- AddForeignKey
ALTER TABLE "recruitment_bans" ADD CONSTRAINT "recruitment_bans_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "recruitment_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_bans" ADD CONSTRAINT "recruitment_bans_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
