-- AlterTable
ALTER TABLE "youtuber_banners" ADD COLUMN "slot" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "youtuber_banners_youtuberId_slot_key" ON "youtuber_banners"("youtuberId", "slot");

-- First banner of each bank becomes the main one
UPDATE "youtuber_banners" SET "slot" = 'main'
WHERE "id" IN (
  SELECT DISTINCT ON ("youtuberId") "id" FROM "youtuber_banners" ORDER BY "youtuberId", "position", "createdAt"
);
