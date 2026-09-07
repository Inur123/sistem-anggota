<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class MembershipPeriod extends Model
{
    use HasUuids;

    protected $guarded = [];

    protected function casts(): array
    {
        return ['is_current' => 'boolean', 'submitted_at' => 'datetime', 'verified_at' => 'datetime'];
    }
}
