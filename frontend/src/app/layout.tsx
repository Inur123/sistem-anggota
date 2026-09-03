import type { Metadata } from "next";
import { Suspense } from "react";
import "@fontsource-variable/manrope";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ToastHandler } from "@/components/toast-handler";

export const metadata: Metadata = {
  title: {
    default: "Sistem Anggota IPNU IPPNU",
    template: "%s · Sistem Anggota IPNU IPPNU",
  },
  description: "Portal resmi untuk profil, pengajuan, dan perjalanan keanggotaan IPNU IPPNU.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className="antialiased">
        {children}
        <Toaster position="top-right" />
        <Suspense fallback={null}>
          <ToastHandler />
        </Suspense>
      </body>
    </html>
  );
}
