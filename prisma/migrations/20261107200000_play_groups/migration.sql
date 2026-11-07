-- Lasting groups of players with invitations and game proposals
CREATE TABLE "play_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "play_groups_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "play_group_members" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "play_group_members_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "play_group_invites" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "inviteeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "play_group_invites_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "play_group_proposals" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "game" "PlayGame" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "play_group_proposals_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "play_groups_hostId_idx" ON "play_groups"("hostId");
CREATE UNIQUE INDEX "play_group_members_accountId_key" ON "play_group_members"("accountId");
CREATE INDEX "play_group_members_groupId_idx" ON "play_group_members"("groupId");
CREATE INDEX "play_group_invites_inviteeId_idx" ON "play_group_invites"("inviteeId");
CREATE UNIQUE INDEX "play_group_invites_groupId_inviteeId_key" ON "play_group_invites"("groupId", "inviteeId");
CREATE UNIQUE INDEX "play_group_proposals_groupId_accountId_game_key" ON "play_group_proposals"("groupId", "accountId", "game");

ALTER TABLE "play_groups" ADD CONSTRAINT "play_groups_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "play_group_members" ADD CONSTRAINT "play_group_members_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "play_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "play_group_members" ADD CONSTRAINT "play_group_members_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "play_group_invites" ADD CONSTRAINT "play_group_invites_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "play_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "play_group_invites" ADD CONSTRAINT "play_group_invites_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "play_group_proposals" ADD CONSTRAINT "play_group_proposals_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "play_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "play_group_proposals" ADD CONSTRAINT "play_group_proposals_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
