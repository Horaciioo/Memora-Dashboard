-- Request context and severity on journal entries
ALTER TABLE "activity_logs" ADD COLUMN "level" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "ip" TEXT,
ADD COLUMN "userAgent" TEXT,
ADD COLUMN "route" TEXT;

-- Errors written before the column are errors
UPDATE "activity_logs" SET "level" = 2 WHERE "eventType" = 49;

-- Filters and sorting
CREATE INDEX "activity_logs_createdAt_idx" ON "activity_logs"("createdAt");
CREATE INDEX "activity_logs_actorId_createdAt_idx" ON "activity_logs"("actorId", "createdAt");
CREATE INDEX "activity_logs_level_createdAt_idx" ON "activity_logs"("level", "createdAt");
