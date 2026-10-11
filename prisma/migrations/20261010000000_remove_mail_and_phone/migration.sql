-- Mail and phone leave the member file
ALTER TABLE "accounts" DROP COLUMN "email",
DROP COLUMN "phone";
