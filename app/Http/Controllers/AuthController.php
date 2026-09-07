<?php

namespace App\Http\Controllers;

use App\Models\OauthTransaction;
use App\Models\User;
use App\Services\SsoClient;
use App\Support\Audit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class AuthController extends Controller
{
    public function login(Request $request, SsoClient $sso)
    {
        try {
            $discovery = $sso->discovery();
            $state = self::random();
            $nonce = self::random();
            $verifier = self::random();
            $returnTo = in_array($request->query('return_to'), ['/profile', '/profile/edit', '/lengkapi-profil', '/riwayat']) ? $request->query('return_to') : '/profile';
            OauthTransaction::create([
                'state_hash' => hash('sha256', $state),
                'nonce_hash' => hash('sha256', $nonce),
                'code_verifier_encrypted' => $verifier,
                'return_to' => $returnTo,
                'expires_at' => now()->addMinutes(5),
            ]);
            $request->session()->put('oauth_state_hash', hash('sha256', $state));
            $query = http_build_query([
                'response_type' => 'code',
                'scope' => 'openid profile email',
                'client_id' => config('membership.sso.client_id'),
                'redirect_uri' => config('membership.sso.redirect_url'),
                'state' => $state,
                'nonce' => $nonce,
                'code_challenge_method' => 'S256',
                'code_challenge' => rtrim(strtr(base64_encode(hash('sha256', $verifier, true)), '+/', '-_'), '='),
            ]);

            return redirect()->away($discovery['authorization_endpoint'].(str_contains($discovery['authorization_endpoint'], '?') ? '&' : '?').$query);
        } catch (Throwable $exception) {
            Log::warning('SSO login unavailable', ['type' => get_class($exception)]);

            return to_route('home')->with('error', 'SSO belum dapat dihubungi. Coba masuk kembali beberapa saat lagi.');
        }
    }

    public function callback(Request $request, SsoClient $sso)
    {
        $stateHash = hash('sha256', (string) $request->query('state', ''));
        $expected = $request->session()->pull('oauth_state_hash', '');
        if (! $expected || ! hash_equals($expected, $stateHash)) {
            return to_route('home')->with('error', 'Sesi login tidak valid atau sudah digunakan. Silakan masuk kembali.');
        }
        $transaction = DB::transaction(function () use ($stateHash) {
            $transaction = OauthTransaction::where('state_hash', $stateHash)->whereNull('consumed_at')->where('expires_at', '>', now())->lockForUpdate()->first();
            $transaction?->update(['consumed_at' => now()]);

            return $transaction;
        });
        if (! $transaction) {
            return to_route('home')->with('error', 'Sesi login kedaluwarsa. Silakan masuk kembali.');
        }
        if ($request->query('error')) {
            return to_route('home')->with('error', 'Login dibatalkan. Anda dapat masuk lagi kapan saja.');
        }
        $iss = $request->query('iss');
        if (($iss && rtrim((string) $iss, '/') !== rtrim(config('membership.sso.issuer'), '/')) || ! is_string($request->query('code')) || ! $request->query('code')) {
            Log::warning('SSO callback params invalid', [
                'has_code' => (bool) $request->query('code'),
                'iss' => $iss,
                'expected_iss' => config('membership.sso.issuer'),
            ]);

            return to_route('home')->with('error', 'Callback SSO tidak valid. Silakan masuk kembali.');
        }
        try {
            $identity = $sso->identity($request->query('code'), $transaction);
            $user = DB::transaction(function () use ($identity) {
                $avatarRaw = $identity['avatar'] ?? $identity['avatar_url'] ?? $identity['picture'] ?? $identity['photo'] ?? null;
                $avatarUrl = null;
                if (! empty($avatarRaw)) {
                    $avatarRaw = trim((string) $avatarRaw);
                    if ($avatarRaw !== '') {
                        if (str_starts_with($avatarRaw, 'http://') || str_starts_with($avatarRaw, 'https://')) {
                            $avatarUrl = $avatarRaw;
                        } else {
                            $issuer = rtrim(config('membership.sso.issuer', 'https://api.pelajarnumagetan.id'), '/');
                            $avatarUrl = $issuer.'/'.ltrim($avatarRaw, '/');
                        }
                    }
                }

                $user = User::updateOrCreate(['sso_subject' => $identity['sub']], [
                    'display_name' => trim($identity['name'] ?? $identity['display_name'] ?? ''),
                    'email' => trim($identity['email'] ?? ''),
                    'avatar_url' => $avatarUrl,
                    'sso_phone_encrypted' => trim($identity['phone_number'] ?? $identity['phone'] ?? $identity['mobile'] ?? ''),
                    'gender' => User::normalizeGender($identity['gender'] ?? $identity['jenis_kelamin'] ?? ''),
                    'last_login_at' => now(),
                ]);
                $profile = $user->profile()->firstOrCreate([], ['full_name' => $user->display_name, 'gender' => $user->gender, 'phone_encrypted' => $user->sso_phone_encrypted]);
                $profile->update(['full_name' => $user->display_name, 'gender' => $user->gender, 'phone_encrypted' => $user->sso_phone_encrypted]);
                Audit::record($user->id, 'auth.login', $user->id);

                return $user;
            });
            Auth::login($user);
            $request->session()->regenerate();
            $request->session()->put('authenticated_at', now()->timestamp);

            $returnTo = $transaction->return_to;
            if ($returnTo === '/profile' && $user->profile?->profile_status === 'DRAFT') {
                $returnTo = '/lengkapi-profil';
            }

            $name = $user->display_name ?: 'Rekan';

            return redirect($returnTo)->with('success', "Berhasil masuk dengan IPNU IPPNU ID. Selamat datang, {$name}!");
        } catch (Throwable $exception) {
            Log::warning('SSO callback failed', [
                'type' => get_class($exception),
                'message' => $exception->getMessage(),
                'file' => $exception->getFile().':'.$exception->getLine(),
            ]);

            return to_route('home')->with('error', 'Login belum berhasil diverifikasi. Silakan masuk kembali.');
        }
    }

    public function logout(Request $request)
    {
        Audit::record($request->user()?->id, 'auth.logout', $request->user()?->id);
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return to_route('home')->with('success', 'Anda telah keluar.');
    }

    private static function random(): string
    {
        return rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
    }
}
