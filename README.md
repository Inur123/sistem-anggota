# Sistem Anggota IPNU IPPNU

Sistem Anggota adalah portal mandiri (self-service) terpusat bagi anggota IPNU dan IPPNU. Melalui portal ini, anggota dapat:

1. **Login Terintegrasi (SSO):** Masuk dengan aman menggunakan akun tunggal IPNU IPPNU ID yang terintegrasi langsung dengan SSO dari **pelajarnumagetan.or.id**.
2. **Manajemen Profil:** Melengkapi, memperbarui, dan memantau kelengkapan biodata diri.
3. **Pendaftaran Organisasi:** Memilih dan mendaftar ke struktur organisasi tujuan (Pimpinan Cabang, PAC, Ranting, atau Komisariat).
4. **Integrasi Sistem Laci:** Data pengajuan anggota akan dikirim secara otomatis ke sistem Laci (**laci.pelajarnumagetan.or.id**) via REST API untuk diverifikasi oleh pengurus yang berwenang. Status verifikasi akan disinkronkan secara otomatis (real-time) melalui sistem Webhook.
5. **Pemantauan Status:** Melihat status verifikasi pendaftaran secara langsung (Menunggu, Diterima, atau Ditolak) dari dashboard anggota.

Sistem ini memastikan pencatatan keanggotaan IPNU dan IPPNU berjalan secara tertib, terintegrasi, dan memiliki rekam jejak historis yang jelas.

## Stack dan struktur

Aplikasi berjalan sebagai satu proyek Laravel 13 di root repository, menggunakan PHP 8.3+, MySQL, React 19, Inertia 3, TypeScript, dan Vite.

- `app/`: controller, model, middleware, dan integrasi SSO/Laci.
- `routes/`: rute HTTP dan perintah Artisan.
- `resources/js/`: halaman serta komponen React yang dilayani Laravel melalui Inertia.
- `resources/css/` dan `resources/views/`: stylesheet dan template aplikasi.
- `database/migrations/`: skema database Laravel.
- `tests/`: pengujian PHPUnit. Database pengujian menggunakan SQLite dalam memori.

## Menjalankan lokal

1. Aktifkan MySQL MAMP dan siapkan database `sistem-anggota`.
2. Jika `.env` belum tersedia, salin `.env.example` ke `.env`.
3. Sesuaikan `DB_*` dengan MAMP (host `127.0.0.1`, port `8889`), lalu isi konfigurasi `SSO_*` dan `LACI_*` sesuai layanan integrasi.
4. Jalankan `composer run setup` untuk memasang dependensi, membuat application key jika belum ada, menjalankan migrasi, dan membangun aset.
5. Jalankan `composer run dev`. Laravel menggunakan port `3100`, dan Vite menyediakan aset selama pengembangan.

Simpan `APP_KEY` yang sudah digunakan karena data anggota dienkripsi dengan key tersebut. `composer run setup` mempertahankan key yang telah dikonfigurasi.

## Verifikasi

```sh
composer test
npm run build
php artisan migrate:status
```

Endpoint `/up` dan `/health/live` memeriksa aplikasi; `/health/ready` memeriksa koneksi database. Pengujian login SSO dan pengiriman ke Laci memerlukan konfigurasi layanan yang valid.

Antarmuka aplikasi telah sepenuhnya dimigrasikan menggunakan official shadcn UI (Radix UI) dengan sistem desain terpadu, palet warna resmi hijau IPNU IPPNU, dan responsivitas penuh.
