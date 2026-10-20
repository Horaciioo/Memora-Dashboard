-- A remark can sit on a whole session as well as on an application
ALTER TABLE "recruitment_comments" ALTER COLUMN "candidateId" DROP NOT NULL;
ALTER TABLE "recruitment_comments" ADD COLUMN "sessionId" TEXT;

CREATE INDEX "recruitment_comments_sessionId_createdAt_idx" ON "recruitment_comments"("sessionId", "createdAt");

ALTER TABLE "recruitment_comments" ADD CONSTRAINT "recruitment_comments_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "recruitment_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
