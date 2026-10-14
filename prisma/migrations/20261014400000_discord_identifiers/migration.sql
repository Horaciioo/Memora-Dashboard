-- CreateEnum
CREATE TYPE "DiscordIdKind" AS ENUM ('MEMBER', 'ROLE', 'ACADEMY_ROLE', 'RECRUITMENT_ROLE', 'TEXT_CHANNEL', 'VOICE_CHANNEL', 'SERVER');

-- CreateTable
CREATE TABLE "discord_identifiers" (
    "id" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "kind" "DiscordIdKind" NOT NULL,
    "name" TEXT NOT NULL,
    "youtuberId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discord_identifiers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "discord_identifiers_discordId_key" ON "discord_identifiers"("discordId");

-- CreateIndex
CREATE INDEX "discord_identifiers_kind_idx" ON "discord_identifiers"("kind");

-- CreateIndex
CREATE INDEX "discord_identifiers_youtuberId_idx" ON "discord_identifiers"("youtuberId");

-- AddForeignKey
ALTER TABLE "discord_identifiers" ADD CONSTRAINT "discord_identifiers_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Waiting roles of the first creators
INSERT INTO "discord_identifiers" ("id", "discordId", "kind", "name", "youtuberId", "updatedAt")
SELECT gen_random_uuid()::text, seed."discordId", 'RECRUITMENT_ROLE', 'En attente de passage',
  (SELECT "id" FROM "youtubers" WHERE "name" ILIKE seed."creator" LIMIT 1), CURRENT_TIMESTAMP
FROM (VALUES
  ('1001832029048029235', 'Inox%'),
  ('1324553338250989639', 'Michou%'),
  ('1559900172211724380', 'Doigby%')
) AS seed("discordId", "creator")
ON CONFLICT ("discordId") DO NOTHING;
