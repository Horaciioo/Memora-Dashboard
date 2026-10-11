-- AlterTable
ALTER TABLE "accounts" ADD COLUMN "frozenAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "live_suspensions" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "createdById" TEXT,
    "liftedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "live_suspensions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "live_suspensions_accountId_endsAt_idx" ON "live_suspensions"("accountId", "endsAt");

-- AddForeignKey
ALTER TABLE "live_suspensions" ADD CONSTRAINT "live_suspensions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_suspensions" ADD CONSTRAINT "live_suspensions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
