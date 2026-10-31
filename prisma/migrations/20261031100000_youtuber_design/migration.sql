-- AlterTable
ALTER TABLE "youtubers" ADD COLUMN "logoUrl" TEXT;

-- CreateTable
CREATE TABLE "youtuber_banners" (
    "id" TEXT NOT NULL,
    "youtuberId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "youtuber_banners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "youtuber_banners_youtuberId_position_idx" ON "youtuber_banners"("youtuberId", "position");

-- AddForeignKey
ALTER TABLE "youtuber_banners" ADD CONSTRAINT "youtuber_banners_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Existing banners seed the bank
INSERT INTO "youtuber_banners" ("id", "youtuberId", "url", "position")
SELECT 'bn' || "id", "id", "bannerUrl", 0 FROM "youtubers" WHERE "bannerUrl" IS NOT NULL;
