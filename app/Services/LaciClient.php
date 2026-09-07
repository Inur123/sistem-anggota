<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LaciClient
{
    private function client(): PendingRequest
    {
        if (! config('membership.laci.key') || str_starts_with(config('membership.laci.key'), 'isi_')) {
            throw new IntegrationException('Laci belum dikonfigurasi.');
        }

        return IntegrationHttp::client()->baseUrl(rtrim(IntegrationHttp::url(config('membership.laci.url')), '/'))
            ->withHeaders(['X-API-Key' => config('membership.laci.key'), 'X-Correlation-ID' => (string) Str::uuid()]);
    }

    public function organizations(bool $fresh = false): array
    {
        $key = 'laci.organizations.'.hash('sha256', config('membership.laci.url').config('membership.laci.key'));
        $load = function () {
            $body = IntegrationHttp::json($this->client()->get('/public/organisasi'));
            if (! is_array($body['data'] ?? null) || ! is_array($body['data']['pac'] ?? null)) {
                throw new IntegrationException('Daftar organisasi Laci belum tersedia.');
            }
            $unit = static fn (array $item) => [
                'id' => $item['id'],
                'name' => $item['name'],
                'periodeAktif' => isset($item['periodeAktif']) ? array_intersect_key($item['periodeAktif'], array_flip(['id', 'nama'])) : null,
                'wilayah' => array_map(static fn ($area) => array_intersect_key($area, array_flip(['id', 'nama', 'jenis'])), $item['wilayah'] ?? []),
            ];

            return ['cabang' => isset($body['data']['cabang']) ? $unit($body['data']['cabang']) : null, 'pac' => array_map($unit, $body['data']['pac'])];
        };
        if ($fresh) {
            $data = $load();
            Cache::put($key, $data, 60);

            return $data;
        }

        return Cache::remember($key, 60, $load);
    }

    public function selection(string $role, string $id, ?string $areaId, bool $fresh = false): array
    {
        $organizations = $this->organizations($fresh);
        $unit = $role === 'CABANG' ? $organizations['cabang'] : collect($organizations['pac'])->firstWhere('id', $id);
        if (! $unit || $unit['id'] !== $id) {
            throw ValidationException::withMessages(['target_id' => 'Pimpinan tidak tersedia. Pilih kembali organisasi tujuan.']);
        }
        $area = null;
        if ($areaId) {
            $area = collect($unit['wilayah'])->firstWhere('id', $areaId);
            if ($role === 'CABANG' || ! $area) {
                throw ValidationException::withMessages(['wilayah_id' => 'Ranting/komisariat harus berasal dari PAC yang dipilih.']);
            }
        }
        if ($fresh && $role === 'PAC' && count($unit['wilayah']) && ! $area) {
            throw ValidationException::withMessages(['wilayah_id' => 'Pilih ranting atau komisariat tujuan.']);
        }
        if ($fresh && empty($unit['periodeAktif']['id'])) {
            throw ValidationException::withMessages(['target_id' => 'Pimpinan ini belum memiliki periode aktif. Hubungi pengurus.']);
        }

        return [
            'target_role' => $role,
            'target_id' => $id,
            'target_name' => $unit['name'],
            'wilayah_id' => $area['id'] ?? null,
            'wilayah_name' => $area['nama'] ?? null,
            'wilayah_type' => $area['jenis'] ?? null,
            'period' => $unit['periodeAktif'],
        ];
    }

    public function submit(array $payload, string $key): array
    {
        $response = $this->client()->withHeaders(['Idempotency-Key' => $key])->post('/public/anggota', $payload);
        if (! $response->successful()) {
            return ['ok' => false, 'http_status' => $response->status(), 'retryable' => $response->serverError() || in_array($response->status(), [408, 429])];
        }
        $body = IntegrationHttp::json($response);
        if (empty($body['data']['id']) || empty($body['data']['periodeId']) || ! is_string($body['data']['id']) || ! is_string($body['data']['periodeId'])) {
            throw new IntegrationException('Hasil pengiriman belum dapat dipastikan. Coba ulangi pengiriman yang sama.');
        }

        return ['ok' => true, 'http_status' => $response->status(), 'data' => $body['data']];
    }
}
