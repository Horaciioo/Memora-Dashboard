-- Create table
CREATE TABLE "work_comments" (
    "id" TEXT NOT NULL,
    "projectId" TEXT,
    "taskId" TEXT,
    "communicationId" TEXT,
    "meetingId" TEXT,
    "authorId" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_comments_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "work_comments_projectId_createdAt_idx" ON "work_comments"("projectId", "createdAt");
CREATE INDEX "work_comments_taskId_createdAt_idx" ON "work_comments"("taskId", "createdAt");
CREATE INDEX "work_comments_communicationId_createdAt_idx" ON "work_comments"("communicationId", "createdAt");
CREATE INDEX "work_comments_meetingId_createdAt_idx" ON "work_comments"("meetingId", "createdAt");

-- Foreign keys
ALTER TABLE "work_comments" ADD CONSTRAINT "work_comments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "work_comments" ADD CONSTRAINT "work_comments_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "work_comments" ADD CONSTRAINT "work_comments_communicationId_fkey" FOREIGN KEY ("communicationId") REFERENCES "communications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "work_comments" ADD CONSTRAINT "work_comments_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "work_comments" ADD CONSTRAINT "work_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
