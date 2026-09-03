import { BrandMark } from "@/components/brand-mark";

export default function Loading() {
  return (
    <main className="member-canvas min-h-screen" aria-busy="true" aria-label="Memuat halaman anggota">
      <header className="border-b border-border/75 bg-background/85">
        <div className="mx-auto flex h-18 max-w-[1280px] items-center gap-3 px-4 sm:h-20 sm:px-8 lg:px-10">
          <BrandMark />
          <div>
            <p className="font-display text-sm font-extrabold">Sistem Anggota</p>
            <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-primary/65">Ruang anggota</p>
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-8 sm:py-11 lg:px-10">
        <div className="grid animate-pulse gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="h-72 rounded-[1.65rem] border border-border/75 bg-white" />
          <div className="h-72 rounded-[1.65rem] bg-secondary" />
          <div className="h-96 rounded-[1.65rem] border border-border/75 bg-white lg:col-span-2" />
        </div>
        <p className="mt-5 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Menyiapkan data anggota…</p>
      </div>
    </main>
  );
}
