import { ArrowRight, LockKeyhole, MapPin } from "lucide-react";
import { Button } from "../ui/button";
import type { User } from "../../types";

export function HeroSection({ user }: { user: User | null }) {
    return (
        <section className="pt-8 pb-14 sm:pt-10 sm:pb-16 md:pt-12 md:pb-20 lg:pt-12 lg:pb-24 overflow-hidden">
            <div className="w-full max-w-[1200px] mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] items-center gap-12 lg:gap-14">
                    {/* Left Column: Text, Title & CTA */}
                    <div className="flex flex-col items-start text-left">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#146949]/[0.08] border border-[#146949]/[0.18] rounded-full mb-6">
                            <span className="size-[7px] rounded-full bg-[#146949] shadow-[0_0_0_3px_rgba(20,105,73,0.2)] animate-pulse" />
                            <span className="text-xs font-bold tracking-[0.06em] text-[#0e4832]">
                                SISTEM ANGGOTA TERPADU
                            </span>
                        </div>

                        <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.35rem] font-black tracking-[-0.035em] leading-[1.12] mb-5">
                            <span className="text-[#0e4832] block">Khidmah Nyata.</span>
                            <span className="text-[#146949] block">Bagian dari Pelajar NU.</span>
                        </h1>

                        <p className="text-base sm:text-[1.1rem] leading-[1.65] text-[#566e63] max-w-[540px] mb-8 font-normal">
                            Ruang pencatatan resmi kader Ikatan Pelajar Nahdlatul Ulama dan
                            Ikatan Pelajar Putri Nahdlatul Ulama Kabupaten Magetan. Satu data
                            untuk menyambung tradisi dan pergerakan.
                        </p>

                        <div className="flex flex-col items-start gap-5 w-full">
                            <a
                                href={user ? "/profile" : "/auth/login"}
                                className="inline-block"
                            >
                                <Button
                                    size="lg"
                                    className="h-auto py-3.5 px-6 rounded-xl bg-gradient-to-br from-[#146949] to-[#0e4832] text-white font-bold text-base shadow-[0_4px_14px_rgba(20,105,73,0.25)] hover:shadow-[0_6px_20px_rgba(20,105,73,0.35)] hover:-translate-y-0.5 transition-all duration-200 gap-3 cursor-pointer"
                                >
                                    {!user && (
                                        <img
                                            src="/images/logo-sso.webp"
                                            alt="SSO"
                                            className="w-5 h-5 object-contain shrink-0"
                                        />
                                    )}
                                    <span>
                                        {user
                                            ? "Lanjutkan ke Dashboard Profil"
                                            : "Masuk dengan IPNU IPPNU ID"}
                                    </span>
                                    <ArrowRight size={18} className="shrink-0" />
                                </Button>
                            </a>

                            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-[0.825rem] text-[#566e63] font-medium">
                                <div className="flex items-center gap-1.5">
                                    <LockKeyhole size={14} className="text-[#146949] shrink-0" />
                                    <span>Terintegrasi SSO Pelajar NU Magetan</span>
                                </div>
                                <span className="w-1 h-1 rounded-full bg-[#dde7e2] hidden sm:block shrink-0" />
                                <div className="flex items-center gap-1.5">
                                    <MapPin size={14} className="text-[#146949] shrink-0" />
                                    <span>Pimpinan Cabang Kab. Magetan</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Logo Sistem Anggota with soft transparency */}
                    <div className="hidden lg:flex items-center justify-center min-h-[400px] relative select-none pointer-events-none" aria-hidden="true">
                        <div className="absolute w-72 h-72 rounded-full bg-[#146949]/[0.05] blur-3xl" />
                        <img
                            src="/images/logo-sistem-anggota.png"
                            alt="Logo Sistem Anggota"
                            className="w-[340px] h-[340px] max-w-full object-contain opacity-70 drop-shadow-sm transition-opacity duration-500"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
