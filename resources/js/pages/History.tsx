import { Head, Link } from "@inertiajs/react";
import { ArrowRight, CalendarDays, History as HistoryIcon } from "lucide-react";
import MemberLayout from "../components/dashboard/MemberLayout";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { StatusBadge } from "../components/ui";
import { dateLabel, type Period } from "../types";

export default function History({ periods }: { periods: Period[] }) {
    return (
        <MemberLayout
            title="Perjalanan keanggotaan."
            subtitle="Periode boleh berganti. Riwayatmu tetap tersimpan."
        >
            <Head title="Riwayat keanggotaan" />

            <Card className="bg-white border-[#dde7e2] p-6 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between pb-5 border-b border-[#dde7e2] mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-[#11281e]">Riwayat periode</h2>
                        <p className="text-xs text-[#566e63] mt-0.5">
                            Pendaftaran dan hasil verifikasi di setiap periode.
                        </p>
                    </div>
                    <CalendarDays size={21} className="text-[#566e63]" />
                </div>

                {periods.length ? (
                    <div className="flex flex-col gap-4">
                        {periods.map((period) => (
                            <article
                                key={period.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-[#dde7e2] transition-all hover:border-[#b8cec4]"
                            >
                                <div className="flex items-start gap-3.5">
                                    <div className="size-10 rounded-xl bg-white border border-[#dde7e2] flex items-center justify-center text-[#146949] shadow-xs shrink-0 mt-0.5">
                                        <CalendarDays size={20} />
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-sm font-bold text-[#11281e]">
                                                {period.period_name || "Periode keanggotaan"}
                                            </h3>
                                            {period.is_current && (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-[0.68rem] font-bold"
                                                >
                                                    Periode saat ini
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-[#566e63] font-medium mt-1">
                                            {period.organization_name?.toLowerCase().includes("sekretaris cabang")
                                                ? "Pimpinan Cabang"
                                                : period.organization_name}
                                            {period.wilayah_name && ` · ${period.wilayah_name}`}
                                        </p>
                                        <small className="block text-[0.68rem] text-[#566e63] mt-1">
                                            Diajukan {dateLabel(period.submitted_at)}
                                            {period.verified_at &&
                                                ` · Diverifikasi ${dateLabel(period.verified_at)}`}
                                        </small>
                                        {period.rejection_reason && (
                                            <p className="text-xs text-red-700 bg-red-50 border border-red-200/80 rounded-lg p-2.5 mt-2 font-medium">
                                                Catatan pengurus: {period.rejection_reason}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="self-start sm:self-center shrink-0">
                                    <StatusBadge status={period.verification_status} />
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                        <div className="size-14 rounded-2xl bg-[#eaf5f0] text-[#146949] flex items-center justify-center mb-4">
                            <HistoryIcon size={28} />
                        </div>
                        <h3 className="text-base font-bold text-[#11281e] mb-1">
                            Perjalananmu dimulai di sini.
                        </h3>
                        <p className="text-xs text-[#566e63] max-w-sm mb-5">
                            Riwayat periode akan muncul setelah profil dikirim ke pengurus.
                        </p>
                        <Link href="/profile">
                            <Button
                                size="sm"
                                className="bg-[#146949] hover:bg-[#0e4832] text-white font-semibold gap-2 shadow-xs cursor-pointer"
                            >
                                <span>Lengkapi profil</span>
                                <ArrowRight size={15} />
                            </Button>
                        </Link>
                    </div>
                )}
            </Card>
        </MemberLayout>
    );
}
