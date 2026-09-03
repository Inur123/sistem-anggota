-- Align the database with the Go API model and remove superseded columns.
ALTER TABLE "member_profiles"
  ADD COLUMN "education_history_encrypted" BYTEA,
  ADD COLUMN "training_history_encrypted" BYTEA;

ALTER TABLE "member_profiles"
  DROP COLUMN "education_level_encrypted",
  DROP COLUMN "education_institution_encrypted";

ALTER TABLE "users"
  DROP COLUMN "phone";
