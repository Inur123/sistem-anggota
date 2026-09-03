# Backend Sistem Anggota

API Go untuk OIDC/PKCE, session cookie, profil terenkripsi, PostgreSQL, serta integrasi server-to-server dengan Laci.

## Menjalankan

```bash
cp .env.example .env
go run ./cmd/migrate
go run ./cmd/api
```

Migrator menyimpan versi dan checksum pada `schema_migrations`. Database lama yang pernah memakai Prisma akan mengimpor migration history lama sebelum menjalankan migrasi Go berikutnya.

## Validasi

```bash
gofmt -w .
go test -race ./...
go vet ./...
```

SQL migrasi berada di `migrations/`. Tambahkan file timestamped baru; jangan mengubah file yang sudah diterapkan karena checksum akan menolak drift.
