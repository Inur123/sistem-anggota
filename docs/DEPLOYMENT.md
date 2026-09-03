# Deployment

1. Sediakan PostgreSQL dan secret environment.
2. Jalankan `go run ./cmd/migrate` dari direktori `backend` sebagai job satu kali.
3. Deploy backend dan tunggu `/health/ready` bernilai 200.
4. Build dan deploy frontend dengan `npm ci && npm run build`.
5. Daftarkan redirect URI SSO secara persis untuk environment tersebut.
6. Lakukan smoke test login, baca/simpan profil, daftar organisasi, submit Laci, webhook, dan logout.

Jangan menjalankan migrasi otomatis dari setiap replika API. Migrator memakai advisory lock, tetapi migration job terpisah tetap lebih mudah diaudit dan di-rollback.
