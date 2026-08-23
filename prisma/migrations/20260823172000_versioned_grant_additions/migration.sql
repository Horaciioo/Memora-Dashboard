-- CreateTable
CREATE TABLE "grant_migrations" (
    "key" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grant_migrations_pkey" PRIMARY KEY ("key")
);

-- A database already carrying grants has had the presets applied by the old seeder
INSERT INTO "grant_migrations" ("key")
SELECT 'initial-role-presets'
WHERE EXISTS (SELECT 1 FROM "role_permissions");
