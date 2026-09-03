-- Initial schema.
CREATE TYPE "ProfileStatus" AS ENUM ('DRAFT', 'PENDING', 'DITERIMA', 'DITOLAK');

-- CreateEnum
CREATE TYPE "TargetRole" AS ENUM ('CABANG', 'PAC');

-- CreateEnum
CREATE TYPE "SyncDirection" AS ENUM ('TO_LACI', 'FROM_LACI');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "sso_subject" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT '',
    "display_name" TEXT NOT NULL DEFAULT '',
    "avatar_url" TEXT NOT NULL DEFAULT '',
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "full_name" TEXT NOT NULL DEFAULT '',
    "gender" TEXT,
    "nik_encrypted" BYTEA,
    "nia_encrypted" BYTEA,
    "phone_encrypted" BYTEA,
    "birth_place_encrypted" BYTEA,
    "birth_date_encrypted" BYTEA,
    "address_encrypted" BYTEA,
    "rfid_encrypted" BYTEA,
    "hobby" TEXT NOT NULL DEFAULT '',
    "occupation" TEXT NOT NULL DEFAULT '',
    "education_level" TEXT NOT NULL DEFAULT '',
    "education_institution" TEXT NOT NULL DEFAULT '',
    "position" TEXT NOT NULL DEFAULT '',
    "profile_status" "ProfileStatus" NOT NULL DEFAULT 'DRAFT',
    "profile_version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_selections" (
    "id" UUID NOT NULL,
    "member_profile_id" UUID NOT NULL,
    "target_role" "TargetRole" NOT NULL,
    "target_id" TEXT NOT NULL,
    "target_name" TEXT NOT NULL DEFAULT '',
    "wilayah_id" TEXT,
    "wilayah_type" TEXT,
    "wilayah_name" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_selections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership_periods" (
    "id" UUID NOT NULL,
    "member_profile_id" UUID NOT NULL,
    "laci_member_id" TEXT NOT NULL,
    "laci_period_id" TEXT NOT NULL,
    "period_name" TEXT NOT NULL DEFAULT '',
    "organization_name" TEXT NOT NULL DEFAULT '',
    "wilayah_name" TEXT,
    "verification_status" "ProfileStatus" NOT NULL DEFAULT 'PENDING',
    "rejection_reason" TEXT,
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "submitted_at" TIMESTAMP(3),
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membership_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" BYTEA NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_attempts" (
    "id" UUID NOT NULL,
    "member_profile_id" UUID NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "direction" "SyncDirection" NOT NULL,
    "operation" TEXT NOT NULL,
    "http_status" INTEGER,
    "result_status" TEXT,
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "next_retry_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" BIGSERIAL NOT NULL,
    "user_id" UUID,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_sso_subject_key" ON "users"("sso_subject");

-- CreateIndex
CREATE UNIQUE INDEX "member_profiles_user_id_key" ON "member_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_selections_member_profile_id_key" ON "organization_selections"("member_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "membership_periods_member_profile_id_laci_period_id_key" ON "membership_periods"("member_profile_id", "laci_period_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_hash_key" ON "sessions"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "sync_attempts_idempotency_key_key" ON "sync_attempts"("idempotency_key");

-- AddForeignKey
ALTER TABLE "member_profiles" ADD CONSTRAINT "member_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_selections" ADD CONSTRAINT "organization_selections_member_profile_id_fkey" FOREIGN KEY ("member_profile_id") REFERENCES "member_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_periods" ADD CONSTRAINT "membership_periods_member_profile_id_fkey" FOREIGN KEY ("member_profile_id") REFERENCES "member_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_attempts" ADD CONSTRAINT "sync_attempts_member_profile_id_fkey" FOREIGN KEY ("member_profile_id") REFERENCES "member_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
