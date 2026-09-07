<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SessionLifetime
{
    public function handle(Request $request, Closure $next)
    {
        $authenticatedAt = $request->session()->get('authenticated_at');
        if ($request->user() && $authenticatedAt && now()->timestamp - $authenticatedAt >= config('membership.session_absolute_minutes') * 60) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Sesi berakhir. Silakan masuk kembali.'], 401);
            }

            return redirect('/')->with('error', 'Sesi berakhir. Silakan masuk kembali.');
        }

        return $next($request);
    }
}
