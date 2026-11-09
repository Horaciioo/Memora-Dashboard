-- Features switched away from their default, a row only while one is off
CREATE TABLE "feature_switches" (
    "key" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "note" TEXT,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_switches_pkey" PRIMARY KEY ("key")
);
