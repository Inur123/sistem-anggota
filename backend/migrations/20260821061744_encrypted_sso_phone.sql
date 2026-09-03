-- Store the SSO phone number encrypted at rest.
ALTER TABLE "users" ADD COLUMN     "sso_phone_encrypted" BYTEA;
