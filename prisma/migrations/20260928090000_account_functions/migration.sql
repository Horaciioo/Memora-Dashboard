-- CreateTable
CREATE TABLE "account_functions" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "functionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_functions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "account_functions_functionId_idx" ON "account_functions"("functionId");

-- CreateIndex
CREATE UNIQUE INDEX "account_functions_accountId_functionId_key" ON "account_functions"("accountId", "functionId");

-- AddForeignKey
ALTER TABLE "account_functions" ADD CONSTRAINT "account_functions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_functions" ADD CONSTRAINT "account_functions_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "job_functions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Carry every function already held over to the new table
INSERT INTO "account_functions" ("id", "accountId", "functionId")
SELECT gen_random_uuid()::text, "id", "primaryFunctionId" FROM "accounts" WHERE "primaryFunctionId" IS NOT NULL
UNION
SELECT gen_random_uuid()::text, "id", "secondaryFunctionId" FROM "accounts" WHERE "secondaryFunctionId" IS NOT NULL
ON CONFLICT ("accountId", "functionId") DO NOTHING;

-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_primaryFunctionId_fkey";

-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_secondaryFunctionId_fkey";

-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "primaryFunctionId",
DROP COLUMN "secondaryFunctionId";
