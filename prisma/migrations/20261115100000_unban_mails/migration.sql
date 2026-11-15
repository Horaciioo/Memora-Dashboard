-- CreateEnum
CREATE TYPE "MailStatus" AS ENUM ('SENT', 'FAILED', 'SKIPPED');

-- AlterTable
ALTER TABLE "unban_requests" ADD COLUMN "email" TEXT;

-- CreateTable
CREATE TABLE "mail_deliveries" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "requestId" TEXT,
    "reference" TEXT,
    "status" "MailStatus" NOT NULL,
    "providerId" TEXT,
    "detail" TEXT,
    "isTest" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mail_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mail_deliveries_createdAt_idx" ON "mail_deliveries"("createdAt");

-- CreateIndex
CREATE INDEX "mail_deliveries_requestId_idx" ON "mail_deliveries"("requestId");

-- AddForeignKey
ALTER TABLE "mail_deliveries" ADD CONSTRAINT "mail_deliveries_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "unban_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
