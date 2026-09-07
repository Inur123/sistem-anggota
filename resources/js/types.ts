export type Status = "DRAFT" | "PENDING" | "DITERIMA" | "DITOLAK";
export type Identity = {
    id: string;
    name: string;
    email: string;
    phone: string;
    gender: string;
    avatar_url?: string | null;
};
export type User = Identity;
export type Education = { level: string; institution: string };
export type Training = { name: string; date: string; place: string };
export type Organization = {
    target_role: "CABANG" | "PAC";
    target_id: string;
    target_name: string;
    wilayah_id: string | null;
    wilayah_name: string | null;
    wilayah_type: string | null;
};
export type Profile = {
    id: string;
    status: Status;
    version: number;
    organization: Organization | null;
    nik: string;
    nia: string;
    rfid: string;
    phone: string;
    birth_place: string;
    birth_date: string;
    address: string;
    hobby: string;
    occupation: string;
    position: string;
    educations: Education[];
    trainings: Training[];
};
export type Period = {
    id: string;
    period_name: string;
    organization_name: string;
    wilayah_name: string | null;
    verification_status: Status;
    rejection_reason: string | null;
    is_current: boolean;
    submitted_at: string | null;
    verified_at: string | null;
};
export type Unit = {
    id: string;
    name: string;
    periodeAktif: { id: string; nama: string } | null;
    wilayah: { id: string; nama: string; jenis: string }[];
};
export type Organizations = { cabang: Unit | null; pac: Unit[] };
export type SharedProps = {
    auth: { user: Identity | null };
    flash: { success?: string; error?: string };
    [key: string]: unknown;
};
export const statusLabels: Record<Status, string> = {
    DRAFT: "Draf profil",
    PENDING: "Menunggu verifikasi",
    DITERIMA: "Terverifikasi",
    DITOLAK: "Perlu perbaikan",
};
export function dateLabel(date: string | null) {
    return date
        ? new Intl.DateTimeFormat("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
          }).format(new Date(date))
        : "—";
}
