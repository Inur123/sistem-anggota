# Frontend Sistem Anggota

Next.js App Router dengan TypeScript, Tailwind CSS, dan primitive shadcn/Base UI yang dikustomisasi melalui token tema.

```bash
cp .env.example .env.local
npm ci
npm run dev
```

Pemeriksaan sebelum deploy:

```bash
npm run typecheck
npm run lint
npm run build
```

Browser hanya berkomunikasi dengan route handler Next.js untuk operasi profil. Secret SSO dan Laci tidak boleh memakai prefix `NEXT_PUBLIC_`.
