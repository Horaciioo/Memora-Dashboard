-- Create table
CREATE TABLE "academy_comments" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT,
    "juniorId" TEXT,
    "authorId" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academy_comments_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "academy_comments_sessionId_createdAt_idx" ON "academy_comments"("sessionId", "createdAt");
CREATE INDEX "academy_comments_juniorId_createdAt_idx" ON "academy_comments"("juniorId", "createdAt");

-- Foreign keys
ALTER TABLE "academy_comments" ADD CONSTRAINT "academy_comments_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "academy_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "academy_comments" ADD CONSTRAINT "academy_comments_juniorId_fkey" FOREIGN KEY ("juniorId") REFERENCES "academy_juniors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "academy_comments" ADD CONSTRAINT "academy_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
