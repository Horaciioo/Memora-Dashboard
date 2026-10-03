-- CreateTable
CREATE TABLE "training_feedbacks" (
    "id" TEXT NOT NULL,
    "trainingId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "content" INTEGER NOT NULL,
    "fluency" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "training_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "training_feedbacks_trainingId_createdAt_idx" ON "training_feedbacks"("trainingId", "createdAt");

-- CreateIndex
CREATE INDEX "training_feedbacks_accountId_idx" ON "training_feedbacks"("accountId");

-- AddForeignKey
ALTER TABLE "training_feedbacks" ADD CONSTRAINT "training_feedbacks_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES "trainings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_feedbacks" ADD CONSTRAINT "training_feedbacks_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

