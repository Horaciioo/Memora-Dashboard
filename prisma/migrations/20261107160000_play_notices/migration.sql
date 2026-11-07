-- Followed games tell their followers when they start and end
CREATE TYPE "PlayNoticeKind" AS ENUM ('STARTED', 'FINISHED');

CREATE TABLE "play_follows" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "play_follows_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "play_notices" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "kind" "PlayNoticeKind" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "play_notices_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "play_follows_sessionId_idx" ON "play_follows"("sessionId");
CREATE UNIQUE INDEX "play_follows_accountId_sessionId_key" ON "play_follows"("accountId", "sessionId");
CREATE INDEX "play_notices_accountId_idx" ON "play_notices"("accountId");
CREATE UNIQUE INDEX "play_notices_accountId_sessionId_kind_key" ON "play_notices"("accountId", "sessionId", "kind");

ALTER TABLE "play_follows" ADD CONSTRAINT "play_follows_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "play_follows" ADD CONSTRAINT "play_follows_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "play_notices" ADD CONSTRAINT "play_notices_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "play_notices" ADD CONSTRAINT "play_notices_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
