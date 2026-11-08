-- Where a stored chat message comes from
CREATE TYPE "ChatSource" AS ENUM ('LIVE', 'IMPORT');

-- Chat message of a viewer, kept for the dossier
CREATE TABLE "live_chat_messages" (
    "id" TEXT NOT NULL,
    "youtuberId" TEXT NOT NULL,
    "platform" "LivePlatform" NOT NULL,
    "platformUserId" TEXT NOT NULL,
    "viewerLogin" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL,
    "liveId" TEXT,
    "source" "ChatSource" NOT NULL DEFAULT 'LIVE',
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "live_chat_messages_pkey" PRIMARY KEY ("id")
);

-- What is known of a viewer's chat on one channel
CREATE TABLE "viewer_chat_stats" (
    "youtuberId" TEXT NOT NULL,
    "platform" "LivePlatform" NOT NULL,
    "platformUserId" TEXT NOT NULL,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "firstMessageAt" TIMESTAMP(3) NOT NULL,
    "firstSource" "ChatSource" NOT NULL DEFAULT 'LIVE',
    "isComplete" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "viewer_chat_stats_pkey" PRIMARY KEY ("youtuberId","platform","platformUserId")
);

CREATE UNIQUE INDEX "live_chat_messages_external_key" ON "live_chat_messages"("youtuberId", "platform", "externalId");
CREATE INDEX "live_chat_messages_viewer_idx" ON "live_chat_messages"("youtuberId", "platform", "platformUserId", "sentAt");
CREATE INDEX "live_chat_messages_sentAt_idx" ON "live_chat_messages"("sentAt");

ALTER TABLE "live_chat_messages" ADD CONSTRAINT "live_chat_messages_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "live_chat_messages" ADD CONSTRAINT "live_chat_messages_liveId_fkey" FOREIGN KEY ("liveId") REFERENCES "lives"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "viewer_chat_stats" ADD CONSTRAINT "viewer_chat_stats_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
