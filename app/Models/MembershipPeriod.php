<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class MembershipPeriod extends Model
{
    use HasUuids;

    protected $fillable = [
        'member_profile_id', 'laci_member_id', 'laci_period_id', 'period_name',
        'organization_name', 'wilayah_name', 'verification_status', 'rejection_reason',
        'is_current', 'submitted_at', 'verified_at',
    ];

    protected function casts(): array
    {
        return ['is_current' => 'boolean', 'submitted_at' => 'datetime', 'verified_at' => 'datetime'];
    }
}
