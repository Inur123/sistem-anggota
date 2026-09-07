import { Link } from "@inertiajs/react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "../ui/button";
import { Brand } from "../ui";
import type { User } from "../../types";

export function Navbar({
    user,
    onScrollTo,
}: {
    user: User | null;
    onScrollTo: (id: string) => void;
}) {
    return (
        <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/85 border-b border-[#dde7e2]/80 transition-all">
            <div className="w-full max-w-[1200px] mx-auto px-6 h-[4.25rem] flex items-center justify-between">
                <Brand />
                <nav className="flex items-center gap-6" aria-label="Navigasi utama">
                    <button
                        type="button"
                        onClick={() => onScrollTo("alur")}
                        className="hidden sm:inline-block text-[0.9rem] font-medium text-[#566e63] hover:text-[#0e4832] transition-colors cursor-pointer bg-transparent border-none p-0"
                    >
                        Alur Anggota
                    </button>
                    <button
                        type="button"
                        onClick={() => onScrollTo("faq")}
                        className="hidden sm:inline-block text-[0.9rem] font-medium text-[#566e63] hover:text-[#0e4832] transition-colors cursor-pointer bg-transparent border-none p-0"
                    >
                        Pusat Bantuan
                    </button>
                    {user ? (
                        <Link href="/profile">
                            <Button
                                size="sm"
                                className="bg-[#146949] hover:bg-[#0e4832] text-white font-semibold text-xs sm:text-sm rounded-lg gap-1.5 shadow-xs cursor-pointer"
                            >
                                <span>Buka Profil Saya</span>
                                <ArrowUpRight size={15} />
                            </Button>
                        </Link>
                    ) : (
                        <a href="/auth/login">
                            <Button
                                variant="outline"
                                size="sm"
                                className="font-bold text-xs sm:text-sm border-[#dde7e2] bg-white text-[#146949] hover:bg-[#eaf5f0] hover:text-[#0e4832] rounded-lg gap-1.5 shadow-xs cursor-pointer"
                            >
                                <span>Masuk SSO</span>
                                <ArrowUpRight size={15} className="text-[#146949]" />
                            </Button>
                        </a>
                    )}
                </nav>
            </div>
        </header>
    );
}
