-- CreateTable
CREATE TABLE "play_group_quests" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "play_group_quests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "play_group_quests_groupId_startedAt_idx" ON "play_group_quests"("groupId", "startedAt");

-- AddForeignKey
ALTER TABLE "play_group_quests" ADD CONSTRAINT "play_group_quests_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "play_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
