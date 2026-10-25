-- CreateEnum
CREATE TYPE "PlayInviteRole" AS ENUM ('PLAYER', 'SPECTATOR');

-- CreateTable
CREATE TABLE "play_messages" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "play_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "play_invites" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "inviteeId" TEXT NOT NULL,
    "role" "PlayInviteRole" NOT NULL,
    "answeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "play_invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "play_messages_sessionId_createdAt_idx" ON "play_messages"("sessionId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "play_invites_sessionId_inviteeId_key" ON "play_invites"("sessionId", "inviteeId");

-- CreateIndex
CREATE INDEX "play_invites_inviteeId_answeredAt_idx" ON "play_invites"("inviteeId", "answeredAt");

-- AddForeignKey
ALTER TABLE "play_messages" ADD CONSTRAINT "play_messages_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_messages" ADD CONSTRAINT "play_messages_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_invites" ADD CONSTRAINT "play_invites_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_invites" ADD CONSTRAINT "play_invites_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_invites" ADD CONSTRAINT "play_invites_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
