-- Unread notifications older than 24 hours count as read, nothing is deleted
UPDATE "notifications" SET "readAt" = now() WHERE "readAt" IS NULL AND "createdAt" < now() - interval '24 hours';
