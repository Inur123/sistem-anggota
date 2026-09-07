import { Head } from "@inertiajs/react";
import { Link } from "@inertiajs/react";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[#f8faf9] text-[#11281e] antialiased font-sans">
            <Head title="Kebijakan Privasi · Sistem Anggota IPNU IPPNU" />

            <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-[#dde7e2]">
                <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-[#566e63] hover:text-[#146949] transition-colors"
                    >
                        <ArrowLeft size={16} />
                        <span>Kembali</span>
                    </Link>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-12">
                <div className="flex items-center gap-3 mb-8">
                    <div className="size-12 rounded-2xl bg-[#eaf5f0] text-[#146949] flex items-center justify-center">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[#11281e]">Kebijakan Privasi</h1>
                        <p className="text-xs text-[#566e63] mt-0.5">
                            Terakhir diperbarui: September 2026
                        </p>
                    </div>
                </div>

                <article className="prose-sm space-y-8 text-sm text-[#2d4a3c] leading-relaxed">
                    <section>
                        <h2 className="text-base font-bold text-[#11281e] mb-3">1. Pendahuluan</h2>
                        <p>
                            Sistem Anggota IPNU IPPNU Kabupaten Magetan (&quot;Sistem&quot;) dikelola oleh PC IPNU IPPNU
                            Kabupaten Magetan. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menyimpan,
                            menggunakan, dan melindungi data pribadi Anda sebagai pengguna Sistem ini, sesuai dengan
                            Undang-Undang Nomor 27 Tahun 2022 tentang Perlindungan Data Pribadi (UU PDP).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-[#11281e] mb-3">2. Data yang dikumpulkan</h2>
                        <p className="mb-2">Kami mengumpulkan data berikut melalui proses pendaftaran dan login SSO:</p>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>
                                <strong>Identitas dasar:</strong> nama lengkap, jenis kelamin, dan alamat email — diperoleh
                                secara otomatis dari akun IPNU IPPNU ID Anda saat login SSO.
                            </li>
                            <li>
                                <strong>Identitas keanggotaan:</strong> NIK, NIA (Nomor Induk Anggota), nomor telepon,
                                tempat dan tanggal lahir, alamat domisili, nomor RFID.
                            </li>
                            <li>
                                <strong>Riwayat organisasi:</strong> jabatan, riwayat pendidikan, riwayat pengkaderan,
                                hobi, dan pekerjaan.
                            </li>
                            <li>
                                <strong>Data teknis:</strong> alamat IP dan user-agent browser (disimpan oleh sistem
                                session untuk keamanan).
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-[#11281e] mb-3">3. Perlindungan data</h2>
                        <p className="mb-2">Kami menerapkan langkah-langkah keamanan berikut:</p>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>
                                <strong>Enkripsi:</strong> seluruh data sensitif (NIK, NIA, nomor telepon, tanggal lahir,
                                alamat, dsb.) dienkripsi menggunakan enkripsi aplikasi Laravel sebelum disimpan di database.
                                Data hanya dapat dibaca oleh sistem dengan kunci enkripsi yang sah.
                            </li>
                            <li>
                                <strong>Masking:</strong> data seperti NIK dan NIA tidak pernah ditampilkan secara utuh
                                di antarmuka pengguna — hanya ditampilkan sebagai karakter tersembunyi (••••).
                            </li>
                            <li>
                                <strong>HTTPS:</strong> seluruh komunikasi antara browser dan server menggunakan protokol
                                HTTPS terenkripsi.
                            </li>
                            <li>
                                <strong>Keamanan sesi:</strong> sesi login memiliki batas waktu absolut dan dilengkapi
                                dengan proteksi CSRF.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-[#11281e] mb-3">4. Penggunaan data</h2>
                        <p className="mb-2">Data pribadi Anda digunakan untuk:</p>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>Memverifikasi identitas dan kelayakan keanggotaan IPNU atau IPPNU.</li>
                            <li>Mengirimkan pengajuan keanggotaan ke sistem pencatatan organisasi (Laci) untuk diverifikasi oleh pengurus yang berwenang.</li>
                            <li>Menampilkan status keanggotaan dan riwayat periode pendaftaran di dashboard anggota.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-[#11281e] mb-3">5. Pembagian data</h2>
                        <p>
                            Data Anda <strong>tidak dijual atau dibagikan</strong> kepada pihak ketiga di luar
                            lingkungan organisasi IPNU IPPNU. Data keanggotaan dikirimkan secara terenkripsi
                            ke sistem Laci yang dikelola oleh pengurus PC IPNU IPPNU Kabupaten Magetan
                            untuk keperluan verifikasi dan pencatatan resmi.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-[#11281e] mb-3">6. Hak pengguna</h2>
                        <p className="mb-2">Sesuai UU PDP, Anda berhak untuk:</p>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>Mengetahui data pribadi apa saja yang disimpan tentang Anda.</li>
                            <li>Memperbarui atau memperbaiki data pribadi yang tidak akurat.</li>
                            <li>Meminta penghapusan data pribadi dengan menghubungi pengurus melalui kanal resmi organisasi.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-[#11281e] mb-3">7. Kontak</h2>
                        <p>
                            Jika Anda memiliki pertanyaan mengenai kebijakan privasi ini atau ingin menggunakan
                            hak-hak Anda terkait data pribadi, silakan hubungi pengurus PC IPNU IPPNU Kabupaten
                            Magetan melalui situs resmi{" "}
                            <a
                                href="https://pelajarnumagetan.or.id"
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#146949] font-semibold hover:underline"
                            >
                                pelajarnumagetan.or.id
                            </a>.
                        </p>
                    </section>
                </article>
            </main>

            <footer className="border-t border-[#dde7e2] py-6">
                <p className="text-center text-xs text-[#566e63]">
                    © {new Date().getFullYear()} PC IPNU IPPNU Kabupaten Magetan
                </p>
            </footer>
        </div>
    );
}
