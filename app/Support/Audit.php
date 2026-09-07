<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;

class Audit
{
    public static function record(?string $userId, string $action, ?string $entityId = null, array $metadata = []): void
    {
        DB::table('audit_logs')->insert([
            'user_id' => $userId,
            'action' => $action,
            'entity_type' => str_starts_with($action, 'auth.') ? 'user' : 'member_profile',
            'entity_id' => $entityId,
            'metadata' => json_encode($metadata, JSON_THROW_ON_ERROR),
            'created_at' => now(),
        ]);
    }
}
