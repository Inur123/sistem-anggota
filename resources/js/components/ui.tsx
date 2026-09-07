import { Link, usePage } from "@inertiajs/react";
import { Check, CircleAlert, Clock, LockKeyhole, WifiOff, XCircle } from "lucide-react";
import { useEffect, useId, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { statusLabels, type SharedProps, type Status } from "../types";
import { Alert } from "./ui/alert";
import { Badge } from "./ui/badge";

export { toast };

export function Brand({ compact = false }: { compact?: boolean }) {
    return (
        <Link href="/" className="inline-flex items-center gap-3 text-slate-900 transition-opacity hover:opacity-90" aria-label="Sistem Anggota — beranda">
            <span className="inline-flex items-center shrink-0">
                <img
                    src="/images/logo-sistem-anggota.png"
                    alt="Logo Sistem Anggota"
                    width={48}
                    height={48}
                    className="h-[46px] sm:h-[48px] w-auto object-contain transition-transform hover:-translate-y-px"
                />
            </span>
            {!compact && (
                <span className="flex flex-col">
                    <strong className="font-display text-[1.1rem] font-extrabold tracking-tight leading-[1.1] text-emerald-900">
                        Sistem Anggota<span className="text-amber-600 ml-px">.</span>
                    </strong>
                    <small className="text-[0.625rem] font-bold tracking-widest text-slate-500 uppercase mt-px">IPNU IPPNU MAGETAN</small>
                </span>
            )}
        </Link>
    );
}

export function StatusBadge({ status }: { status: Status }) {
    const isAccepted = status === "DITERIMA";
    const isRejected = status === "DITOLAK";

    let variant: "success" | "destructive" | "warning" | "secondary" = "secondary";
    if (isAccepted) variant = "success";
    else if (isRejected) variant = "destructive";
    else if (status === "PENDING") variant = "warning";

    return (
        <Badge
            variant={variant}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold tracking-wide"
        >
            {isAccepted && <Check size={13} className="shrink-0" />}
            {isRejected && <XCircle size={13} className="shrink-0" />}
            {!isAccepted && !isRejected && <Clock size={13} className="shrink-0" />}
            <span>{statusLabels[status]}</span>
        </Badge>
    );
}

export function Notice({
    children,
    type = "info",
}: {
    children: ReactNode;
    type?: "error" | "success" | "info";
}) {
    const Icon = type === "success" ? Check : CircleAlert;
    const variant = type === "success" ? "success" : type === "error" ? "destructive" : "info";

    return (
        <Alert
            variant={variant}
            className="mb-5 flex items-start gap-3.5 p-4 [&>svg]:static [&>svg~*]:pl-0"
        >
            <span className="shrink-0 mt-0.5">
                <Icon size={16} />
            </span>
            <div className="grow">{children}</div>
        </Alert>
    );
}

export function Flash() {
    const { flash } = usePage<SharedProps>().props;

    useEffect(() => {
        if (flash.error) {
            toast.error(flash.error);
        }
        if (flash.success) {
            toast.success(flash.success);
        }
    }, [flash.error, flash.success]);
    return null;
}

export function OfflineNotice() {
    const [offline, setOffline] = useState(!navigator.onLine);
    useEffect(() => {
        const update = () => setOffline(!navigator.onLine);
        window.addEventListener("online", update);
        window.addEventListener("offline", update);
        return () => {
            window.removeEventListener("online", update);
            window.removeEventListener("offline", update);
        };
    }, []);
    return offline ? (
        <div className="bg-amber-700 text-white flex items-center justify-center gap-2 py-2 px-4 text-sm font-semibold" role="alert">
            <WifiOff size={16} />
            <span>Koneksi internet terputus. Pastikan terhubung kembali sebelum melanjutkan.</span>
        </div>
    ) : null;
}

export function Field({
    label,
    hint,
    error,
    required,
    children,
}: {
    label: string;
    hint?: string;
    error?: string;
    required?: boolean;
    children: (props: {
        id: string;
        "aria-invalid": boolean;
        "aria-describedby"?: string;
        className: string;
    }) => ReactNode;
}) {
    const id = useId();
    return (
        <div className="flex flex-col gap-1.5 mb-5">
            <label htmlFor={id} className="text-sm font-semibold text-slate-900">
                {label}
                {required && <span className="text-red-600"> *</span>}
            </label>
            {children({
                id,
                "aria-invalid": Boolean(error),
                "aria-describedby": error || hint ? `${id}-help` : undefined,
                className: "px-3.5 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 text-sm transition-all focus:outline-none focus:border-emerald-600 focus:ring-3 focus:ring-emerald-600/10",
            })}
            {(error || hint) && (
                <small
                    id={`${id}-help`}
                    className={error ? "text-red-600 text-xs font-medium" : "text-slate-500 text-xs"}
                >
                    {error ?? hint}
                </small>
            )}
        </div>
    );
}

export function DataRow({
    label,
    value,
    secure,
}: {
    label: string;
    value: ReactNode;
    secure?: boolean;
}) {
    return (
        <div className="flex items-start justify-between text-sm pb-3 border-b border-dashed border-slate-200 last:border-0 last:pb-0">
            <dt className="flex items-center gap-1.5 text-slate-500 font-medium">
                <span>{label}</span>
                {secure && (
                    <LockKeyhole size={12} aria-label="Data terlindungi" className="text-slate-400" />
                )}
            </dt>
            <dd className="m-0 font-semibold text-slate-900 text-right">{value || <span className="italic font-normal text-slate-400">Belum diisi</span>}</dd>
        </div>
    );
}
