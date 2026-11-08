-- A player may sit in several groups, groups gain a chat
DROP INDEX "play_group_members_accountId_key";
CREATE UNIQUE INDEX "play_group_members_groupId_accountId_key" ON "play_group_members"("groupId", "accountId");
CREATE INDEX "play_group_members_accountId_idx" ON "play_group_members"("accountId");

CREATE TABLE "play_group_messages" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "play_group_messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "play_group_messages_groupId_createdAt_idx" ON "play_group_messages"("groupId", "createdAt");

ALTER TABLE "play_group_messages" ADD CONSTRAINT "play_group_messages_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "play_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "play_group_messages" ADD CONSTRAINT "play_group_messages_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
