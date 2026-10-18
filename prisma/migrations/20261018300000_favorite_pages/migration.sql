-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "favoritePages" TEXT[] DEFAULT ARRAY[]::TEXT[];
