-- A level between the admin and the responsable
ALTER TYPE "MemberRole" ADD VALUE IF NOT EXISTS 'EMPLOYE';
ALTER TYPE "AccessCategory" ADD VALUE IF NOT EXISTS 'EMPLOYE';
