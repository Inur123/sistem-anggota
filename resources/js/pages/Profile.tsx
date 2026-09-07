import { Head, Link, router, usePage, usePoll } from "@inertiajs/react";
import {
    ArrowRight,
    BadgeCheck,
    Clock3,
    FilePenLine,
    History,
    LockKeyhole,
    MapPin,
    RefreshCw,
    ShieldCheck,
} from "lucide-react";
import MemberLayout from "../components/dashboard/MemberLayout";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Alert } from "../components/ui/alert";
import { Avatar } from "../components/ui/avatar";
import { DataRow, Notice, StatusBadge } from "../components/ui";
import {
    dateLabel,
    type Period,
    type Profile as MemberProfile,
    type SharedProps,
} from "../types";

export default function Profile({
    profile,
    periods,
}: {
    profile: MemberProfile;
    periods: Period[];
}) {
    const { auth } = usePage<SharedProps>().props;
    const user = auth.user!;
    const current = periods.find((p) => p.is_current);

    usePoll(
        15000,
        { only: ["profile", "periods"] },
        { autoStart: profile.status === "PENDING" }
    );

    return (
        <MemberLayout
            title={`Halo, ${user.name.split(" ")[0] || "Rekan"}.`}
            subtitle="Profil dan perjalanan keanggotaanmu, dalam satu tempat."
            action={
                profile.status !== "PENDING" ? (
                    <Link href="/profile/edit">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 font-semibold border-[#dde7e2] text-[#11281e] hover:bg-[#f8faf9] hover:border-[#b8cec4] cursor-pointer shadow-xs"
                        >
                            <FilePenLine size={16} />
                            <span>Perbarui profil</span>
                        </Button>
                    </Link>
                ) : undefined
            }
        >
            <Head title="Profil saya" />

            {/* Member Identity Banner */}
            <Card className="bg-white border-[#dde7e2] rounded-2xl p-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-xs">
                <div className="flex items-center gap-4">
                    <Avatar
                        src={user.avatar_url}
                        alt={user.name}
                        fallback={user.name}
                        className="size-16 rounded-2xl text-2xl shadow-xs"
                    />
                    <div>
                        <span className="text-[0.68rem] font-extrabold uppercase tracking-widest text-[#146949] block mb-1">
                            {user.gender === "P"
                                ? "IKATAN PELAJAR PUTRI NAHDLATUL ULAMA"
                                : "IKATAN PELAJAR NAHDLATUL ULAMA"}
                        </span>
                        <h2 className="text-xl sm:text-2xl font-bold text-[#11281e]">
                            {user.name}
                        </h2>
                        <p className="text-sm text-[#566e63] mt-0.5">{user.email}</p>
                    </div>
                </div>
                <div className="self-start sm:self-center">
                    <StatusBadge status={profile.status} />
                </div>
            </Card>

            {/* Verification Status Panel */}
            <Alert
                variant={
                    profile.status === "DITERIMA"
                        ? "success"
                        : profile.status === "DITOLAK"
                          ? "destructive"
                          : "warning"
                }
                className="p-5 rounded-2xl mb-6 shadow-xs flex flex-col sm:flex-row items-start justify-between gap-4 [&>svg]:static [&>svg~*]:pl-0"
            >
                <div className="flex items-start gap-4">
                    <span className="p-2.5 rounded-xl bg-white/80 shrink-0 shadow-xs mt-0.5">
                        {profile.status === "DITERIMA" ? (
                            <BadgeCheck size={24} className="text-[#146949]" />
                        ) : (
                            <Clock3 size={24} className={profile.status === "DITOLAK" ? "text-red-600" : "text-amber-700"} />
                        )}
                    </span>
                    <div>
                        <h3 className="font-bold text-base sm:text-lg mb-1">
                            {profile.status === "DITERIMA"
                                ? "Kamu sudah terverifikasi."
                                : profile.status === "DITOLAK"
                                  ? "Ada data yang perlu diperbaiki."
                                  : "Profilmu sedang diperiksa pengurus."}
                        </h3>
                        <p className="text-sm leading-relaxed opacity-90 max-w-2xl">
                            {profile.status === "DITERIMA"
                                ? "Data keanggotaanmu telah diterima oleh pimpinan tujuan."
                                : profile.status === "DITOLAK"
                                  ? current?.rejection_reason ||
                                    "Periksa kembali kelengkapan data sebelum mengirim ulang."
                                  : "Pengajuan berhasil dikirim ke Laci. Status akan diperbarui otomatis setelah verifikasi."}
                        </p>
                        {current?.submitted_at && (
                            <small className="block text-xs mt-2 opacity-75">
                                Dikirim pada {dateLabel(current.submitted_at)}
                            </small>
                        )}
                    </div>
                </div>

                {profile.status === "PENDING" && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 border-amber-300 text-amber-900 bg-white/60 hover:bg-white cursor-pointer shrink-0 self-start sm:self-center"
                        onClick={() => router.reload({ only: ["profile", "periods"] })}
                    >
                        <RefreshCw size={15} />
                        <span>Cek status</span>
                    </Button>
                )}
            </Alert>

            {/* Profile Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {/* Personal Data Panel */}
                    <Card className="bg-white border-[#dde7e2] p-6 rounded-2xl shadow-xs">
                        <div className="flex items-center justify-between pb-5 border-b border-[#dde7e2] mb-5">
                            <div>
                                <h2 className="text-lg font-bold text-[#11281e]">Data pribadi</h2>
                                <p className="text-xs text-[#566e63] mt-0.5">
                                    Identitas dan informasi pendukung anggota.
                                </p>
                            </div>
                            <LockKeyhole size={18} className="text-[#566e63]" />
                        </div>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <DataRow label="Nama lengkap" value={user.name} />
                            <DataRow
                                label="Jenis kelamin"
                                value={user.gender === "L" ? "Laki-laki" : "Perempuan"}
                            />
                            <DataRow label="Email" value={user.email} />
                            <DataRow label="Nomor HP / WhatsApp" value={user.phone} />
                            <DataRow
                                label="NIK"
                                value={profile.nik ? "•••• •••• •••• ••••" : ""}
                                secure
                            />
                            <DataRow label="NIA" value={profile.nia} secure />
                            <DataRow label="Tempat lahir" value={profile.birth_place} />
                            <DataRow label="Tanggal lahir" value={dateLabel(profile.birth_date)} />
                            <div className="sm:col-span-2">
                                <DataRow label="Alamat lengkap" value={profile.address} />
                            </div>
                            <DataRow label="Pekerjaan" value={profile.occupation} />
                            <DataRow label="Jabatan" value={profile.position} />
                            <DataRow label="Hobi dan minat" value={profile.hobby} />
                            <DataRow label="RFID" value={profile.rfid} secure />
                        </dl>
                    </Card>

                    {/* Education & Training Panel */}
                    <Card className="bg-white border-[#dde7e2] p-6 rounded-2xl shadow-xs">
                        <div className="pb-5 border-b border-[#dde7e2] mb-5">
                            <h2 className="text-lg font-bold text-[#11281e]">Pendidikan & pengkaderan</h2>
                            <p className="text-xs text-[#566e63] mt-0.5">Bekal dan pengalaman dalam perjalananmu.</p>
                        </div>

                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#566e63] mb-3">
                            Pendidikan
                        </h3>
                        {profile.educations.length ? (
                            <div className="flex flex-col gap-2.5 mb-6">
                                {profile.educations.map((e, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#dde7e2]"
                                    >
                                        <span className="size-8 rounded-lg bg-[#eaf5f0] text-[#146949] font-bold text-xs flex items-center justify-center shrink-0">
                                            {e.level}
                                        </span>
                                        <div>
                                            <strong className="block text-sm text-[#11281e]">
                                                {e.institution}
                                            </strong>
                                            <small className="text-xs text-[#566e63]">{e.level}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-[#566e63] italic mb-6">
                                Belum ada riwayat pendidikan yang ditambahkan.
                            </p>
                        )}

                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#566e63] mb-3">
                            Pengkaderan
                        </h3>
                        {profile.trainings.length ? (
                            <div className="flex flex-col gap-2.5">
                                {profile.trainings.map((t, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#dde7e2]"
                                    >
                                        <ShieldCheck size={20} className="text-[#146949] shrink-0" />
                                        <div>
                                            <strong className="block text-sm text-[#11281e]">
                                                {t.name}
                                            </strong>
                                            <small className="text-xs text-[#566e63]">
                                                {t.place} · {dateLabel(t.date)}
                                            </small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-[#566e63] italic">
                                Belum ada riwayat pengkaderan yang ditambahkan.
                            </p>
                        )}
                    </Card>
                </div>

                {/* Aside Column */}
                <aside className="lg:col-span-4 flex flex-col gap-6">
                    {/* Organization Panel */}
                    <Card className="bg-white border-[#dde7e2] p-6 rounded-2xl shadow-xs">
                        <div className="size-11 rounded-xl bg-[#eaf5f0] border border-[#146949]/20 flex items-center justify-center text-[#146949] mb-4">
                            <MapPin size={22} />
                        </div>
                        <p className="text-xs font-extrabold uppercase tracking-widest text-[#146949] mb-1">
                            ASAL PIMPINAN
                        </p>
                        <h2 className="text-xl font-bold text-[#11281e] mb-1">
                            {profile.organization?.target_role === "CABANG" ||
                            profile.organization?.target_name?.toLowerCase().includes("sekretaris cabang")
                                ? "Pimpinan Cabang"
                                : profile.organization?.target_name || "Belum dipilih"}
                        </h2>
                        {profile.organization?.wilayah_name && (
                            <p className="text-xs text-[#566e63] mb-4">
                                {profile.organization.wilayah_name}
                            </p>
                        )}
                        <dl className="flex flex-col gap-2 pt-4 border-t border-[#dde7e2] text-sm">
                            <DataRow
                                label="Tingkatan"
                                value={
                                    profile.organization?.target_role === "CABANG"
                                        ? "Pimpinan Cabang"
                                        : "Pimpinan Anak Cabang"
                                }
                            />
                            <DataRow
                                label="Periode"
                                value={current?.period_name || "Belum tersedia"}
                            />
                            <DataRow
                                label="Tgl verifikasi"
                                value={dateLabel(current?.verified_at ?? null)}
                            />
                        </dl>
                    </Card>

                    {/* History Callout */}
                    <div className="bg-gradient-to-br from-[#146949] to-[#0e4832] text-white p-6 rounded-2xl shadow-md flex flex-col items-start gap-3">
                        <History size={26} className="text-emerald-200" />
                        <div>
                            <h3 className="text-base font-bold mb-1">
                                Setiap periode tetap tercatat.
                            </h3>
                            <p className="text-xs text-emerald-100/80 leading-relaxed">
                                Lihat kembali perjalanan dan pengajuan keanggotaanmu kapan saja.
                            </p>
                        </div>
                        <Link href="/riwayat">
                            <Button
                                size="sm"
                                variant="outline"
                                className="bg-white/10 hover:bg-white hover:text-[#0e4832] text-white border-white/20 gap-2 font-semibold text-xs mt-2 cursor-pointer transition-colors"
                            >
                                <span>Buka riwayat</span>
                                <ArrowRight size={14} />
                            </Button>
                        </Link>
                    </div>

                    {profile.status === "PENDING" && (
                        <Notice type="info">
                            Data sementara dikunci selama proses verifikasi oleh pengurus.
                        </Notice>
                    )}
                </aside>
            </div>
        </MemberLayout>
    );
}
