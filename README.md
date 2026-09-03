# Sistem Anggota IPNU IPPNU

Sistem Anggota adalah portal mandiri (self-service) terpusat bagi anggota IPNU dan IPPNU. Melalui portal ini, anggota dapat:

1. **Login Terintegrasi (SSO):** Masuk dengan aman menggunakan akun tunggal IPNU IPPNU ID yang terintegrasi langsung dengan SSO dari **pelajarnumagetan.id**.
2. **Manajemen Profil:** Melengkapi, memperbarui, dan memantau kelengkapan biodata diri.
3. **Pendaftaran Organisasi:** Memilih dan mendaftar ke struktur organisasi tujuan (Pimpinan Cabang, PAC, Ranting, atau Komisariat).
4. **Integrasi Laci:** Data pengajuan anggota akan dikirim secara otomatis ke sistem **Laci** untuk diverifikasi oleh pengurus yang berwenang pada periode aktif.
5. **Pemantauan Status:** Melihat status verifikasi pendaftaran secara _real-time_ (Menunggu, Diterima, atau Ditolak) langsung dari dashboard anggota.

Sistem ini memastikan pencatatan keanggotaan IPNU dan IPPNU berjalan secara tertib, terintegrasi, dan memiliki rekam jejak historis yang jelas.

## Arsitektur Teknologi

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, dan UI primitive shadcn.
- **Backend:** Go (net/http, pgx), PostgreSQL, dan OIDC untuk SSO.
- **Integrasi:** REST API server-to-server ke Laci dengan sinkronisasi status via Webhook.

## Struktur Direktori

- `backend/` — Source code untuk backend API (Go).
- `frontend/` — Source code untuk antarmuka pengguna (Next.js).
- `docs/` — Dokumentasi lengkap mengenai arsitektur, API, database, keamanan, dan deployment.
