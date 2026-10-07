-- Moderators no longer open the member files
DELETE FROM "role_permissions"
WHERE "role" = 'MODERATEUR'
  AND "permission" = 'member:read';
