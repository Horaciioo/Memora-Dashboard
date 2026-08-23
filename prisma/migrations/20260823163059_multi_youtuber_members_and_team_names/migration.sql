-- CreateTable
CREATE TABLE "_AccountToYoutuber" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AccountToYoutuber_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AccountToYoutuber_B_index" ON "_AccountToYoutuber"("B");

-- AddForeignKey
ALTER TABLE "_AccountToYoutuber" ADD CONSTRAINT "_AccountToYoutuber_A_fkey" FOREIGN KEY ("A") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccountToYoutuber" ADD CONSTRAINT "_AccountToYoutuber_B_fkey" FOREIGN KEY ("B") REFERENCES "youtubers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Carry every existing single assignment over to the new many-to-many join table
INSERT INTO "_AccountToYoutuber" ("A", "B")
SELECT "id", "youtuberId" FROM "accounts" WHERE "youtuberId" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_youtuberId_fkey";

-- DropIndex
DROP INDEX "accounts_youtuberId_idx";

-- DropIndex
DROP INDEX "teams_name_key";

-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "youtuberId";
