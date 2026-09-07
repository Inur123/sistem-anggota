import { ChevronDown, HelpCircle } from "lucide-react";

export function FaqSection({
    openFaq,
    onToggleFaq,
}: {
    openFaq: number | null;
    onToggleFaq: (index: number) => void;
}) {
    const faqItems = [
        {
            q: "Apakah perlu membuat akun baru di sistem ini?",
            a: "Tidak perlu. Sistem ini menggunakan akun tunggal IPNU IPPNU ID (SSO Pelajar NU Magetan). Anda cukup masuk menggunakan kredensial yang sudah terdaftar di portal SSO.",
        },
        {
            q: "Bagaimana alur verifikasi data keanggotaan saya?",
            a: "Setelah Anda melengkapi data pribadi dan memilih pimpinan tujuan (Cabang/PAC/Ranting/Komisariat), berkas pengajuan akan otomatis masuk ke sistem verifikasi Laci pengurus pimpinan terkait untuk divalidasi.",
        },
        {
            q: "Apakah data profil dapat diperbaiki setelah dikirimkan?",
            a: "Selama status pengajuan masih dalam antrean verifikasi (PENDING), data dikunci sementara. Apabila terdapat catatan perbaikan dari pengurus, status akan berubah menjadi DITOLAK dengan catatan instruksi perbaikan yang dapat langsung Anda ubah di menu profil.",
        },
        {
            q: "Kapan saya mendapatkan Nomor Induk Anggota (NIA)?",
            a: "Nomor Induk Anggota resmi akan diterbitkan setelah pengajuan keanggotaan Anda dinyatakan diterima dan diverifikasi oleh pengurus pimpinan berwenang.",
        },
    ];

    return (
        <section id="faq" className="py-20 w-full max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
                <div className="lg:col-span-5">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-[#146949]">
                        PUSAT INFORMASI
                    </span>
                    <h2 className="text-3xl font-extrabold text-[#0e4832] tracking-tight mt-2 mb-4">
                        Pertanyaan Umum Seputar Keanggotaan
                    </h2>
                    <p className="text-[#566e63] text-sm leading-relaxed mb-8">
                        Butuh informasi lebih mendalam seputar keikutsertaan Anda di IPNU
                        IPPNU Magetan? Simak ringkasan jawaban atas pertanyaan umum berikut.
                    </p>

                    <div className="bg-white border border-[#dde7e2] rounded-xl p-5 flex items-start gap-4 shadow-xs">
                        <HelpCircle size={22} className="text-[#146949] shrink-0 mt-0.5" />
                        <div>
                            <strong className="block text-sm font-semibold text-[#11281e] mb-1">
                                Perlu bantuan pengurus?
                            </strong>
                            <p className="text-xs text-[#566e63] leading-relaxed">
                                Hubungi sekretariat pimpinan di wilayah kecamatan atau ranting Anda.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-7 space-y-3">
                    {faqItems.map((item, idx) => {
                        const isOpen = openFaq === idx;
                        return (
                            <div
                                key={idx}
                                className={`bg-white border rounded-xl overflow-hidden transition-all duration-200 ${
                                    isOpen
                                        ? "border-[#146949]/40 shadow-xs ring-1 ring-[#146949]/10"
                                        : "border-[#dde7e2] hover:border-[#b8cec4]"
                                }`}
                            >
                                <button
                                    type="button"
                                    className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-[#11281e] gap-4 cursor-pointer bg-transparent"
                                    onClick={() => onToggleFaq(idx)}
                                    aria-expanded={isOpen}
                                >
                                    <span>{item.q}</span>
                                    <ChevronDown
                                        size={18}
                                        className={`text-[#566e63] shrink-0 transition-transform duration-200 ${
                                            isOpen ? "rotate-180 text-[#146949]" : ""
                                        }`}
                                    />
                                </button>
                                {isOpen && (
                                    <div className="px-5 pb-5 pt-0 text-sm text-[#566e63] leading-relaxed">
                                        <p>{item.a}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
