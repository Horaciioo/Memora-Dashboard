-- A member chooses to show online, offline or do not disturb
CREATE TYPE "Availability" AS ENUM ('ONLINE', 'OFFLINE', 'DND');
ALTER TABLE "accounts" ADD COLUMN "availability" "Availability" NOT NULL DEFAULT 'ONLINE';
