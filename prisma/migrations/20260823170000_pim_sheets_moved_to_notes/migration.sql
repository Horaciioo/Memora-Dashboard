-- Copy every review sheet over as a private remark before the table goes away
INSERT INTO "account_notes" ("id", "accountId", "authorId", "body", "pinned", "createdAt", "updatedAt")
SELECT "id", "accountId", "authorId", "sheet", false, "createdAt", "updatedAt"
FROM "pims";

-- DropForeignKey
ALTER TABLE "pims" DROP CONSTRAINT "pims_accountId_fkey";

-- DropForeignKey
ALTER TABLE "pims" DROP CONSTRAINT "pims_authorId_fkey";

-- DropTable
DROP TABLE "pims";
