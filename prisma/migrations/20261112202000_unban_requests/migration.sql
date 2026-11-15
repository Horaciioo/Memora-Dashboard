-- CreateEnum
CREATE TYPE "UnbanStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'ACCEPTED', 'REFUSED');

-- CreateTable
CREATE TABLE "unban_requests" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "youtuberId" TEXT NOT NULL,
    "formVersionId" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "discordName" TEXT NOT NULL,
    "discordAvatar" TEXT,
    "answers" TEXT NOT NULL,
    "status" "UnbanStatus" NOT NULL DEFAULT 'PENDING',
    "assigneeId" TEXT,
    "reviewNote" TEXT,
    "decidedAt" TIMESTAMP(3),
    "decidedById" TEXT,
    "discordLiftedAt" TIMESTAMP(3),
    "discordLiftedById" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "cycle" INTEGER NOT NULL DEFAULT 0,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unban_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unban_requests_reference_key" ON "unban_requests"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "unban_requests_linkId_key" ON "unban_requests"("linkId");

-- CreateIndex
CREATE INDEX "unban_requests_youtuberId_status_submittedAt_idx" ON "unban_requests"("youtuberId", "status", "submittedAt");

-- CreateIndex
CREATE INDEX "unban_requests_discordId_idx" ON "unban_requests"("discordId");

-- CreateIndex
CREATE INDEX "unban_requests_assigneeId_status_idx" ON "unban_requests"("assigneeId", "status");

-- CreateIndex
CREATE INDEX "unban_requests_status_decidedAt_idx" ON "unban_requests"("status", "decidedAt");

-- One open request per person and server, Prisma cannot declare a partial index
CREATE UNIQUE INDEX "unban_requests_single_open" ON "unban_requests"("youtuberId", "discordId") WHERE "status" IN ('PENDING', 'IN_REVIEW');

-- AddForeignKey
ALTER TABLE "unban_requests" ADD CONSTRAINT "unban_requests_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "unban_links"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unban_requests" ADD CONSTRAINT "unban_requests_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unban_requests" ADD CONSTRAINT "unban_requests_formVersionId_fkey" FOREIGN KEY ("formVersionId") REFERENCES "unban_form_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unban_requests" ADD CONSTRAINT "unban_requests_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unban_requests" ADD CONSTRAINT "unban_requests_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unban_requests" ADD CONSTRAINT "unban_requests_discordLiftedById_fkey" FOREIGN KEY ("discordLiftedById") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
