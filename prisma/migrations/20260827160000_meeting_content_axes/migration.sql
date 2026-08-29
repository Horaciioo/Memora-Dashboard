-- AlterTable
ALTER TABLE "meetings" RENAME COLUMN "agenda" TO "introduction";

-- AlterTable
ALTER TABLE "meetings" ADD COLUMN "outro" TEXT;

-- CreateTable
CREATE TABLE "meeting_topics" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meeting_topics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "meeting_topics_meetingId_position_idx" ON "meeting_topics"("meetingId", "position");

-- AddForeignKey
ALTER TABLE "meeting_topics" ADD CONSTRAINT "meeting_topics_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
