-- CreateTable
CREATE TABLE "_MeetingToYoutuber" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MeetingToYoutuber_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProjectToYoutuber" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProjectToYoutuber_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_TaskToYoutuber" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TaskToYoutuber_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_MeetingToYoutuber_B_index" ON "_MeetingToYoutuber"("B");

-- CreateIndex
CREATE INDEX "_ProjectToYoutuber_B_index" ON "_ProjectToYoutuber"("B");

-- CreateIndex
CREATE INDEX "_TaskToYoutuber_B_index" ON "_TaskToYoutuber"("B");

-- AddForeignKey
ALTER TABLE "_MeetingToYoutuber" ADD CONSTRAINT "_MeetingToYoutuber_A_fkey" FOREIGN KEY ("A") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MeetingToYoutuber" ADD CONSTRAINT "_MeetingToYoutuber_B_fkey" FOREIGN KEY ("B") REFERENCES "youtubers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToYoutuber" ADD CONSTRAINT "_ProjectToYoutuber_A_fkey" FOREIGN KEY ("A") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToYoutuber" ADD CONSTRAINT "_ProjectToYoutuber_B_fkey" FOREIGN KEY ("B") REFERENCES "youtubers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskToYoutuber" ADD CONSTRAINT "_TaskToYoutuber_A_fkey" FOREIGN KEY ("A") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskToYoutuber" ADD CONSTRAINT "_TaskToYoutuber_B_fkey" FOREIGN KEY ("B") REFERENCES "youtubers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Carry the single creator over
INSERT INTO "_ProjectToYoutuber" ("A", "B") SELECT "id", "youtuberId" FROM "projects" WHERE "youtuberId" IS NOT NULL;
INSERT INTO "_TaskToYoutuber" ("A", "B") SELECT "id", "youtuberId" FROM "tasks" WHERE "youtuberId" IS NOT NULL;
INSERT INTO "_MeetingToYoutuber" ("A", "B") SELECT "id", "youtuberId" FROM "meetings" WHERE "youtuberId" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_youtuberId_fkey";
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_youtuberId_fkey";
ALTER TABLE "meetings" DROP CONSTRAINT "meetings_youtuberId_fkey";

-- DropIndex
DROP INDEX "projects_youtuberId_idx";

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "youtuberId";
ALTER TABLE "tasks" DROP COLUMN "youtuberId";
ALTER TABLE "meetings" DROP COLUMN "youtuberId";
