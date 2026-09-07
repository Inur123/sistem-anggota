<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SecurityHeaders;
use App\Http\Middleware\SessionLifetime;
use App\Services\IntegrationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Inertia\Inertia;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->append(SecurityHeaders::class);
        $middleware->web(append: [SessionLifetime::class, HandleInertiaRequests::class]);
        $middleware->redirectGuestsTo('/');
        $middleware->validateCsrfTokens(except: ['api/v1/integrations/laci/member-status']);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->dontFlash(['nik', 'nia', 'birth_place', 'birth_date', 'address', 'educations', 'trainings', 'hobby', 'occupation', 'position']);
        $exceptions->render(function (IntegrationException $exception, Request $request) {
            if ($request->expectsJson() && ! $request->header('X-Inertia')) {
                return response()->json(['message' => $exception->getMessage()], 503);
            }

            return back()->with('error', $exception->getMessage());
        });
        $exceptions->render(function (ConnectionException $exception, Request $request) {
            if ($request->expectsJson() && ! $request->header('X-Inertia')) {
                return response()->json(['message' => 'Layanan belum dapat dihubungi.'], 503);
            }

            return back()->with('error', 'Layanan belum dapat dihubungi. Coba kembali beberapa saat lagi.');
        });
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => ! $request->header('X-Inertia') && ($request->is('api/v1/*') || $request->expectsJson()),
        );
        $exceptions->respond(function ($response, $exception, Request $request) {
            if ($request->is('api/v1/*') || ($request->expectsJson() && ! $request->header('X-Inertia'))) {
                return $response;
            }
            if (in_array($response->getStatusCode(), [403, 404, 419, 429, 500, 503]) && ! app()->environment('testing')) {
                return Inertia::render('Error', ['status' => $response->getStatusCode()])->toResponse($request)->setStatusCode($response->getStatusCode());
            }

            return $response;
        });
    })->create();
