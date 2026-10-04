-- CreateEnum
CREATE TYPE "DepartureKind" AS ENUM ('DISMISSAL', 'RESIGNATION');

-- AlterEnum
ALTER TYPE "AcademyJuniorStatus" ADD VALUE 'RESIGNED';

-- AlterEnum
ALTER TYPE "MemberStatus" ADD VALUE 'DISMISSED';
ALTER TYPE "MemberStatus" ADD VALUE 'RESIGNED';

-- AlterTable
ALTER TABLE "academy_juniors" ADD COLUMN     "deadlineAt" TIMESTAMP(3),
ADD COLUMN     "kickoffAt" TIMESTAMP(3),
ADD COLUMN     "leftAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "academy_reviews" ADD COLUMN     "decision" "ReviewAdvice";

-- AlterTable
ALTER TABLE "academy_sessions" ADD COLUMN     "secondPeriodAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "departure_notices" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "kind" "DepartureKind" NOT NULL,
    "functionName" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "publishedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departure_notices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "departure_notices_publishedAt_idx" ON "departure_notices"("publishedAt");

-- AddForeignKey
ALTER TABLE "departure_notices" ADD CONSTRAINT "departure_notices_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departure_notices" ADD CONSTRAINT "departure_notices_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

