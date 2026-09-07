<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class IntegrationHttp
{
    public static function client(): PendingRequest
    {
        return Http::acceptJson()->connectTimeout(4)->timeout(config('membership.http_timeout'))->withoutRedirecting();
    }

    public static function json(Response $response): array
    {
        if (! $response->successful() || strlen($response->body()) > 1048576 || ! is_array($response->json())) {
            Log::warning('Integration HTTP request failed', [
                'status' => $response->status(),
                'body' => substr($response->body(), 0, 1000),
            ]);
            throw new IntegrationException('Layanan belum dapat memproses permintaan. Silakan coba kembali.');
        }

        return $response->json();
    }

    public static function url(?string $url): string
    {
        $scheme = parse_url($url ?? '', PHP_URL_SCHEME);
        if (! filter_var($url, FILTER_VALIDATE_URL) || ($scheme !== 'https' && ! (app()->environment(['local', 'testing']) && $scheme === 'http'))) {
            throw new IntegrationException('Alamat layanan belum dikonfigurasi dengan benar.');
        }

        return $url;
    }
}
