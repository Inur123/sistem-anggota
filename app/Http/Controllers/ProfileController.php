<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaveProfileRequest;
use App\Services\LaciClient;
use App\Services\ProfileService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Throwable;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $profile = $request->user()->profile()->with('organization')->firstOrFail();
        if ($profile->profile_status === 'DRAFT') {
            return $this->redirectWithFlash($request, '/lengkapi-profil');
        }

        return Inertia::render('Profile', ['profile' => $profile->view(), 'periods' => $profile->periods()->latest('submitted_at')->get()]);
    }

    public function edit(Request $request, LaciClient $laci)
    {
        $profile = $request->user()->profile()->with('organization')->firstOrFail();
        if ($profile->profile_status === 'PENDING') {
            return redirect('/profile')->with('error', 'Profil sedang menunggu verifikasi.');
        }
        if ($request->is('lengkapi-profil') && $profile->profile_status !== 'DRAFT') {
            return $this->redirectWithFlash($request, '/profile/edit');
        }
        $organizations = null;
        $organizationError = null;
        try {
            $organizations = $laci->organizations();
        } catch (Throwable) {
            $organizationError = 'Daftar pimpinan belum dapat dimuat dari Laci. Coba muat ulang.';
        }
        $retryRequired = DB::table('sync_attempts')->where('member_profile_id', $profile->id)->where('profile_version', $profile->profile_version)->whereIn('result_status', ['RETRYABLE', 'PROCESSING'])->exists();

        return Inertia::render('ProfileForm', ['profile' => $profile->view(), 'organizations' => $organizations, 'organizationError' => $organizationError, 'retryRequired' => $retryRequired]);
    }

    public function save(SaveProfileRequest $request, ProfileService $service)
    {
        $service->save($request->user(), $request->validated());

        return back()->with('success', 'Draf profil berhasil disimpan.');
    }

    public function submit(Request $request, ProfileService $service)
    {
        $data = $request->validate(['version' => 'required|integer|min:1']);
        $service->submit($request->user(), $data['version']);

        return redirect('/profile')->with('success', 'Data berhasil dikirim. Pengurus akan memverifikasi pengajuan Anda.');
    }

    public function history(Request $request)
    {
        $profile = $request->user()->profile()->firstOrFail();

        return Inertia::render('History', [
            'periods' => $profile->periods()->latest('submitted_at')->get(),
        ]);
    }

    public function organizations(LaciClient $laci)
    {
        return response()->json(['success' => true, 'data' => $laci->organizations(true)]);
    }

    private function redirectWithFlash(Request $request, string $path): RedirectResponse
    {
        $redirect = redirect($path);
        if ($msg = $request->session()->get('success')) {
            $redirect->with('success', $msg);
        }
        if ($err = $request->session()->get('error')) {
            $redirect->with('error', $err);
        }

        return $redirect;
    }
}
