-- CreateTable
CREATE TABLE "viewer_comments" (
    "id" TEXT NOT NULL,
    "youtuberId" TEXT NOT NULL,
    "platform" "LivePlatform" NOT NULL,
    "platformUserId" TEXT NOT NULL,
    "viewerLogin" TEXT NOT NULL,
    "authorAccountId" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "viewer_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "viewer_comments_viewer_idx" ON "viewer_comments"("youtuberId", "platform", "platformUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "viewer_comments" ADD CONSTRAINT "viewer_comments_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viewer_comments" ADD CONSTRAINT "viewer_comments_authorAccountId_fkey" FOREIGN KEY ("authorAccountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
