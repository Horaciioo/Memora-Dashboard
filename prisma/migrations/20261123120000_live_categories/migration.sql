-- CreateTable
CREATE TABLE "live_categories" (
    "id" TEXT NOT NULL,
    "liveId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "artUrl" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "live_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "live_categories_liveId_startedAt_idx" ON "live_categories"("liveId", "startedAt");

-- AddForeignKey
ALTER TABLE "live_categories" ADD CONSTRAINT "live_categories_liveId_fkey" FOREIGN KEY ("liveId") REFERENCES "lives"("id") ON DELETE CASCADE ON UPDATE CASCADE;
