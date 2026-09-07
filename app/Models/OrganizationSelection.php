<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class OrganizationSelection extends Model
{
    use HasUuids;

    protected $fillable = ['member_profile_id', 'target_role', 'target_id', 'target_name', 'wilayah_id', 'wilayah_name', 'wilayah_type', 'active'];

    protected function casts(): array
    {
        return ['active' => 'boolean'];
    }
}
