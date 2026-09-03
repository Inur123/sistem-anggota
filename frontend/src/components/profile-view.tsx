import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import type { LucideIcon } from "lucide-react";
import {
  AwardIcon,
  BadgeCheckIcon,
  Building2Icon,
  CalendarDaysIcon,
  CheckIcon,
  CircleDashedIcon,
  CircleXIcon,
  Clock3Icon,
  GraduationCapIcon,
  MapPinIcon,
  PencilLineIcon,
  ShieldCheckIcon,
  UserRoundIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Education, Organizations, Profile, SessionUser, Training } from "@/types/member";

const statusContent = {
  DRAFT: {
    label: "Belum dikirim",
    detail: "Lengkapi profil untuk memulai verifikasi.",
    icon: CircleDashedIcon,
    panelClass: "bg-muted text-foreground",
    iconClass: "bg-white text-muted-foreground",
  },
  PENDING: {
    label: "Sedang diverifikasi",
    detail: "Pengurus sedang memeriksa data yang kamu kirim.",
    icon: Clock3Icon,
    panelClass: "bg-amber-100 text-amber-950",
    iconClass: "bg-white/70 text-amber-700",
  },
  DITERIMA: {
    label: "Anggota terverifikasi",
    detail: "Data keanggotaanmu telah diterima pengurus.",
    icon: BadgeCheckIcon,
    panelClass: "bg-primary text-primary-foreground",
    iconClass: "bg-white/12 text-accent",
  },
  DITOLAK: {
    label: "Perlu diperbaiki",
    detail: "Periksa kembali profil lalu kirim pembaruan.",
    icon: CircleXIcon,
    panelClass: "bg-red-100 text-red-950",
    iconClass: "bg-white/70 text-red-700",
  },
} as const;

function parseArray<T>(value: string): T[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function formatDate(value: string) {
  if (!value) return "—";
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? value : format(parsed, "dd MMMM yyyy", { locale: id });
}

export function ProfileView({
  user,
  profile,
  organizations,
}: {
  user: SessionUser;
  profile: Profile;
  organizations: Organizations | null;
}) {
  const educations = parseArray<Education>(profile.educationHistory);
  const trainings = parseArray<Training>(profile.trainingHistory);
  const role = profile.organization?.role;
  const organization = !organizations || !profile.organization
    ? null
    : role === "CABANG"
      ? organizations.cabang
      : organizations.pac.find((item) => item.id === profile.organization?.targetId);
  const area = organization?.wilayah?.find((item) => item.id === profile.organization?.wilayahId);
  const organizationName = organization?.name || profile.organization?.targetName || "Belum diatur";
  const areaName = area?.nama || profile.organization?.wilayahName || "Tingkat Cabang";
  const activePeriod = area?.periodeAktif?.nama || organization?.periodeAktif?.nama || "Belum tersedia";
  const status = statusContent[profile.status];
  const StatusIcon = status.icon;
  const initials = (profile.fullName || user.name || "Anggota")
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-5 pb-8 sm:space-y-6">
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="soft-surface gap-0 overflow-hidden rounded-[1.65rem] border border-border/75 bg-white py-0 ring-0">
          <CardContent className="p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                <Avatar className="size-15 shrink-0 rounded-2xl sm:size-18">
                  {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
                  <AvatarFallback className="rounded-2xl bg-secondary font-display text-lg font-extrabold text-primary sm:text-xl">{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-utility text-[9px] font-bold uppercase tracking-[0.2em] text-primary/65">Profil anggota</p>
                  <h1 className="mt-2 truncate font-display text-2xl font-[760] tracking-[-0.045em] sm:text-4xl">{profile.fullName || user.name}</h1>
                  <p className="mt-1 truncate text-xs font-semibold text-muted-foreground sm:text-sm">{user.email}</p>
                </div>
              </div>
              {profile.status !== "PENDING" ? (
                <Link
                  href="/profile/edit"
                  className={buttonVariants({
                    variant: "outline",
                    className: "h-10 w-full rounded-xl px-4 font-bold sm:w-auto",
                  })}
                >
                  <PencilLineIcon /> Perbarui profil
                </Link>
              ) : (
                <span className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-muted px-4 text-xs font-bold text-muted-foreground">
                  <ShieldCheckIcon className="size-4 text-primary" /> Profil dikunci
                </span>
              )}
            </div>

            <dl className="mt-7 grid divide-y divide-border/70 rounded-2xl bg-muted/65 px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-0">
              <OverviewItem icon={Building2Icon} label="Asal pimpinan" value={organizationName} />
              <OverviewItem icon={MapPinIcon} label="Wilayah anggota" value={role === "CABANG" ? "Tingkat Cabang" : areaName} />
              <OverviewItem icon={CalendarDaysIcon} label="Periode aktif" value={activePeriod} />
            </dl>
          </CardContent>
        </Card>

        <Card className={cn("gap-0 rounded-[1.65rem] py-0 ring-0", status.panelClass)}>
          <CardContent className="flex h-full min-h-64 flex-col p-6">
            <div className="flex items-start justify-between gap-5">
              <span className={cn("grid size-11 place-items-center rounded-2xl", status.iconClass)}><StatusIcon className="size-5" /></span>
              <span className="font-utility text-[9px] font-bold uppercase tracking-[0.18em] opacity-55">Status pengajuan</span>
            </div>
            <h2 className="text-balance mt-8 font-display text-2xl font-[760] leading-tight tracking-[-0.04em]">{status.label}</h2>
            <p className="text-pretty mt-2 text-xs leading-5 opacity-70">{status.detail}</p>
            <VerificationProgress status={profile.status} />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)]">
        <Card className="soft-surface gap-0 rounded-[1.65rem] border border-border/75 bg-white py-0 ring-0">
          <CardHeader className="border-b border-border/70 p-5 sm:px-7 sm:py-6">
            <CardTitle className="font-display text-base font-extrabold tracking-[-0.02em] sm:text-lg">Data anggota</CardTitle>
            <p className="text-xs leading-5 text-muted-foreground">Identitas utama dan informasi pendukung yang tersimpan.</p>
          </CardHeader>
          <CardContent className="p-5 sm:p-7">
            <InfoSection icon={UserRoundIcon} title="Identitas pribadi">
              <InfoItem label="NIK" value={profile.hasNik ? profile.nik : "Belum diisi"} />
              <InfoItem label="Tempat, tanggal lahir" value={`${profile.birthPlace || "—"}, ${formatDate(profile.birthDate)}`} />
              <InfoItem label="Jenis kelamin" value={profile.gender === "L" ? "Laki-laki" : profile.gender === "P" ? "Perempuan" : "—"} />
              <InfoItem label="Nomor HP" value={profile.phone} />
              <InfoItem label="Email" value={user.email} wide />
              <InfoItem label="Alamat" value={profile.address} wide />
            </InfoSection>

            <div className="my-7 h-px bg-border/70" />

            <InfoSection icon={ShieldCheckIcon} title="Keanggotaan">
              <InfoItem label="NIA" value={profile.hasNia ? profile.nia : "Belum tersedia"} />
              <InfoItem label="Jabatan" value={profile.position} />
              <InfoItem label="Pekerjaan" value={profile.occupation} />
              <InfoItem label="Hobi / minat bakat" value={profile.hobby} />
            </InfoSection>
          </CardContent>
        </Card>

        <Card className="soft-surface gap-0 rounded-[1.65rem] border border-border/75 bg-white py-0 ring-0">
          <CardHeader className="border-b border-border/70 p-5 sm:px-7 sm:py-6">
            <CardTitle className="font-display text-base font-extrabold tracking-[-0.02em] sm:text-lg">Jejak belajar kader</CardTitle>
            <p className="text-xs leading-5 text-muted-foreground">Pendidikan formal dan pengkaderan yang pernah diikuti.</p>
          </CardHeader>
          <CardContent className="space-y-7 p-5 sm:p-7">
            <HistoryGroup icon={GraduationCapIcon} title="Pendidikan">
              {educations.length ? educations.map((education, index) => (
                <HistoryItem key={`${education.level}-${education.institution}-${index}`} title={education.level} detail={education.institution} />
              )) : <EmptyHistory text="Belum ada riwayat pendidikan." />}
            </HistoryGroup>

            <div className="h-px bg-border/70" />

            <HistoryGroup icon={AwardIcon} title="Pengkaderan">
              {trainings.length ? trainings.map((training, index) => (
                <HistoryItem
                  key={`${training.name}-${training.date}-${index}`}
                  title={training.name}
                  detail={`${formatDate(training.date)} · ${training.place || "Lokasi belum dicatat"}`}
                />
              )) : <EmptyHistory text="Belum ada riwayat pengkaderan." />}
            </HistoryGroup>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function OverviewItem({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3 py-4 sm:px-4 sm:first:pl-4">
      <Icon className="size-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <dt className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</dt>
        <dd className="mt-1 truncate text-xs font-extrabold" title={value}>{value}</dd>
      </div>
    </div>
  );
}

function VerificationProgress({ status }: { status: Profile["status"] }) {
  const reviewed = status === "DITERIMA" || status === "DITOLAK";
  return (
    <ol className="mt-auto grid grid-cols-3 gap-2 pt-8" aria-label="Proses verifikasi">
      {["Dikirim", "Diperiksa", "Selesai"].map((label, index) => {
        const complete = index < 2 || reviewed;
        return (
          <li key={label} className="min-w-0">
            <span className={cn("grid size-5 place-items-center rounded-full border text-current", complete ? "border-current/20 bg-current/10" : "border-current/20 opacity-40")}>
              {complete ? <CheckIcon className="size-3" /> : <span className="size-1 rounded-full bg-current" />}
            </span>
            <span className="mt-2 block truncate text-[9px] font-bold uppercase tracking-[0.08em] opacity-60">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function InfoSection({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-primary"><Icon className="size-4" />{title}</h3>
      <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

function InfoItem({ label, value, wide }: { label: string; value?: string; wide?: boolean }) {
  return (
    <div className={cn("min-w-0 border-l-2 border-secondary pl-3", wide && "sm:col-span-2")}>
      <dt className="text-[10px] font-semibold text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-sm font-bold leading-5">{value || "—"}</dd>
    </div>
  );
}

function HistoryGroup({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-primary"><Icon className="size-4" />{title}</h3>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function HistoryItem({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="relative pl-5 before:absolute before:left-0 before:top-2 before:size-2 before:rounded-full before:bg-accent before:ring-4 before:ring-secondary">
      <p className="text-sm font-extrabold">{title}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
    </div>
  );
}

function EmptyHistory({ text }: { text: string }) {
  return <p className="rounded-xl border border-dashed border-border px-4 py-5 text-center text-xs text-muted-foreground">{text}</p>;
}
