# Arsitektur

```text
Browser
  ├─ login redirect ───────────────> Go API ──> OIDC SSO
  └─ halaman dan /api/backend/* ──> Next.js ──> Go API
                                              ├─> PostgreSQL
                                              └─> Laci API
```

## Backend

- `cmd/api` merakit HTTP server dan graceful shutdown.
- `cmd/migrate` menjalankan migrasi SQL berurutan dengan advisory lock dan checksum.
- `internal/config` memvalidasi environment, URL, durasi, cookie, dan encryption key.
- `internal/cryptox` menyediakan enkripsi field AES-256-GCM.
- `internal/httpapi` memisahkan auth, session, profil, organisasi, submit, webhook, middleware, dan response.
- `migrations` adalah satu-satunya sumber schema database.

## Frontend

- `app` memuat route, layout, serta BFF route handler.
- `components/ui` hanya berisi primitive shadcn yang benar-benar digunakan.
- `components` berisi komposisi domain seperti shell, form, dan tampilan profil.
- `lib/server-api.ts` menangani fetch server-side dengan cookie session.
- `types/member.ts` menjadi kontrak tipe UI.

Session berada pada cookie HttpOnly. Browser tidak menerima API key Laci, client secret SSO, webhook secret, atau encryption key.
