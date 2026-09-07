<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class MemberProfile extends Model
{
    use HasUuids;

    public const PRIVATE_FIELDS = ['nik', 'nia', 'phone', 'birth_place', 'birth_date', 'address', 'rfid', 'hobby', 'occupation', 'education_history', 'training_history', 'position'];

    protected $fillable = [
        'user_id', 'full_name', 'gender',
        'nik_encrypted', 'nia_encrypted', 'phone_encrypted', 'birth_place_encrypted',
        'birth_date_encrypted', 'address_encrypted', 'rfid_encrypted', 'hobby_encrypted',
        'occupation_encrypted', 'education_history_encrypted', 'training_history_encrypted',
        'position_encrypted', 'profile_status', 'profile_version',
    ];

    protected $hidden = ['nik_encrypted', 'nia_encrypted', 'phone_encrypted', 'birth_place_encrypted', 'birth_date_encrypted', 'address_encrypted', 'rfid_encrypted', 'hobby_encrypted', 'occupation_encrypted', 'education_history_encrypted', 'training_history_encrypted', 'position_encrypted'];

    protected function casts(): array
    {
        return [...array_fill_keys(array_map(fn ($field) => $field.'_encrypted', self::PRIVATE_FIELDS), 'encrypted'), 'profile_version' => 'integer'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function organization(): HasOne
    {
        return $this->hasOne(OrganizationSelection::class)->where('active', true);
    }

    public function periods(): HasMany
    {
        return $this->hasMany(MembershipPeriod::class);
    }

    public function view(): array
    {
        $data = ['id' => $this->id, 'status' => $this->profile_status, 'version' => $this->profile_version,
            'organization' => $this->organization?->only(['target_role', 'target_id', 'target_name', 'wilayah_id', 'wilayah_name', 'wilayah_type'])];
        foreach (self::PRIVATE_FIELDS as $field) {
            $value = $this->{$field.'_encrypted'} ?? '';
            $data[$field] = in_array($field, ['nik', 'nia', 'rfid']) ? ($value !== '' ? '••••' : '') : $value;
        }
        $data['educations'] = json_decode($data['education_history'] ?: '[]', true, 512, JSON_THROW_ON_ERROR) ?? [];
        $data['trainings'] = json_decode($data['training_history'] ?: '[]', true, 512, JSON_THROW_ON_ERROR) ?? [];
        unset($data['education_history'], $data['training_history']);

        return $data;
    }
}
