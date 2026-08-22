-- DropForeignKey
ALTER TABLE "social_links" DROP CONSTRAINT "social_links_networkId_fkey";

-- DropIndex
DROP INDEX "social_links_accountId_networkId_key";

-- AlterTable
ALTER TABLE "social_links" DROP COLUMN "networkId",
ADD COLUMN     "accent" TEXT,
ADD COLUMN     "label" TEXT NOT NULL,
ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "social_networks";

-- CreateIndex
CREATE INDEX "social_links_accountId_position_idx" ON "social_links"("accountId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "social_links_accountId_label_key" ON "social_links"("accountId", "label");

