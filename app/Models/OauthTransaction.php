<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class OauthTransaction extends Model
{
    use HasUuids;

    protected $guarded = [];

    protected $hidden = ['code_verifier_encrypted', 'state_hash', 'nonce_hash'];

    protected function casts(): array
    {
        return ['code_verifier_encrypted' => 'encrypted', 'expires_at' => 'datetime'];
    }
}
