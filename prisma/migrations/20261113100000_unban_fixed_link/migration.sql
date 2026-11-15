-- One permanent link per creator replaces the single-use links
ALTER TABLE "unban_requests" DROP CONSTRAINT "unban_requests_linkId_fkey";
DROP INDEX "unban_requests_linkId_key";
ALTER TABLE "unban_requests" DROP COLUMN "linkId";
DROP TABLE "unban_links";
