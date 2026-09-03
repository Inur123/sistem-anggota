# Runbook singkat

- **SSO gagal:** cek discovery URL, client ID/secret, redirect URI, issuer callback, dan sinkronisasi waktu server.
- **Session gagal:** cek cookie domain/path, `Secure`, HTTPS, expiry, serta tabel `sessions`.
- **Laci gagal:** cek URL/API key, jaringan, timeout, `sync_attempts`, dan dukungan `Idempotency-Key`.
- **Webhook 401:** hitung HMAC dari raw body yang sama persis dan cek `LACI_WEBHOOK_SECRET`.
- **Webhook 404:** `laciMemberId` belum tercatat pada periode aktif; periksa hasil submit sebelumnya.
- **Migrasi ditolak:** jangan mengedit SQL lama. Buat migrasi timestamped baru; checksum lama sengaja dilindungi.
- **Database gagal:** cek readiness, koneksi, kapasitas, backup, dan restore point.
- **Pending terlalu lama:** cocokkan `sync_attempts`, periode aktif, dan event webhook pada kedua sistem.
