import { Link, router, usePage } from "@inertiajs/react";
import {
    ArrowUpRight,
    CircleHelp,
    History,
    LayoutGrid,
    LoaderCircle,
    LogOut,
    Menu,
    X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import type { SharedProps } from "../../types";
import { Brand, Flash, OfflineNotice } from "../ui";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar } from "../ui/avatar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "../ui/breadcrumb";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "../ui/alert-dialog";

export default function MemberLayout({
    children,
    title,
    subtitle,
    action,
}: {
    children: ReactNode;
    title: string;
    subtitle?: string;
    action?: ReactNode;
}) {
    const { auth } = usePage<SharedProps>().props;
    const { url } = usePage();
    const [open, setOpen] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const [logoutOpen, setLogoutOpen] = useState(false);
    const user = auth.user!;

    const isProfileActive = !url.startsWith("/riwayat");
    const isHistoryActive = url.startsWith("/riwayat");

    // Strictly lock html & body from any window-level scrolling or rubber-band bounce
    useEffect(() => {
        const html = document.documentElement;
        const body = document.body;

        const origHtmlOverflow = html.style.overflow;
        const origBodyOverflow = body.style.overflow;
        const origHtmlHeight = html.style.height;
        const origBodyHeight = body.style.height;
        const origHtmlOverscroll = html.style.overscrollBehavior;
        const origBodyOverscroll = body.style.overscrollBehavior;

        html.style.overflow = "hidden";
        html.style.height = "100%";
        html.style.overscrollBehavior = "none";

        body.style.overflow = "hidden";
        body.style.height = "100%";
        body.style.overscrollBehavior = "none";

        return () => {
            html.style.overflow = origHtmlOverflow;
            html.style.height = origHtmlHeight;
            html.style.overscrollBehavior = origHtmlOverscroll;

            body.style.overflow = origBodyOverflow;
            body.style.height = origBodyHeight;
            body.style.overscrollBehavior = origBodyOverscroll;
        };
    }, []);

    return (
        <div className="fixed inset-0 w-full h-full bg-white flex flex-col md:flex-row text-[#11281e] font-sans antialiased overflow-hidden overscroll-none select-none-headers">
            <a
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:p-4 focus:shadow-lg focus:rounded-lg focus:border focus:border-[#146949]"
                href="#main"
                onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("main")?.scrollIntoView({ behavior: "smooth" });
                }}
            >
                Lewati navigasi
            </a>
            <OfflineNotice />

            {/* Sidebar Navigation - Fixed & Non-scrolling with window */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-[#dde7e2] flex flex-col shrink-0 transition-transform duration-300 md:static md:h-full md:max-h-full md:translate-x-0 ${
                    open ? "translate-x-0 shadow-2xl" : "-translate-x-full"
                }`}
            >
                {/* Top Logo Bar - Exactly h-16 matching the right navbar */}
                <div className="h-16 px-5 border-b border-[#dde7e2] flex items-center justify-between shrink-0 bg-white">
                    <Brand />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-[#566e63] hover:text-[#11281e] rounded-lg md:hidden"
                        aria-label="Tutup navigasi"
                        onClick={() => setOpen(false)}
                    >
                        <X size={20} />
                    </Button>
                </div>

                {/* Sidebar Inner Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 overscroll-contain">
                    <Badge variant="secondary" className="gap-2 py-2.5 px-3 text-xs font-semibold text-[#0e4832] shrink-0 justify-start w-full rounded-xl">
                        <span className="size-2 rounded-full bg-[#146949] animate-pulse shrink-0" />
                        <span className="truncate">Portal Anggota Pelajar NU Magetan</span>
                    </Badge>

                    <nav className="flex flex-col gap-1.5 flex-1" aria-label="Navigasi anggota">
                        <span className="text-[0.68rem] font-extrabold uppercase tracking-widest text-[#566e63] px-3 mb-1">
                            MENU UTAMA
                        </span>
                        <Link
                            href="/profile"
                            preserveScroll
                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                isProfileActive
                                    ? "bg-[#146949] text-white shadow-xs"
                                    : "text-[#566e63] hover:text-[#0e4832] hover:bg-[#f8faf9]"
                            }`}
                            aria-current={isProfileActive ? "page" : undefined}
                        >
                            <LayoutGrid size={18} className="shrink-0" />
                            <span>Profil Saya</span>
                        </Link>
                        <Link
                            href="/riwayat"
                            preserveScroll
                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                isHistoryActive
                                    ? "bg-[#146949] text-white shadow-xs"
                                    : "text-[#566e63] hover:text-[#0e4832] hover:bg-[#f8faf9]"
                            }`}
                            aria-current={isHistoryActive ? "page" : undefined}
                        >
                            <History size={18} className="shrink-0" />
                            <span>Riwayat Keanggotaan</span>
                        </Link>
                    </nav>

                    <div className="flex flex-col gap-4 pt-4 border-t border-[#dde7e2] mt-auto shrink-0">
                        <div className="bg-white border border-[#dde7e2] rounded-xl p-3.5 text-xs text-[#566e63]">
                            <div className="flex items-center gap-2 font-bold text-[#11281e] mb-1">
                                <CircleHelp size={16} className="text-[#146949] shrink-0" />
                                <strong>Bantuan Verifikasi</strong>
                            </div>
                            <p className="leading-relaxed">
                                Hubungi pengurus pimpinan tujuan jika ada kendala data atau berkas verifikasi.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 px-1 py-1">
                            <Avatar
                                src={user.avatar_url}
                                alt={user.name}
                                fallback={user.name}
                                className="size-9.5 rounded-full shadow-xs shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <strong className="block text-xs font-bold text-[#11281e] truncate">
                                    {user.name || "Anggota"}
                                </strong>
                                <small className="block text-[0.68rem] font-medium text-[#566e63] truncate">
                                    {user.gender === "P"
                                        ? "Rekanita (IPPNU)"
                                        : user.gender === "L"
                                          ? "Rekan (IPNU)"
                                          : "Kader Pelajar NU"}
                                </small>
                            </div>
                            <AlertDialog
                                open={logoutOpen}
                                onOpenChange={(val) => {
                                    if (!leaving) {
                                        setLogoutOpen(val);
                                    }
                                }}
                            >
                                <AlertDialogTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 text-[#566e63] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                        disabled={leaving}
                                        aria-label="Keluar akun"
                                        title="Keluar akun"
                                    >
                                        <LogOut size={16} />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Keluar dari Sistem Anggota?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Sesi keanggotaan Anda akan diakhiri. Anda perlu masuk kembali melalui SSO Pelajar NU untuk mengakses dan memperbarui data profil Anda.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel disabled={leaving}>
                                            Batal
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            disabled={leaving}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setLeaving(true);
                                                router.post(
                                                    "/auth/logout",
                                                    {},
                                                    {
                                                        onFinish: () => {
                                                            setLeaving(false);
                                                            setLogoutOpen(false);
                                                        },
                                                    }
                                                );
                                            }}
                                            className="bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer"
                                        >
                                            {leaving ? (
                                                <span className="inline-flex items-center gap-2">
                                                    <LoaderCircle
                                                        size={16}
                                                        className="animate-spin"
                                                    />
                                                    <span>Mengeluarkan...</span>
                                                </span>
                                            ) : (
                                                "Ya, Keluar"
                                            )}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile backdrop */}
            {open && (
                <button
                    type="button"
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 md:hidden cursor-pointer border-0 p-0"
                    aria-label="Tutup navigasi"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Right Dashboard Shell - Fixed & Non-scrolling with header & footer pinned */}
            <div className="flex-1 w-full flex flex-col min-w-0 h-full overflow-hidden bg-white">
                {/* Fixed Top Navbar */}
                <header className="w-full h-16 border-b border-[#dde7e2] bg-white px-4 sm:px-8 flex items-center justify-between shrink-0 z-20">
                    <div className="flex items-center gap-3 min-w-0">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 text-[#566e63] hover:text-[#11281e] rounded-lg md:hidden"
                            onClick={() => setOpen(true)}
                            aria-expanded={open}
                            aria-label="Buka navigasi"
                        >
                            <Menu size={20} />
                        </Button>
                        <Breadcrumb className="truncate">
                            <BreadcrumbList className="text-sm">
                                <BreadcrumbItem>
                                    <BreadcrumbLink asChild>
                                        <Link
                                            href="/profile"
                                            className="text-[#566e63] hover:text-[#11281e] font-medium transition-colors"
                                        >
                                            Sistem Anggota
                                        </Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="text-[#dde7e2]">
                                    /
                                </BreadcrumbSeparator>
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="font-bold text-[#11281e]">
                                        {isHistoryActive ? "Riwayat" : "Profil Saya"}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <a
                        href="https://pelajarnumagetan.or.id"
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#566e63] hover:text-[#146949] transition-colors shrink-0 ml-4"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <span>IPNU IPPNU Magetan</span>
                        <ArrowUpRight size={14} />
                    </a>
                </header>

                {/* ONLY this main content area scrolls */}
                <main id="main" className="flex-1 w-full overflow-y-auto p-4 sm:p-6 lg:p-8 overscroll-contain bg-white">
                    <div className="max-w-6xl w-full mx-auto">
                        <Flash />
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#dde7e2]">
                            <div>
                                <p className="text-xs font-extrabold tracking-widest uppercase text-[#146949] mb-1">
                                    RUANG KEANGGOTAAN
                                </p>
                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0e4832] leading-snug">
                                    {title}
                                </h1>
                                {subtitle && (
                                    <p className="text-sm text-[#566e63] mt-1">{subtitle}</p>
                                )}
                            </div>
                            {action && <div className="flex items-center gap-3 shrink-0">{action}</div>}
                        </div>
                        {children}
                    </div>
                </main>

                {/* Fixed Bottom Footer */}
                <footer className="w-full border-t border-[#dde7e2] bg-white py-3 sm:py-3.5 px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#566e63] shrink-0 z-10">
                    <span>
                        © {new Date().getFullYear()} PC IPNU IPPNU Kabupaten Magetan
                    </span>
                    <span className="font-medium italic text-[#146949]">
                        Belajar · Berjuang · Bertaqwa
                    </span>
                </footer>
            </div>
        </div>
    );
}
