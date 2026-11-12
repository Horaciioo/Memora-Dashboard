-- CreateTable
CREATE TABLE "config_overrides" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "previous" JSONB,
    "updatedById" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "config_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "config_overrides_category_path_key" ON "config_overrides"("category", "path");
