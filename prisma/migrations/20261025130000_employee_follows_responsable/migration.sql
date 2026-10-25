-- The employee holds the Responsable rights, whatever was granted before
DELETE FROM "role_permissions" WHERE "role" = 'EMPLOYE';

INSERT INTO "role_permissions" ("id", "role", "permission", "effect", "youtuberId")
SELECT 'employe_' || "id", 'EMPLOYE'::"MemberRole", "permission", "effect", "youtuberId"
FROM "role_permissions"
WHERE "role" = 'RESPONSABLE';
