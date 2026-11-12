-- AlterTable
ALTER TABLE "work_comments" ADD COLUMN     "unbanRequestId" TEXT;

-- CreateIndex
CREATE INDEX "work_comments_unbanRequestId_createdAt_idx" ON "work_comments"("unbanRequestId", "createdAt");

-- AddForeignKey
ALTER TABLE "work_comments" ADD CONSTRAINT "work_comments_unbanRequestId_fkey" FOREIGN KEY ("unbanRequestId") REFERENCES "unban_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
