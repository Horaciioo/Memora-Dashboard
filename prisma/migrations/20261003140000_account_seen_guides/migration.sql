-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "seenGuides" TEXT[] DEFAULT ARRAY[]::TEXT[];

