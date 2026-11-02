-- Shared editing state of a page, the JSON content stays derived from it
ALTER TABLE "pages" ADD COLUMN "yState" BYTEA;
