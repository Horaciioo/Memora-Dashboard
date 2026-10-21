-- Annual reviews: a period opened by the Responsables, days with their open hours, one review per Moderator
CREATE TABLE "annual_review_periods" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slotMinutes" INTEGER NOT NULL DEFAULT 15,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "annual_review_periods_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "annual_review_windows" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "fromTime" TEXT NOT NULL,
    "toTime" TEXT NOT NULL,

    CONSTRAINT "annual_review_windows_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "annual_reviews" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3),
    "taskId" TEXT,
    "calendarEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "annual_reviews_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "annual_review_windows_periodId_day_key" ON "annual_review_windows"("periodId", "day");
CREATE UNIQUE INDEX "annual_reviews_periodId_accountId_key" ON "annual_reviews"("periodId", "accountId");
-- One place per slot
CREATE UNIQUE INDEX "annual_reviews_periodId_startsAt_key" ON "annual_reviews"("periodId", "startsAt");
CREATE INDEX "annual_reviews_accountId_idx" ON "annual_reviews"("accountId");

ALTER TABLE "annual_review_windows" ADD CONSTRAINT "annual_review_windows_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "annual_review_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "annual_reviews" ADD CONSTRAINT "annual_reviews_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "annual_review_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "annual_reviews" ADD CONSTRAINT "annual_reviews_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
