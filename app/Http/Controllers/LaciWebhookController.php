<?php

namespace App\Http\Controllers;

use App\Models\MemberProfile;
use App\Models\MembershipPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LaciWebhookController extends Controller
{
    public function __invoke(Request $request)
    {
        $secret = config('membership.laci.webhook_secret');
        abort_unless($secret && ! str_starts_with($secret, 'isi_'), 503, 'Webhook belum dikonfigurasi.');
        $signature = trim($request->header('X-Laci-Signature', ''));
        $signature = str_starts_with($signature, 'sha256=') ? substr($signature, 7) : $signature;
        abort_unless(preg_match('/^[a-fA-F0-9]{64}$/', $signature) && hash_equals(hash_hmac('sha256', $request->getContent(), $secret), strtolower($signature)), 401, 'Signature webhook tidak valid.');
        $data = $request->validate([
            'eventId' => 'required|string|max:255',
            'eventType' => 'required|in:member.status_changed',
            'data.laciMemberId' => 'required|string|max:255',
            'data.status' => 'required|string',
            'data.periodeId' => 'nullable|string|max:255',
            'data.periodeNama' => 'nullable|string|max:255',
            'data.reason' => 'nullable|string|max:2000',
        ]);
        $status = match (strtoupper(trim($data['data']['status']))) {
            'APPROVED', 'VERIFIED', 'DITERIMA' => 'DITERIMA',
            'REJECTED', 'DITOLAK' => 'DITOLAK',
            'DRAFT' => 'DRAFT',
            'PENDING' => 'PENDING',
            default => null,
        };
        abort_unless($status, 422, 'Status webhook tidak didukung.');
        $duplicate = DB::transaction(function () use ($data, $status) {
            $inserted = DB::table('webhook_events')->insertOrIgnore(['id' => (string) Str::uuid(), 'event_id' => $data['eventId'], 'event_type' => $data['eventType'], 'received_at' => now()]);
            if (! $inserted) {
                return true;
            }
            $query = MembershipPeriod::where('laci_member_id', $data['data']['laciMemberId']);
            if (! empty($data['data']['periodeId'])) {
                $query->where('laci_period_id', $data['data']['periodeId']);
            } else {
                $query->where('is_current', true);
            }
            $period = $query->lockForUpdate()->first();
            abort_unless($period, 404, 'Anggota atau periode Laci tidak ditemukan.');
            $period->fill([
                'verification_status' => $status,
                'rejection_reason' => $status === 'DITOLAK' ? ($data['data']['reason'] ?? null) : null,
                'verified_at' => in_array($status, ['DITERIMA', 'DITOLAK']) ? now() : null,
            ]);
            if (! empty($data['data']['periodeNama'])) {
                $period->period_name = $data['data']['periodeNama'];
            }
            $period->save();
            $profile = MemberProfile::whereKey($period->member_profile_id)->lockForUpdate()->firstOrFail();
            // Events for older periods update history without changing the current application.
            if ($period->is_current) {
                $profile->update(['profile_status' => $status]);
            }

            return false;
        });

        return response()->json(['message' => $duplicate ? 'Event sudah diproses.' : 'Status anggota diperbarui.']);
    }
}
