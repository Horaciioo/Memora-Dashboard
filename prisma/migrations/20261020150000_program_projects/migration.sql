-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "academySessionId" TEXT,
ADD COLUMN     "recruitmentSessionId" TEXT,
ADD COLUMN     "systemKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "projects_systemKey_key" ON "projects"("systemKey");

-- CreateIndex
CREATE UNIQUE INDEX "projects_recruitmentSessionId_key" ON "projects"("recruitmentSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "projects_academySessionId_key" ON "projects"("academySessionId");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_recruitmentSessionId_fkey" FOREIGN KEY ("recruitmentSessionId") REFERENCES "recruitment_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_academySessionId_fkey" FOREIGN KEY ("academySessionId") REFERENCES "academy_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
