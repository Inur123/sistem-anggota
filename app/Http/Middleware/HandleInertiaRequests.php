<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => ['user' => fn () => $request->user()?->identity()],
            'flash' => ['success' => fn () => $request->session()->get('success'), 'error' => fn () => $request->session()->get('error')],
        ];
    }
}
