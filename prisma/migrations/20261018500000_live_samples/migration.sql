-- CreateTable
CREATE TABLE "live_samples" (
    "id" TEXT NOT NULL,
    "liveId" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewers" INTEGER NOT NULL,

    CONSTRAINT "live_samples_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "live_samples_liveId_at_idx" ON "live_samples"("liveId", "at");

-- AddForeignKey
ALTER TABLE "live_samples" ADD CONSTRAINT "live_samples_liveId_fkey" FOREIGN KEY ("liveId") REFERENCES "lives"("id") ON DELETE CASCADE ON UPDATE CASCADE;
