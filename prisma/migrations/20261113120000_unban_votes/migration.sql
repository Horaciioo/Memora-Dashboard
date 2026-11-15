-- CreateEnum
CREATE TYPE "UnbanVoteChoice" AS ENUM ('FOR', 'AGAINST');

-- CreateTable
CREATE TABLE "unban_votes" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "choice" "UnbanVoteChoice" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unban_votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unban_votes_requestId_voterId_key" ON "unban_votes"("requestId", "voterId");

-- AddForeignKey
ALTER TABLE "unban_votes" ADD CONSTRAINT "unban_votes_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "unban_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unban_votes" ADD CONSTRAINT "unban_votes_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
