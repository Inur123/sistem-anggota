# API

Prefix backend: `/api/v1`. Semua response aplikasi menggunakan JSON, kecuali endpoint yang memang melakukan redirect.

## Autentikasi

- `GET /auth/login?return_to=/profile` — memulai Authorization Code + PKCE S256.
- `GET /auth/callback` — memvalidasi callback OIDC, membuat profil awal dan session, lalu redirect.
- `GET /auth/session` — mengembalikan pengguna pada session aktif.
- `POST /auth/logout` — mencabut session, menghapus cookie, lalu redirect.

## Profil

- `GET /profile` — profil aktif; NIK, NIA, dan RFID selalu tersamarkan.
- `PATCH /profile` — menyimpan perubahan dengan field `version` untuk optimistic locking.
- `POST /profile` — alias kompatibilitas untuk client lama; client baru memakai `PATCH`.
- `POST /profile/submit` — mengirim versi profil saat ini ke Laci dengan idempotency key stabil.
- `GET /organizations` — proxy terautentikasi ke daftar organisasi Laci.

Endpoint profil membutuhkan cookie session. Profil berstatus `PENDING` tidak dapat diubah atau dikirim ulang.

## Integrasi

- `POST /integrations/laci/member-status` — menerima event `member.status_changed`.

Webhook memakai bentuk berikut:

```json
{
  "eventId": "evt_unique",
  "eventType": "member.status_changed",
  "data": {
    "laciMemberId": "member_id",
    "status": "DITERIMA",
    "reason": "",
    "periodeId": "periode_id",
    "periodeNama": "2026–2028"
  }
}
```

`X-Laci-Signature` berisi HMAC-SHA256 hex dari raw request body dengan `LACI_WEBHOOK_SECRET`. Prefix `sha256=` juga diterima. `eventId` wajib unik untuk replay protection.

## Health

- `GET /health/live` — proses API hidup.
- `GET /health/ready` — koneksi PostgreSQL siap.
