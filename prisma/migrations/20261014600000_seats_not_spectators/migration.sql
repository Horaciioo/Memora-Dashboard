-- Rename table
ALTER TABLE "recruitment_spectators" RENAME TO "recruitment_seats";

-- Rename key, index and foreign keys
ALTER TABLE "recruitment_seats" RENAME CONSTRAINT "recruitment_spectators_pkey" TO "recruitment_seats_pkey";
ALTER INDEX "recruitment_spectators_accountId_idx" RENAME TO "recruitment_seats_accountId_idx";
ALTER TABLE "recruitment_seats" RENAME CONSTRAINT "recruitment_spectators_candidateId_fkey" TO "recruitment_seats_candidateId_fkey";
ALTER TABLE "recruitment_seats" RENAME CONSTRAINT "recruitment_spectators_accountId_fkey" TO "recruitment_seats_accountId_fkey";
