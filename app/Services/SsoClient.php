<?php

namespace App\Services;

use App\Models\OauthTransaction;
use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

class SsoClient
{
    public function discovery(): array
    {
        $issuer = config('membership.sso.issuer');
        $document = Cache::remember(
            'sso.discovery.'.hash('sha256', $issuer),
            3600,
            fn () => IntegrationHttp::json(IntegrationHttp::client()->get(IntegrationHttp::url(rtrim($issuer, '/').'/.well-known/openid-configuration')))
        );
        if (rtrim($document['issuer'] ?? '', '/') !== rtrim($issuer, '/')) {
            throw new IntegrationException('Identitas layanan SSO tidak sesuai.');
        }
        foreach (['authorization_endpoint', 'token_endpoint', 'userinfo_endpoint', 'jwks_uri'] as $key) {
            IntegrationHttp::url($document[$key] ?? null);
        }
        if (! config('membership.sso.client_id') || ! config('membership.sso.client_secret')) {
            throw new IntegrationException('Login SSO belum dikonfigurasi.');
        }

        return $document;
    }

    public function identity(string $code, OauthTransaction $transaction): array
    {
        $discovery = $this->discovery();
        $clientId = config('membership.sso.client_id');
        $client = IntegrationHttp::client()->asForm();
        $payload = [
            'grant_type' => 'authorization_code',
            'code' => $code,
            'redirect_uri' => config('membership.sso.redirect_url'),
            'code_verifier' => $transaction->code_verifier_encrypted,
        ];
        $supportedMethods = (array) ($discovery['token_endpoint_auth_methods_supported'] ?? []);
        $authMethod = config('membership.sso.token_auth_method');
        if (! $authMethod && in_array('client_secret_post', $supportedMethods, true)) {
            $authMethod = 'client_secret_post';
        }

        if ($authMethod === 'client_secret_post' || (in_array('client_secret_post', $supportedMethods, true) && ! in_array('client_secret_basic', $supportedMethods, true))) {
            $payload += ['client_id' => $clientId, 'client_secret' => config('membership.sso.client_secret')];
        } else {
            $client->withBasicAuth($clientId, config('membership.sso.client_secret'));
        }
        $token = IntegrationHttp::json($client->post($discovery['token_endpoint'], $payload));
        if (! is_string($token['id_token'] ?? null) || ! is_string($token['access_token'] ?? null)) {
            throw new IntegrationException('Token login SSO tidak lengkap.');
        }
        $keyName = 'sso.jwks.'.hash('sha256', $discovery['jwks_uri']);
        $fetchKeys = fn () => IntegrationHttp::json(IntegrationHttp::client()->get($discovery['jwks_uri']));
        $keys = Cache::remember($keyName, 3600, $fetchKeys);
        try {
            $claims = $this->decode($token['id_token'], $keys);
        } catch (Throwable) {
            // A provider key rotation may invalidate the cached JWKS. Refresh once.
            Cache::forget($keyName);
            $claims = $this->decode($token['id_token'], Cache::remember($keyName, 3600, $fetchKeys));
        }
        $audiences = (array) ($claims->aud ?? []);
        $expectedIssuer = rtrim(config('membership.sso.issuer'), '/');
        $claimIssuer = rtrim((string) ($claims->iss ?? ''), '/');
        if (
            $claimIssuer !== $expectedIssuer || ! in_array($clientId, $audiences, true)
            || ((count($audiences) > 1 || isset($claims->azp)) && ($claims->azp ?? '') !== $clientId)
            || ! is_string($claims->sub ?? null) || $claims->sub === '' || ! isset($claims->exp, $claims->iat)
            || (isset($claims->nonce) && ! hash_equals($transaction->nonce_hash, hash('sha256', (string) $claims->nonce)))
        ) {
            Log::warning('SSO ID token claim validation failed', [
                'claim_iss' => $claimIssuer,
                'expected_iss' => $expectedIssuer,
                'audiences' => $audiences,
                'client_id' => $clientId,
                'has_nonce' => isset($claims->nonce),
            ]);
            throw new IntegrationException('Identitas login SSO tidak valid.');
        }
        $identity = IntegrationHttp::json(IntegrationHttp::client()->withToken($token['access_token'])->get($discovery['userinfo_endpoint']));
        if (($identity['sub'] ?? null) !== $claims->sub) {
            Log::warning('SSO userinfo sub mismatch', [
                'userinfo_sub' => $identity['sub'] ?? null,
                'claims_sub' => $claims->sub,
            ]);
            throw new IntegrationException('Identitas profil SSO tidak sesuai.');
        }

        return $identity;
    }

    private function decode(string $token, array $keys): object
    {
        // Allow clock skew between servers (up to 120 seconds leeway)
        JWT::$leeway = 120;

        // Never accept symmetric or unsigned tokens using provider public keys.
        $keys['keys'] = array_values(array_filter(
            $keys['keys'] ?? [],
            fn ($key) => in_array($key['kty'] ?? '', ['RSA', 'EC', 'OKP'], true)
                && in_array($key['alg'] ?? 'RS256', ['RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'EdDSA'], true)
                && ($key['use'] ?? 'sig') === 'sig'
        ));

        return JWT::decode($token, JWK::parseKeySet($keys, 'RS256'));
    }
}
