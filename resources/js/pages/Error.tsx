import { Head } from "@inertiajs/react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Brand } from "../components/ui";
import { Button } from "../components/ui/button";

export default function ErrorPage({ status }: { status: number }) {
    const messages: Record<number, [string, string]> = {
        403: [
            "Halaman ini tidak dapat diakses.",
            "Masuk dengan akun anggota yang sesuai untuk melanjutkan.",
        ],
        404: [
            "Halaman belum ditemukan.",
            "Periksa alamat halaman atau kembali ke beranda.",
        ],
        419: [
            "Sesi kamu sudah berakhir.",
            "Masuk kembali untuk melanjutkan. Data yang sudah disimpan tetap tersedia.",
        ],
        429: [
            "Tunggu sebentar, ya.",
            "Terlalu banyak permintaan dalam waktu singkat. Coba kembali satu menit lagi.",
        ],
        500: [
            "Ada kendala pada layanan.",
            "Halaman belum dapat dimuat. Coba kembali beberapa saat lagi.",
        ],
        503: [
            "Layanan sedang tidak tersedia.",
            "Coba muat ulang beberapa saat lagi.",
        ],
    };
    const [title, description] = messages[status] ?? messages[500];
    return (
        <div className="error-page">
            <Head title={title} />
            <Brand />
            <main>
                <span className="error-code">{status}</span>
                <h1>{title}</h1>
                <p>{description}</p>
                <div className="button-row">
                    <Button asChild variant="outline" className="border-[#dde7e2] text-[#11281e] hover:bg-[#f8faf9] hover:border-[#b8cec4]">
                        <a href="/">
                            <ArrowLeft size={17} />
                            Ke beranda
                        </a>
                    </Button>
                    {status !== 419 && (
                        <Button
                            onClick={() => window.location.reload()}
                            className="bg-[#146949] hover:bg-[#0e4832] text-white"
                        >
                            <RefreshCw size={17} />
                            Muat ulang
                        </Button>
                    )}
                    {status === 419 && (
                        <Button asChild className="bg-[#146949] hover:bg-[#0e4832] text-white">
                            <a href="/auth/login">
                                Masuk kembali
                            </a>
                        </Button>
                    )}
                </div>
            </main>
        </div>
    );
}
