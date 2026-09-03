import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRightIcon,
  BadgeCheckIcon,
  CircleCheckIcon,
  DatabaseIcon,
  FingerprintIcon,
  LockKeyholeIcon,
  NetworkIcon,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { buttonVariants } from "@/components/ui/button";

const foundations = [
  {
    icon: FingerprintIcon,
    title: "Satu kali masuk",
    text: "Identitas utama mengikuti IPNU IPPNU ID.",
  },
  {
    icon: NetworkIcon,
    title: "Asal organisasi jelas",
    text: "Cabang, PAC, Ranting, atau Komisariat tercatat rapi.",
  },
  {
    icon: BadgeCheckIcon,
    title: "Status transparan",
    text: "Progres verifikasi terlihat langsung dari profil.",
  },
];

export default function Home() {
  const apiURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";
  const loginURL = `${apiURL.replace(/\/$/, "")}/api/v1/auth/login`;

  return (
    <main className="min-h-screen overflow-x-clip bg-background">
      <header className="relative z-20 mx-auto flex h-20 w-full max-w-[1280px] items-center justify-between px-5 sm:h-24 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25"
        >
          <BrandMark />
          <span className="leading-tight">
            <span className="block font-display text-sm font-extrabold tracking-[-0.025em]">Sistem Anggota</span>
            <span className="mt-0.5 block text-[9px] font-bold uppercase tracking-[0.2em] text-primary/70">IPNU · IPPNU</span>
          </span>
        </Link>
        <span className="hidden items-center gap-2 rounded-full border border-primary/10 bg-white/75 px-3 py-2 text-[11px] font-bold text-primary shadow-sm backdrop-blur sm:flex">
          <span className="size-1.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10" />
          Terhubung ke Laci
        </span>
      </header>

      <section className="relative mx-auto grid w-full max-w-[1280px] grid-cols-[minmax(0,1fr)] gap-12 px-5 pb-16 pt-8 sm:px-8 sm:pt-12 lg:min-h-[670px] lg:grid-cols-[minmax(0,1.02fr)_minmax(440px,.98fr)] lg:items-center lg:gap-16 lg:px-10 lg:pb-20 lg:pt-8">
        <div className="relative z-10 min-w-0 max-w-2xl">
          <p className="mb-6 flex items-center gap-3 text-[11px] font-extrabold uppercase tracking-[0.2em] text-primary">
            <span className="grid size-6 place-items-center rounded-full bg-secondary">
              <CircleCheckIcon className="size-3.5" />
            </span>
            Portal anggota resmi
          </p>
          <h1 className="text-balance max-w-full font-display text-[clamp(2.5rem,7.2vw,5.75rem)] font-[760] leading-[0.98] tracking-[-0.06em] text-foreground">
            Profil anggota, dalam satu alur yang jelas.
          </h1>
          <p className="text-pretty mt-7 max-w-xl text-[15px] leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Lengkapi data, tentukan asal pimpinan, lalu ikuti proses verifikasi—semuanya dari satu ruang yang ringan dan mudah dipahami.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <a
              href={loginURL}
              className={buttonVariants({
                size: "lg",
                className:
                  "h-13 w-full justify-between rounded-xl px-3.5 pl-4 text-[13px] font-bold shadow-[0_14px_34px_-18px_color-mix(in_oklch,var(--primary)_70%,transparent)] transition-transform hover:-translate-y-0.5 sm:w-auto sm:min-w-72",
              })}
            >
              <span className="flex items-center gap-3">
                <span className="grid size-8 place-items-center rounded-lg bg-white">
                  <Image src="/images/logo-sso.webp" alt="" width={24} height={24} className="size-6 object-contain" />
                </span>
                Masuk dengan IPNU IPPNU ID
              </span>
              <ArrowUpRightIcon className="size-4" />
            </a>
            <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <LockKeyholeIcon className="size-4 text-primary" />
              Sesi aman dan terenkripsi
            </span>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-border/80 pt-5 text-xs font-semibold text-muted-foreground">
            <span className="flex items-center gap-2"><CircleCheckIcon className="size-4 text-primary" /> Tidak perlu akun baru</span>
            <span className="flex items-center gap-2"><CircleCheckIcon className="size-4 text-primary" /> Data terhubung ke pengurus</span>
          </div>
        </div>

        <div className="relative mx-auto min-w-0 w-full max-w-[570px] lg:mr-0">
          <div className="route-grid soft-surface relative min-h-[520px] overflow-hidden rounded-[2rem] bg-primary p-5 text-primary-foreground sm:min-h-[570px] sm:rounded-[2.5rem] sm:p-8">
            <div className="absolute -right-24 -top-24 size-72 rounded-full border border-white/10" />
            <div className="absolute -right-9 -top-9 size-40 rounded-full border border-white/10" />
            <div className="relative z-10 flex items-center justify-between gap-5">
              <div>
                <p className="font-utility text-[9px] font-bold uppercase tracking-[0.22em] text-primary-foreground/55">Alur identitas anggota</p>
                <p className="mt-2 font-display text-lg font-bold tracking-[-0.025em]">Tiga titik, satu data.</p>
              </div>
              <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-2 text-[10px] font-bold text-primary-foreground/75 backdrop-blur">
                <span className="size-1.5 rounded-full bg-accent" /> Sinkron
              </span>
            </div>

            <div className="relative mx-auto mt-8 h-[385px] max-w-[430px] sm:mt-11">
              <span className="route-draw absolute left-[43px] top-14 h-[254px] w-px bg-gradient-to-b from-accent via-white/45 to-white/10 sm:left-1/2" />

              <div className="route-arrive absolute left-0 top-0 flex items-center gap-3 rounded-2xl border border-white/12 bg-white/10 p-3.5 pr-5 backdrop-blur-md sm:left-7">
                <span className="flex items-center">
                  <span className="grid size-10 place-items-center rounded-full bg-white p-1.5"><Image src="/images/ipnu.png" alt="Logo IPNU" width={32} height={32} className="size-8 object-contain" /></span>
                  <span className="-ml-2 grid size-10 place-items-center rounded-full bg-white p-1.5"><Image src="/images/ppnu.png" alt="Logo IPPNU" width={32} height={32} className="size-8 object-contain" /></span>
                </span>
                <span>
                  <span className="block text-[9px] font-bold uppercase tracking-[0.17em] text-primary-foreground/50">Sumber identitas</span>
                  <span className="mt-1 block text-sm font-bold">IPNU IPPNU ID</span>
                </span>
              </div>

              <div className="route-arrive absolute left-0 top-[138px] w-full rounded-[1.45rem] bg-white p-5 text-foreground shadow-2xl shadow-black/15 [animation-delay:120ms] sm:left-auto sm:right-0 sm:w-[82%] sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <span>
                    <span className="font-utility text-[9px] font-bold uppercase tracking-[0.18em] text-primary/65">Profil anggota</span>
                    <span className="mt-2 block font-display text-xl font-extrabold tracking-[-0.035em] sm:text-2xl">Identitas siap diproses</span>
                  </span>
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary"><FingerprintIcon className="size-5" /></span>
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"><span className="block h-full w-2/3 rounded-full bg-primary" /></span>
                  <span className="font-utility text-[10px] font-bold text-primary">02/03</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-[10px] font-bold text-muted-foreground sm:text-xs">
                  <span className="flex items-center gap-1.5"><CircleCheckIcon className="size-3.5 text-primary" /> Data pribadi</span>
                  <span className="flex items-center gap-1.5"><CircleCheckIcon className="size-3.5 text-primary" /> Asal pimpinan</span>
                </div>
              </div>

              <div className="route-arrive absolute bottom-0 right-0 flex w-[82%] items-center justify-between gap-4 rounded-2xl bg-accent p-4 text-accent-foreground [animation-delay:240ms] sm:w-[69%]">
                <span className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-white/45"><DatabaseIcon className="size-4" /></span>
                  <span>
                    <span className="block text-[9px] font-bold uppercase tracking-[0.16em] opacity-65">Tujuan akhir</span>
                    <span className="mt-0.5 block text-sm font-extrabold">Verifikasi di Laci</span>
                  </span>
                </span>
                <BadgeCheckIcon className="size-5" />
              </div>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-5 -z-10 hidden size-36 rounded-full bg-accent/35 blur-2xl sm:block" />
        </div>
      </section>

      <section className="border-y border-border/80 bg-white">
        <div className="mx-auto grid max-w-[1280px] divide-y divide-border/80 px-5 sm:px-8 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-10">
          {foundations.map((item) => (
            <div key={item.title} className="flex gap-4 py-7 md:px-7 md:first:pl-0 md:last:pr-0 lg:py-9">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary"><item.icon className="size-4.5" /></span>
              <div>
                <h2 className="font-display text-sm font-extrabold tracking-[-0.02em]">{item.title}</h2>
                <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto flex max-w-[1280px] flex-col gap-2 px-5 py-7 text-[11px] font-semibold text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <span>© {new Date().getFullYear()} Sistem Anggota IPNU IPPNU</span>
        <span>IPNU IPPNU ID · Sistem Anggota · Laci</span>
      </footer>
    </main>
  );
}
