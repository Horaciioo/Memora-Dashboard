-- Store only the SHA-256 digest of each session token, open sessions stay valid
UPDATE "sessions" SET "token" = encode(sha256(convert_to("token", 'UTF8')), 'hex');
