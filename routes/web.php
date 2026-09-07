<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\LaciWebhookController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('Welcome'))->name('home');
Route::get('/kebijakan-privasi', fn () => Inertia::render('PrivacyPolicy'))->name('privacy');
Route::get('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1')->name('login');
Route::get('/api/v1/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::get('/api/auth/oauth2/callback/sistem-anggota', [AuthController::class, 'callback'])->middleware('throttle:20,1');
Route::get('/api/auth/oauth2/callback/ipnu-sso', [AuthController::class, 'callback'])->middleware('throttle:20,1');
Route::get('/api/v1/auth/callback', [AuthController::class, 'callback'])->middleware('throttle:20,1');
Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth')->name('logout');
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'show'])->name('profile');
    Route::get('/lengkapi-profil', [ProfileController::class, 'edit']);
    Route::get('/profile/edit', [ProfileController::class, 'edit']);
    Route::patch('/profile', [ProfileController::class, 'save'])->middleware('throttle:30,1');
    Route::post('/profile/submit', [ProfileController::class, 'submit'])->middleware('throttle:6,1');
    Route::get('/riwayat', [ProfileController::class, 'history']);
    Route::get('/api/v1/organizations', [ProfileController::class, 'organizations'])->middleware('throttle:30,1');
});
Route::post('/api/v1/integrations/laci/member-status', LaciWebhookController::class)->middleware('throttle:120,1');
Route::get('/health/live', fn () => response()->json(['status' => 'ok']));
Route::get('/health/ready', function () {
    try {
        DB::select('select 1');

        return response()->json(['status' => 'ready']);
    } catch (Throwable) {
        return response()->json(['status' => 'unavailable'], 503);
    }
});
