<?php

namespace App\Services;

use App\Models\MemberProfile;
use App\Models\User;
use App\Support\Audit;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

class ProfileService
{
    public function __construct(private LaciClient $laci) {}

    // Share one lock between edits and submissions, including the upstream request.
    public function locked(User $user, callable $callback): mixed
    {
        $lock = Cache::lock('profile:'.$user->id, max(60, config('membership.http_timeout') * 3));
        if (! $lock->get()) {
            throw ValidationException::withMessages(['profile' => 'Profil sedang diproses. Tunggu sebentar lalu coba kembali.']);
        }
        try {
            return $callback();
        } finally {
            $lock->release();
        }
    }

    public function save(User $user, array $data): MemberProfile
    {
        return $this->locked($user, function () use ($user, $data) {
            return DB::transaction(function () use ($user, $data) {
                $profile = $user->profile()->lockForUpdate()->firstOrFail();
                $this->editable($profile, $data['version']);
                if (DB::table('sync_attempts')->where('member_profile_id', $profile->id)->where('profile_version', $profile->profile_version)->whereIn('result_status', ['RETRYABLE', 'PROCESSING'])->exists()) {
                    throw ValidationException::withMessages(['profile' => 'Pengiriman sebelumnya belum dipastikan. Ulangi pengiriman data yang tersimpan sebelum mengubah profil.']);
                }
                if (! empty($data['target_role'])) {
                    $selection = $this->laci->selection($data['target_role'], $data['target_id'], $data['wilayah_id'] ?? null);
                    unset($selection['period']);
                    $profile->organization()->updateOrCreate([], $selection + ['active' => true]);
                }
                foreach (['nik', 'nia', 'birth_place', 'birth_date', 'address', 'hobby', 'occupation', 'position'] as $field) {
                    // Blank protected IDs mean "keep existing" because the client only sees a mask.
                    if (in_array($field, ['nik', 'nia']) && empty($data[$field])) {
                        continue;
                    }
                    $profile->{$field.'_encrypted'} = $data[$field] ?? null;
                }
                $profile->education_history_encrypted = json_encode($data['educations'], JSON_THROW_ON_ERROR);
                $profile->training_history_encrypted = json_encode($data['trainings'], JSON_THROW_ON_ERROR);
                $profile->fill([
                    'full_name' => $user->display_name,
                    'gender' => $user->gender,
                    'phone_encrypted' => $user->sso_phone_encrypted,
                    'profile_version' => $profile->profile_version + 1,
                    'profile_status' => $profile->profile_status === 'DITOLAK' ? 'DRAFT' : $profile->profile_status,
                ])->save();
                Audit::record($user->id, 'profile.updated', $profile->id);

                return $profile->fresh();
            });
        });
    }

    public function submit(User $user, int $version): void
    {
        $error = $this->locked($user, function () use ($user, $version) {
            return DB::transaction(function () use ($user, $version) {
                $profile = $user->profile()->lockForUpdate()->firstOrFail();
                $this->editable($profile, $version);
                $this->validateSubmission($user, $profile);
                $organization = $profile->organization;
                $selection = $this->laci->selection($organization->target_role, $organization->target_id, $organization->wilayah_id, true);
                $key = 'member-submit:'.$profile->id.':v'.$profile->profile_version;
                $attempt = DB::table('sync_attempts')->where('idempotency_key', $key)->first();
                if ($attempt?->result_status === 'SUCCESS') {
                    throw ValidationException::withMessages(['profile' => 'Versi profil ini sudah dikirim. Simpan pembaruan profil sebelum mengajukan kembali.']);
                }
                $attemptId = $attempt?->id ?? (string) Str::uuid();
                DB::table('sync_attempts')->updateOrInsert(['id' => $attemptId], [
                    'member_profile_id' => $profile->id,
                    'idempotency_key' => $key,
                    'profile_version' => $profile->profile_version,
                    'direction' => 'TO_LACI',
                    'operation' => 'member.submit',
                    'attempt_count' => ($attempt?->attempt_count ?? 0) + 1,
                    'result_status' => 'PROCESSING',
                    'created_at' => $attempt?->created_at ?? now(),
                    'updated_at' => now(),
                ]);
                try {
                    $result = $this->laci->submit($this->payload($user, $profile, $selection), $key);
                } catch (Throwable) {
                    DB::table('sync_attempts')->where('id', $attemptId)->update(['result_status' => 'RETRYABLE', 'updated_at' => now()]);

                    return 'Laci belum dapat mengonfirmasi pengiriman. Ulangi pengiriman; data yang sama tidak akan dibuat dua kali.';
                }
                if (! $result['ok']) {
                    DB::table('sync_attempts')->where('id', $attemptId)->update(['result_status' => $result['retryable'] ? 'RETRYABLE' : 'FAILED', 'http_status' => $result['http_status'], 'updated_at' => now()]);

                    return $result['retryable'] ? 'Laci sedang tidak tersedia. Coba kirim ulang beberapa saat lagi.' : 'Laci menolak pengiriman. Periksa data atau hubungi pengurus sebelum mencoba kembali.';
                }
                $profile->periods()->where('is_current', true)->update(['is_current' => false]);
                $profile->periods()->updateOrCreate(['laci_period_id' => $result['data']['periodeId']], [
                    'laci_member_id' => $result['data']['id'],
                    'period_name' => $result['data']['periodeNama'] ?? $selection['period']['nama'] ?? '',
                    'organization_name' => $selection['target_name'],
                    'wilayah_name' => $selection['wilayah_name'],
                    'verification_status' => 'PENDING',
                    'is_current' => true,
                    'submitted_at' => now(),
                    'verified_at' => null,
                    'rejection_reason' => null,
                ]);
                $profile->update(['profile_status' => 'PENDING']);
                unset($selection['period']);
                $organization->update($selection);
                DB::table('sync_attempts')->where('id', $attemptId)->update(['result_status' => 'SUCCESS', 'http_status' => $result['http_status'], 'updated_at' => now()]);
                Audit::record($user->id, 'profile.submitted', $profile->id);

                return null;
            });
        });
        if ($error) {
            throw ValidationException::withMessages(['profile' => $error]);
        }
    }

    private function editable(MemberProfile $profile, int $version): void
    {
        if ($profile->profile_status === 'PENDING') {
            throw ValidationException::withMessages(['profile' => 'Profil sedang menunggu verifikasi dan belum dapat diubah atau dikirim ulang.']);
        }
        if ($profile->profile_version !== $version) {
            throw ValidationException::withMessages(['version' => 'Profil telah berubah. Muat ulang halaman sebelum melanjutkan.']);
        }
    }

    private function validateSubmission(User $user, MemberProfile $profile): void
    {
        if (! $user->display_name || ! $user->sso_phone_encrypted || ! in_array($user->gender, ['L', 'P'])) {
            throw ValidationException::withMessages(['profile' => 'Lengkapi nama, jenis kelamin, dan nomor HP di IPNU IPPNU ID, lalu masuk kembali.']);
        }
        Validator::make(
            [
                'nik' => $profile->nik_encrypted,
                'birth_place' => $profile->birth_place_encrypted,
                'birth_date' => $profile->birth_date_encrypted,
                'address' => $profile->address_encrypted,
                'target_id' => $profile->organization?->target_id,
            ],
            ['nik' => ['required', 'regex:/^[0-9]{16}$/'], 'birth_place' => 'required', 'birth_date' => 'required|date_format:Y-m-d|before_or_equal:today', 'address' => 'required', 'target_id' => 'required'],
            ['required' => 'Lengkapi :attribute sebelum mengirim.', 'nik.regex' => 'NIK harus terdiri dari 16 angka.'],
            ['birth_place' => 'tempat lahir', 'birth_date' => 'tanggal lahir', 'address' => 'alamat', 'target_id' => 'organisasi tujuan']
        )->validate();
    }

    private function payload(User $user, MemberProfile $profile, array $organization): array
    {
        $education = json_decode($profile->education_history_encrypted ?: '[]', true, 512, JSON_THROW_ON_ERROR)[0] ?? [];

        return [
            'targetRole' => $organization['target_role'],
            'targetId' => $organization['target_id'],
            'wilayahId' => $organization['wilayah_id'],
            'namaLengkap' => $user->display_name,
            'jenisKelamin' => $user->gender === 'L' ? 'LAKI_LAKI' : 'PEREMPUAN',
            'email' => $user->email,
            'noHp' => $user->sso_phone_encrypted,
            'nik' => $profile->nik_encrypted,
            'nia' => $profile->nia_encrypted ?? '',
            'noRfid' => $profile->rfid_encrypted ?? '',
            'tempatLahir' => $profile->birth_place_encrypted,
            'tanggalLahir' => $profile->birth_date_encrypted,
            'alamatLengkap' => $profile->address_encrypted,
            'hobi' => $profile->hobby_encrypted ?? '',
            'jabatan' => $profile->position_encrypted ?? '',
            'pekerjaan' => $profile->occupation_encrypted ?? '',
            'jenjangPendidikan' => $education['level'] ?? '',
            'namaInstansiPendidikan' => $education['institution'] ?? '',
        ];
    }
}
