# Keamanan

- OIDC memakai Authorization Code, PKCE S256, state sekali pakai, nonce, validasi issuer, signature ID token, audience, subject, dan UserInfo.
- Session hanya disimpan sebagai hash di database. Cookie memakai `HttpOnly`, `SameSite=Lax`, masa berlaku dari `SESSION_TTL`, dan wajib `Secure` di production.
- NIK, NIA, nomor HP, tempat/tanggal lahir, alamat, RFID, hobi, pekerjaan, pendidikan, pengkaderan, dan jabatan dienkripsi AES-256-GCM per field.
- Form tidak menyimpan NIK atau data profil ke `localStorage`.
- Webhook diverifikasi menggunakan HMAC constant-time dan diproses idempotent berdasarkan `eventId`.
- Request JSON dan response upstream dibatasi 1 MiB. HTTP client serta server memiliki timeout.
- Pesan error publik tidak memuat SQL, token, secret, payload pribadi, atau detail internal.
- Header API menetapkan no-store, no-referrer, nosniff, dan frame denial.

## Kewajiban deployment

- Gunakan HTTPS dan `SESSION_COOKIE_SECURE=true` di production.
- Simpan secret pada secret manager dan rotasikan secara berkala.
- Terapkan rate limit di reverse proxy/API gateway untuk login, update profil, submit, dan webhook.
- Batasi akses jaringan database serta endpoint backend; backup database harus terenkripsi.
- Kontrak webhook timestamp belum tersedia. Tambahkan pemeriksaan timestamp setelah Laci menyepakati header dan toleransi waktunya.
