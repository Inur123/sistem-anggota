"use client";

import { AlertTriangleIcon, ArrowLeftIcon, RefreshCwIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();

  return (
    <main className="member-canvas grid min-h-screen place-items-center px-5 py-12">
      <div className="soft-surface w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-border/75 bg-white">
        <div className="flex items-center justify-between border-b border-border/75 px-6 py-5">
          <BrandMark />
          <span className="font-utility text-[9px] font-bold uppercase tracking-[0.18em] text-destructive">Gagal memuat</span>
        </div>
        <div className="p-6 sm:p-8">
          <span className="grid size-12 place-items-center rounded-2xl bg-destructive/10 text-destructive"><AlertTriangleIcon className="size-5" /></span>
          <h1 className="text-balance mt-6 font-display text-3xl font-[760] leading-tight tracking-[-0.045em]">Halaman belum dapat dibuka.</h1>
          <p className="text-pretty mt-3 text-sm leading-6 text-muted-foreground">Periksa koneksi lalu coba lagi. Data yang sudah tersimpan tidak ikut berubah.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button className="h-10 rounded-xl px-4 font-bold" onClick={reset}><RefreshCwIcon /> Coba lagi</Button>
            <Button variant="ghost" className="h-10 rounded-xl px-4" onClick={() => router.push("/")}><ArrowLeftIcon /> Kembali ke beranda</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
