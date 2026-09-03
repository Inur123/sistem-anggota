-- Add identity fields received from SSO.
ALTER TABLE "users" ADD COLUMN     "gender" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "phone" TEXT NOT NULL DEFAULT '';
