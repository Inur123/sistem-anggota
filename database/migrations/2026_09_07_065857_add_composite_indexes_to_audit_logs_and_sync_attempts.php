<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->index(['user_id', 'action', 'created_at'], 'audit_logs_user_action_created_index');
        });

        Schema::table('sync_attempts', function (Blueprint $table) {
            $table->index(['member_profile_id', 'profile_version', 'result_status'], 'sync_attempts_profile_version_status_index');
        });
    }

    public function down(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropIndex('audit_logs_user_action_created_index');
        });

        Schema::table('sync_attempts', function (Blueprint $table) {
            $table->dropIndex('sync_attempts_profile_version_status_index');
        });
    }
};
