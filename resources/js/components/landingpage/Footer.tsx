import { ArrowUpRight } from "lucide-react";
import { Brand } from "../ui";
import type { User } from "../../types";

export function Footer({
    user,
    onScrollTo,
}: {
    user: User | null;
    onScrollTo: (id: string) => void;
}) {
    return (
        <footer className="border-t border-[#dde7e2] bg-white pt-12 pb-8 mt-auto">
            <div className="w-full max-w-[1200px] mx-auto px-6">
                <div className="flex flex-col md:flex-row items-start justify-between gap-8 pb-10">
                    {/* Brand & Mission */}
                    <div className="flex flex-col items-start max-w-md">
                        <Brand />
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.7rem] font-bold bg-[#eaf5f0] text-[#146949] border border-[#146949]/20 mt-3.5 mb-2.5">
                            <span>Belajar · Berjuang · Bertaqwa</span>
                        </div>
                        <p className="text-xs text-[#566e63] leading-relaxed">
                            Portal resmi pencatatan dan pengelolaan identitas kader Ikatan
                            Pelajar Nahdlatul Ulama &amp; Ikatan Pelajar Putri Nahdlatul Ulama
                            Kabupaten Magetan.
                        </p>
                    </div>

                    {/* Quick Navigation Links */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 text-xs font-semibold text-[#566e63]">
                        <button
                            type="button"
                            onClick={() => onScrollTo("alur")}
                            className="hover:text-[#146949] transition-colors cursor-pointer bg-transparent border-none p-0"
                        >
                            Alur Anggota
                        </button>
                        <button
                            type="button"
                            onClick={() => onScrollTo("faq")}
                            className="hover:text-[#146949] transition-colors cursor-pointer bg-transparent border-none p-0"
                        >
                            Pusat Bantuan
                        </button>
                        <a
                            href={user ? "/profile" : "/auth/login"}
                            className="hover:text-[#146949] transition-colors"
                        >
                            {user ? "Profil Saya" : "Masuk SSO"}
                        </a>
                        <a
                            href="https://pelajarnumagetan.or.id"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f8faf9] border border-[#dde7e2] text-[#0e4832] hover:bg-[#eaf5f0] hover:border-[#146949]/30 transition-all font-bold"
                        >
                            <span className="size-1.5 rounded-full bg-[#146949]" />
                            <span>pelajarnumagetan.or.id</span>
                            <ArrowUpRight size={13} className="text-[#146949]" />
                        </a>
                    </div>
                </div>

                {/* Bottom Copyright */}
                <div className="pt-6 border-t border-[#dde7e2]/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#566e63]">
                    <span>
                        © {new Date().getFullYear()} PC IPNU IPPNU Kabupaten Magetan. Seluruh hak cipta dilindungi.
                    </span>
                    <span className="text-[0.7rem] font-medium text-slate-400">
                        Sistem Anggota Terpadu · Pelajar NU Magetan
                    </span>
                </div>
            </div>
        </footer>
    );
}
