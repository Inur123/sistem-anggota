import { BadgeCheck, Fingerprint, Layers, MapPin, ShieldCheck, UserCheck } from "lucide-react";
import { Card } from "../ui/card";

export function AlurSection() {
    return (
        <section id="alur" className="py-20 bg-white border-y border-[#dde7e2]/80">
            <div className="w-full max-w-[1200px] mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-[#146949]">
                        LANGKAH KEANGGOTAAN
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0e4832] tracking-tight mt-2 mb-4">
                        Tiga Langkah Menjadi Anggota Terdata
                    </h2>
                    <p className="text-[#566e63] text-base leading-relaxed">
                        Alur transparan yang menghubungkan Anda dengan pimpinan ranting,
                        komisariat, hingga cabang.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
                    {/* Step 1 */}
                    <Card className="relative flex flex-col h-full justify-between bg-[#f8faf9]/70 border border-[#dde7e2] rounded-2xl p-6 lg:p-7 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all">
                        <div className="absolute top-6 right-6 text-2xl font-black text-slate-300">
                            01
                        </div>
                        <div className="flex-1 flex flex-col mb-6">
                            <div className="size-12 rounded-xl bg-white border border-[#dde7e2] flex items-center justify-center text-[#146949] mb-6 shadow-xs">
                                <Fingerprint size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-[#11281e] mb-2">
                                Akses IPNU IPPNU ID
                            </h3>
                            <p className="text-sm text-[#566e63] leading-relaxed">
                                Masuk dengan akun SSO resmi dari portal Pelajar NU Magetan.
                                Data dasar otomatis tersinkronisasi tanpa input berulang kali.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#146949] pt-4 border-t border-[#dde7e2] mt-auto">
                            <UserCheck size={14} className="shrink-0" />
                            <span>Otentikasi Aman Terpusat</span>
                        </div>
                    </Card>

                    {/* Step 2 */}
                    <Card className="relative flex flex-col h-full justify-between bg-white border-2 border-[#146949]/30 rounded-2xl p-6 lg:p-7 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                        <div className="absolute top-6 right-6 text-2xl font-black text-[#146949]/30">
                            02
                        </div>
                        <div className="flex-1 flex flex-col mb-6">
                            <div className="size-12 rounded-xl bg-[#eaf5f0] border border-[#146949]/20 flex items-center justify-center text-[#146949] mb-6 shadow-xs">
                                <Layers size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-[#11281e] mb-2">
                                Pilih Pimpinan Tujuan
                            </h3>
                            <p className="text-sm text-[#566e63] leading-relaxed">
                                Pilih struktur pimpinan domisili Anda: Cabang, PAC, hingga Pimpinan
                                Ranting (desa/kelurahan) atau Pimpinan Komisariat (sekolah/pesantren).
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#146949] pt-4 border-t border-[#dde7e2] mt-auto">
                            <MapPin size={14} className="shrink-0" />
                            <span>Hierarki Pimpinan Terpadu</span>
                        </div>
                    </Card>

                    {/* Step 3 */}
                    <Card className="relative flex flex-col h-full justify-between bg-[#f8faf9]/70 border border-[#dde7e2] rounded-2xl p-6 lg:p-7 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all">
                        <div className="absolute top-6 right-6 text-2xl font-black text-slate-300">
                            03
                        </div>
                        <div className="flex-1 flex flex-col mb-6">
                            <div className="size-12 rounded-xl bg-white border border-[#dde7e2] flex items-center justify-center text-[#146949] mb-6 shadow-xs">
                                <ShieldCheck size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-[#11281e] mb-2">
                                Verifikasi via Laci
                            </h3>
                            <p className="text-sm text-[#566e63] leading-relaxed">
                                Pengurus memeriksa pengajuan data Anda melalui sistem Laci. Pantau
                                notifikasi status persetujuan secara real-time langsung di profil.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#146949] pt-4 border-t border-[#dde7e2] mt-auto">
                            <BadgeCheck size={14} className="shrink-0" />
                            <span>Validasi Pengurus Cabang</span>
                        </div>
                    </Card>
                </div>
            </div>
        </section>
    );
}
