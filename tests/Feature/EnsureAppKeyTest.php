<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Crypt;
use Tests\TestCase;

class EnsureAppKeyTest extends TestCase
{
    private string $environmentPath;

    protected function setUp(): void
    {
        parent::setUp();

        $this->environmentPath = tempnam(sys_get_temp_dir(), 'sistem-anggota-env-');
        $this->app->useEnvironmentPath(dirname($this->environmentPath));
        $this->app->loadEnvironmentFrom(basename($this->environmentPath));
    }

    protected function tearDown(): void
    {
        unlink($this->environmentPath);

        parent::tearDown();
    }

    public function test_generates_a_key_for_a_new_installation(): void
    {
        file_put_contents($this->environmentPath, "APP_KEY=\n");
        config(['app.key' => '']);

        $this->artisan('app:ensure-key')->assertSuccessful();

        $this->assertStringStartsWith('APP_KEY=base64:', file_get_contents($this->environmentPath));
        $this->assertSame('profile data', Crypt::decryptString(Crypt::encryptString('profile data')));
    }

    public function test_preserves_existing_key_and_encrypted_data(): void
    {
        $key = 'base64:'.base64_encode(str_repeat('a', 32));
        $environment = "APP_KEY={$key}\n";
        file_put_contents($this->environmentPath, $environment);
        config(['app.key' => $key]);
        $encrypted = Crypt::encryptString('existing profile');

        $this->artisan('app:ensure-key')->assertSuccessful();

        $this->assertSame($environment, file_get_contents($this->environmentPath));
        $this->assertSame($key, config('app.key'));
        $this->assertSame('existing profile', Crypt::decryptString($encrypted));
    }

    public function test_fails_if_the_environment_file_has_no_key_entry(): void
    {
        $environment = "APP_ENV=local\n";
        file_put_contents($this->environmentPath, $environment);
        config(['app.key' => '']);

        $this->artisan('app:ensure-key')->assertFailed();

        $this->assertSame($environment, file_get_contents($this->environmentPath));
        $this->assertSame('', config('app.key'));
    }
}
