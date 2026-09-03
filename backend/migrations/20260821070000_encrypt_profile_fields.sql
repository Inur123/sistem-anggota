-- Kolom teks lama hanya berisi string kosong saat migrasi ini dibuat.
-- Data input anggota berikutnya hanya disimpan pada kolom AES-256-GCM.
ALTER TABLE "member_profiles"
  ADD COLUMN "hobby_encrypted" BYTEA,
  ADD COLUMN "occupation_encrypted" BYTEA,
  ADD COLUMN "education_level_encrypted" BYTEA,
  ADD COLUMN "education_institution_encrypted" BYTEA,
  ADD COLUMN "position_encrypted" BYTEA;

ALTER TABLE "member_profiles"
  DROP COLUMN "hobby",
  DROP COLUMN "occupation",
  DROP COLUMN "education_level",
  DROP COLUMN "education_institution",
  DROP COLUMN "position";
