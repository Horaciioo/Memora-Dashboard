-- CreateEnum
CREATE TYPE "DiscordAnchorKind" AS ENUM ('ROLE', 'CHANNEL');

-- CreateTable
CREATE TABLE "discord_anchors" (
    "id" TEXT NOT NULL,
    "youtuberId" TEXT,
    "kind" "DiscordAnchorKind" NOT NULL,
    "name" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "accent" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discord_anchors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "discord_anchors_youtuberId_kind_idx" ON "discord_anchors"("youtuberId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "discord_anchors_youtuberId_kind_discordId_key" ON "discord_anchors"("youtuberId", "kind", "discordId");

-- AddForeignKey
ALTER TABLE "discord_anchors" ADD CONSTRAINT "discord_anchors_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
