-- Play settings steered from the administration
CREATE TABLE "play_config" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "featuredGames" "PlayGame"[] DEFAULT ARRAY[]::"PlayGame"[],
    "featuredBoostOn" BOOLEAN NOT NULL DEFAULT true,
    "featuredBoostPercent" INTEGER NOT NULL DEFAULT 30,
    "featuredBoostUntil" TIMESTAMP(3),
    "globalBoostOn" BOOLEAN NOT NULL DEFAULT false,
    "globalBoostPercent" INTEGER NOT NULL DEFAULT 20,
    "globalBoostUntil" TIMESTAMP(3),
    "tablesPaused" BOOLEAN NOT NULL DEFAULT false,
    "announcement" TEXT,
    "announcementOn" BOOLEAN NOT NULL DEFAULT false,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "play_config_pkey" PRIMARY KEY ("id")
);

-- Banner games of today stay featured
INSERT INTO "play_config" ("id", "featuredGames", "updatedAt")
VALUES ('global', ARRAY['STOP_GO', 'CONCORDAT']::"PlayGame"[], CURRENT_TIMESTAMP);
