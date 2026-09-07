<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use HasFactory, HasUuids;

    protected $fillable = ['sso_subject', 'display_name', 'email', 'avatar_url', 'gender', 'sso_phone_encrypted', 'last_login_at'];

    protected $hidden = ['sso_subject', 'sso_phone_encrypted'];

    protected function casts(): array
    {
        return ['sso_phone_encrypted' => 'encrypted', 'last_login_at' => 'datetime'];
    }

    public function profile(): HasOne
    {
        return $this->hasOne(MemberProfile::class);
    }

    public function identity(): array
    {
        return ['id' => $this->id, 'name' => $this->display_name, 'email' => $this->email,
            'phone' => $this->sso_phone_encrypted ?? '', 'gender' => $this->gender, 'avatar_url' => $this->avatar_url];
    }

    public static function normalizeGender(?string $value): string
    {
        return match (strtolower(trim($value ?? ''))) {
            'l', 'male', 'laki-laki', 'laki_laki', 'pria' => 'L',
            'p', 'female', 'perempuan', 'wanita' => 'P',
            default => '',
        };
    }
}
