<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('app:ensure-key', function (): int {
    if (filled(config('app.key'))) {
        $this->info('Application key already configured.');

        return 0;
    }

    $this->call('key:generate', ['--no-interaction' => true]);

    return filled(config('app.key')) ? 0 : 1;
})->purpose('Generate an application key only when one is not configured');
