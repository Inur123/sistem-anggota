<?php

return [
    'sso' => [
        'issuer' => env('SSO_ISSUER', 'https://api.pelajarnumagetan.id'),
        'client_id' => env('SSO_CLIENT_ID'),
        'client_secret' => env('SSO_CLIENT_SECRET'),
        'redirect_url' => env('SSO_REDIRECT_URL', rtrim(env('APP_URL', 'http://localhost:3100'), '/').'/api/auth/oauth2/callback/sistem-anggota'),
        'token_auth_method' => env('SSO_TOKEN_AUTH_METHOD', 'client_secret_post'),
    ],
    'laci' => ['url' => env('LACI_API_URL'), 'key' => env('LACI_API_KEY'), 'webhook_secret' => env('LACI_WEBHOOK_SECRET')],
    'http_timeout' => (int) env('HTTP_CLIENT_TIMEOUT_SECONDS', 10),
    'session_absolute_minutes' => (int) env('SESSION_ABSOLUTE_MINUTES', 1440),
];
