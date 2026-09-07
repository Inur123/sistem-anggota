<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('member_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->unique()->constrained()->restrictOnDelete();
            $table->string('full_name')->default('');
            $table->string('gender', 1)->default('');
            foreach (['nik', 'nia', 'phone', 'birth_place', 'birth_date', 'address', 'rfid', 'hobby', 'occupation', 'education_history', 'training_history', 'position'] as $field) {
                $table->text($field.'_encrypted')->nullable();
            }
            $table->enum('profile_status', ['DRAFT', 'PENDING', 'DITERIMA', 'DITOLAK'])->default('DRAFT');
            $table->unsignedInteger('profile_version')->default(1);
            $table->timestamps();
        });
        Schema::create('organization_selections', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('member_profile_id')->unique()->constrained()->restrictOnDelete();
            $table->enum('target_role', ['CABANG', 'PAC']);
            $table->string('target_id');
            $table->string('target_name');
            $table->string('wilayah_id')->nullable();
            $table->string('wilayah_name')->nullable();
            $table->string('wilayah_type')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
        Schema::create('membership_periods', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('member_profile_id')->constrained()->restrictOnDelete();
            $table->string('laci_member_id')->index();
            $table->string('laci_period_id');
            $table->string('period_name')->default('');
            $table->string('organization_name')->default('');
            $table->string('wilayah_name')->nullable();
            $table->enum('verification_status', ['DRAFT', 'PENDING', 'DITERIMA', 'DITOLAK'])->default('PENDING');
            $table->text('rejection_reason')->nullable();
            $table->boolean('is_current')->default(true);
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
            $table->unique(['member_profile_id', 'laci_period_id']);
        });
        Schema::create('sync_attempts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('member_profile_id')->constrained()->restrictOnDelete();
            $table->string('idempotency_key')->unique();
            $table->string('direction')->default('TO_LACI');
            $table->string('operation')->default('member.submit');
            $table->unsignedInteger('profile_version')->nullable();
            $table->unsignedSmallInteger('http_status')->nullable();
            $table->string('result_status')->nullable();
            $table->unsignedInteger('attempt_count')->default(0);
            $table->timestamp('next_retry_at')->nullable();
            $table->timestamps();
            $table->index(['member_profile_id', 'profile_version', 'result_status'], 'sync_attempts_profile_version_status_index');
        });
        Schema::create('oauth_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('state_hash', 64)->unique();
            $table->string('nonce_hash', 64);
            $table->text('code_verifier_encrypted');
            $table->string('return_to')->default('/profile');
            $table->timestamp('expires_at')->index();
            $table->timestamp('consumed_at')->nullable();
            $table->timestamps();
        });
        Schema::create('webhook_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('event_id')->unique();
            $table->string('event_type');
            $table->timestamp('received_at');
        });
    }

    public function down(): void
    {
        foreach (['webhook_events', 'oauth_transactions', 'sync_attempts', 'membership_periods', 'organization_selections', 'member_profiles'] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
