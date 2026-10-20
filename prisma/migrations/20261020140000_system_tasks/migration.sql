-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "href" TEXT,
ADD COLUMN     "systemKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "tasks_systemKey_key" ON "tasks"("systemKey");
