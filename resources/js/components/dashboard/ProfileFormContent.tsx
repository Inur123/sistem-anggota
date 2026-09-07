import { Head, router, useForm, usePage } from "@inertiajs/react";
import {
    ArrowLeft,
    ArrowRight,
    BadgeCheck,
    Check,
    ChevronRight,
    ClipboardCheck,
    GraduationCap,
    LoaderCircle,
    LockKeyhole,
    MapPin,
    Plus,
    RefreshCw,
    Save,
    Send,
    ShieldCheck,
    Trash2,
    UserRound,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import MemberLayout from "./MemberLayout";
import { Button } from "../ui/button";
import { Avatar } from "../ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { DatePicker } from "../ui/date-picker";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { DataRow, Notice } from "../ui";
import { cn } from "../../lib/utils";
import {
    dateLabel,
    type Education,
    type Organizations,
    type Profile,
    type SharedProps,
    type Training,
} from "../../types";

type FormData = {
    version: number;
    target_role: string;
    target_id: string;
    wilayah_id: string;
    nik: string;
    nia: string;
    birth_place: string;
    birth_date: string;
    address: string;
    hobby: string;
    occupation: string;
    position: string;
    educations: Education[];
    trainings: Training[];
};

const steps = [
    {
        title: "Asal pimpinan",
        description: "Tentukan tujuan keanggotaan",
        icon: MapPin,
    },
    {
        title: "Biodata anggota",
        description: "Lengkapi cerita tentangmu",
        icon: UserRound,
    },
    {
        title: "Periksa & kirim",
        description: "Pastikan semuanya sesuai",
        icon: ClipboardCheck,
    },
];

const educationLevels = ["SD", "SMP", "SMA", "D3", "D4", "S1", "S2", "S3"];
const trainingNames = [
    "Makesta",
    "Lakmud",
    "Lakut",
    "Latin",
    "Latpel",
    "Diklatama",
    "Diklatmad",
];
const today = new Date().toLocaleDateString("en-CA");

export default function ProfileFormContent({
    profile,
    organizations,
    organizationError,
    retryRequired,
}: {
    profile: Profile;
    organizations: Organizations | null;
    organizationError: string | null;
    retryRequired: boolean;
}) {
    const { auth } = usePage<SharedProps>().props;
    const user = auth.user!;
    const [step, setStep] = useState(0);
    const [sending, setSending] = useState(false);
    const [reloading, setReloading] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const heading = useRef<HTMLHeadingElement>(null);
    const busyRef = useRef(false);
    const form = useForm<FormData>({
        version: profile.version,
        target_role: profile.organization?.target_role ?? "",
        target_id: profile.organization?.target_id ?? "",
        wilayah_id: profile.organization?.wilayah_id ?? "",
        nik: "",
        nia: "",
        birth_place: profile.birth_place,
        birth_date: profile.birth_date,
        address: profile.address,
        hobby: profile.hobby,
        occupation: profile.occupation,
        position: profile.position,
        educations: profile.educations,
        trainings: profile.trainings,
    });
    const errors = form.errors as Record<string, string>;
    const selectedUnit =
        form.data.target_role === "CABANG"
            ? organizations?.cabang
            : organizations?.pac.find(
                  (unit) => unit.id === form.data.target_id,
              );
    const selectedArea = selectedUnit?.wilayah.find(
        (area) => area.id === form.data.wilayah_id,
    );
    const busy = form.processing || sending;
    busyRef.current = busy;
    const missingIdentity =
        !user.name || !user.phone || !["L", "P"].includes(user.gender);

    useEffect(() => {
        if (!form.isDirty) return;
        const preventUnload = (event: BeforeUnloadEvent) => {
            if (!busyRef.current) {
                event.preventDefault();
            }
        };
        window.addEventListener("beforeunload", preventUnload);
        const remove = router.on("before", (event) => {
            if (
                event.detail.visit.method === "get" &&
                !busyRef.current &&
                !window.confirm(
                    "Perubahan belum disimpan. Tinggalkan halaman ini?",
                )
            )
                event.preventDefault();
        });
        return () => {
            window.removeEventListener("beforeunload", preventUnload);
            remove();
        };
    }, [form.isDirty]);

    function goTo(next: number) {
        setStep(next);
        requestAnimationFrame(() => {
            heading.current?.focus();
            heading.current?.scrollIntoView({
                behavior: "instant",
                block: "start",
            });
        });
    }

    function validateStep(): boolean {
        form.clearErrors();
        const nextErrors: Record<string, string> = {};
        if (step === 0) {
            if (!form.data.target_role)
                nextErrors.target_role = "Pilih tingkatan pimpinan.";
            if (!selectedUnit) nextErrors.target_id = "Pilih pimpinan tujuan.";
            if (
                form.data.target_role === "PAC" &&
                selectedUnit?.wilayah.length &&
                !selectedArea
            )
                nextErrors.wilayah_id = "Pilih ranting atau komisariat.";
            if (selectedUnit && !selectedUnit.periodeAktif)
                nextErrors.target_id =
                    "Pimpinan ini belum memiliki periode aktif. Hubungi pengurus.";
        }
        if (step === 1) {
            if (
                !/^\d{16}$/.test(form.data.nik) &&
                !(profile.nik && !form.data.nik)
            ) {
                if (!form.data.nik) {
                    nextErrors.nik = "NIK wajib diisi 16 angka.";
                } else if (form.data.nik.length < 16) {
                    nextErrors.nik = `NIK baru ${form.data.nik.length} angka. Harus tepat 16 angka.`;
                } else {
                    nextErrors.nik = "NIK harus terdiri dari tepat 16 angka.";
                }
            }
            if (!form.data.birth_place.trim())
                nextErrors.birth_place = "Tempat lahir wajib diisi.";
            if (!form.data.birth_date || form.data.birth_date > today)
                nextErrors.birth_date = "Isi tanggal lahir yang valid.";
            if (!form.data.address.trim())
                nextErrors.address = "Alamat wajib diisi.";
            form.data.educations.forEach((education, i) => {
                if (!education.level)
                    nextErrors[`educations.${i}.level`] = "Pilih jenjang.";
                if (!education.institution.trim())
                    nextErrors[`educations.${i}.institution`] =
                        "Isi nama instansi.";
            });
            form.data.trainings.forEach((training, i) => {
                if (!training.name)
                    nextErrors[`trainings.${i}.name`] = "Pilih pengkaderan.";
                if (!training.date || training.date > today)
                    nextErrors[`trainings.${i}.date`] =
                        "Isi tanggal yang valid.";
                if (!training.place.trim())
                    nextErrors[`trainings.${i}.place`] = "Isi tempat kegiatan.";
            });
        }
        if (Object.keys(nextErrors).length) {
            form.setError(nextErrors);
            return false;
        }
        return true;
    }

    function errorStep(messages: Record<string, string>) {
        if (
            Object.keys(messages).some(
                (key) => key.startsWith("target") || key === "wilayah_id",
            )
        )
            goTo(0);
        else if (
            Object.keys(messages).some(
                (key) => !["profile", "version"].includes(key),
            )
        )
            goTo(1);
    }

    function submitSaved(version: number) {
        setSending(true);
        router.post(
            "/profile/submit",
            { version },
            {
                preserveScroll: true,
                onError: (messages) => {
                    form.setError(messages);
                    errorStep(messages);
                },
                onFinish: () => setSending(false),
            },
        );
    }

    function save(sendAfter = false) {
        if (busy) return;
        form.patch("/profile", {
            preserveScroll: true,
            onSuccess: (page) => {
                const saved = page.props.profile as Profile;
                const values = {
                    ...form.data,
                    version: saved.version,
                    nik: "",
                    nia: "",
                };
                form.setData(values);
                form.setDefaults(values);
                if (sendAfter) submitSaved(saved.version);
            },
            onError: errorStep,
        });
    }

    function next(event: FormEvent) {
        event.preventDefault();
        if (busy) return;
        if (step < 2) {
            if (validateStep()) goTo(step + 1);
        } else if (confirmed && !missingIdentity) {
            if (retryRequired) submitSaved(profile.version);
            else save(true);
        }
    }

    function updateEducation(index: number, value: Partial<Education>) {
        form.setData(
            "educations",
            form.data.educations.map((item, i) =>
                i === index ? { ...item, ...value } : item,
            ),
        );
    }

    function updateTraining(index: number, value: Partial<Training>) {
        form.setData(
            "trainings",
            form.data.trainings.map((item, i) =>
                i === index ? { ...item, ...value } : item,
            ),
        );
    }

    const organizationName =
        (form.data.target_role === "CABANG"
            ? "Pimpinan Cabang"
            : selectedUnit?.name) ??
        (profile.organization?.target_role === "CABANG"
            ? "Pimpinan Cabang"
            : profile.organization?.target_name) ??
        "Belum dipilih";

    return (
        <MemberLayout
            title={
                profile.status === "DRAFT"
                    ? "Mari lengkapi profilmu."
                    : "Perbarui profil anggota."
            }
            subtitle="Tiga langkah untuk terhubung dengan pimpinanmu."
            action={
                <div
                    className={cn(
                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-2xs transition-colors",
                        form.isDirty
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-[#eaf5f0] text-[#0e4832] border-[#146949]/20"
                    )}
                >
                    <span
                        className={cn(
                            "size-2 rounded-full",
                            form.isDirty ? "bg-amber-500 animate-pulse" : "bg-[#146949]"
                        )}
                    />
                    <span>
                        {form.isDirty
                            ? "Ada perubahan belum disimpan"
                            : "Draf tersimpan"}
                    </span>
                </div>
            }
        >
            <Head
                title={
                    profile.status === "DRAFT"
                        ? "Lengkapi profil"
                        : "Perbarui profil"
                }
            />

            {missingIdentity && (
                <Notice type="error">
                    Nama, jenis kelamin, dan nomor HP harus lengkap di IPNU
                    IPPNU ID. Perbarui akun SSO, lalu keluar dan masuk kembali
                    sebelum mengirim.
                </Notice>
            )}
            {retryRequired && (
                <Notice type="error">
                    Pengiriman sebelumnya belum dikonfirmasi Laci.{" "}
                    <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="h-auto p-0 font-bold underline cursor-pointer text-inherit hover:text-inherit inline-flex"
                        disabled={busy}
                        onClick={() => submitSaved(profile.version)}
                    >
                        {sending
                            ? "Mengirim ulang…"
                            : "Ulangi pengiriman data tersimpan"}
                    </Button>{" "}
                    untuk memastikan hasil sebelum mengubah profil.
                </Notice>
            )}
            {errors.profile && <Notice type="error">{errors.profile}</Notice>}
            {errors.version && (
                <Notice type="error">
                    {errors.version}{" "}
                    <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="h-auto p-0 font-bold underline cursor-pointer text-inherit hover:text-inherit inline-flex"
                        onClick={() => window.location.reload()}
                    >
                        Muat ulang
                    </Button>
                </Notice>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Stepper Navigation Sidebar */}
                <div className="lg:col-span-4 flex flex-col gap-5">
                    <Card className="bg-white border-[#dde7e2] p-5 rounded-2xl shadow-xs">
                        <p className="text-[0.68rem] font-extrabold uppercase tracking-widest text-[#566e63] px-2 mb-3">
                            LENGKAPI KEANGGOTAAN
                        </p>
                        <div className="flex flex-col gap-2">
                            {steps.map((item, index) => {
                                const isCurrent = step === index;
                                const isCompleted = step > index;
                                const isAccessible = index <= step && !busy;
                                return (
                                    <Button
                                        key={item.title}
                                        type="button"
                                        variant="ghost"
                                        disabled={!isAccessible}
                                        onClick={() => goTo(index)}
                                        className={cn(
                                            "h-auto w-full flex items-center justify-start gap-3.5 p-3 rounded-xl text-left transition-all cursor-pointer border",
                                            isCurrent
                                                ? "bg-[#eaf5f0] border-[#146949]/30 shadow-xs hover:bg-[#eaf5f0]"
                                                : isCompleted
                                                  ? "bg-white border-transparent hover:bg-[#f8faf9] text-[#11281e]"
                                                  : "bg-transparent border-transparent opacity-50 cursor-not-allowed text-[#566e63]"
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "size-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors",
                                                isCurrent
                                                    ? "bg-[#146949] text-white shadow-xs"
                                                    : isCompleted
                                                      ? "bg-[#0e4832] text-white"
                                                      : "bg-slate-100 text-[#566e63]"
                                            )}
                                        >
                                            {isCompleted ? (
                                                <Check size={16} />
                                            ) : (
                                                index + 1
                                            )}
                                        </span>
                                        <div className="min-w-0">
                                            <strong
                                                className={cn(
                                                    "block text-sm leading-tight truncate",
                                                    isCurrent
                                                        ? "text-[#0e4832] font-bold"
                                                        : "text-[#11281e]"
                                                )}
                                            >
                                                {item.title}
                                            </strong>
                                            <small className="block text-xs text-[#566e63] truncate mt-0.5 font-normal">
                                                {item.description}
                                            </small>
                                        </div>
                                    </Button>
                                );
                            })}
                        </div>
                    </Card>

                    <Card className="bg-white border-[#dde7e2] p-5 rounded-2xl shadow-xs">
                        <div className="flex items-start gap-3">
                            <div className="p-2.5 rounded-xl bg-[#eaf5f0] text-[#146949] shrink-0 shadow-2xs">
                                <LockKeyhole size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-[#11281e] mb-1">
                                    Datamu terlindungi.
                                </h3>
                                <p className="text-xs text-[#566e63] leading-relaxed">
                                    Data pribadi disimpan terenkripsi dan hanya
                                    diteruskan kepada pengurus pimpinan tujuan yang
                                    kamu pilih.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Form Workspace */}
                <div className="lg:col-span-8">
                    <form onSubmit={next} noValidate>
                        <Card className="bg-white border-[#dde7e2] rounded-2xl shadow-xs overflow-hidden">
                            <CardHeader className="p-6 sm:p-7 border-b border-[#dde7e2] bg-white">
                                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-[#146949] mb-1">
                                    <span>LANGKAH {step + 1} DARI 3</span>
                                </div>
                                <CardTitle
                                    ref={heading}
                                    tabIndex={-1}
                                    className="text-xl sm:text-2xl font-bold text-[#11281e]"
                                >
                                    {steps[step].title}
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm text-[#566e63] mt-1">
                                    {step === 0
                                        ? "Pilih pimpinan tempat kamu terdaftar atau akan bergabung."
                                        : step === 1
                                          ? "Isi data sesuai identitasmu. Tanda * berarti wajib diisi sebelum dikirim."
                                          : "Periksa data dan tujuan pengajuan sebelum diteruskan ke pengurus."}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="p-6 sm:p-7">
                                <fieldset
                                    disabled={busy || retryRequired}
                                    className="space-y-6"
                                >
                                    {/* STEP 0: ASAL PIMPINAN */}
                                    {step === 0 && (
                                        <>
                                            <RadioGroup
                                                value={form.data.target_role}
                                                onValueChange={(val) => {
                                                    if (val === "CABANG") {
                                                        form.setData({
                                                            ...form.data,
                                                            target_role: "CABANG",
                                                            target_id:
                                                                organizations?.cabang?.id ??
                                                                "",
                                                            wilayah_id: "",
                                                        });
                                                    } else if (val === "PAC") {
                                                        form.setData({
                                                            ...form.data,
                                                            target_role: "PAC",
                                                            target_id: "",
                                                            wilayah_id: "",
                                                        });
                                                    }
                                                }}
                                                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                                            >
                                                <label
                                                    htmlFor="role-cabang"
                                                    className={cn(
                                                        "flex items-start gap-4 p-5 rounded-2xl border text-left transition-all cursor-pointer relative",
                                                        form.data.target_role === "CABANG"
                                                            ? "border-[#146949] bg-[#eaf5f0]"
                                                            : "border-[#dde7e2] bg-white hover:bg-[#f8faf9] hover:border-[#b8cec4]"
                                                    )}
                                                >
                                                    <RadioGroupItem
                                                        value="CABANG"
                                                        id="role-cabang"
                                                        className="mt-0.5 shrink-0 bg-white"
                                                    />
                                                    <div>
                                                        <div
                                                            className={cn(
                                                                "p-2 rounded-xl border inline-flex items-center justify-center mb-2.5 shadow-2xs",
                                                                form.data.target_role === "CABANG"
                                                                    ? "bg-[#146949] text-white border-[#146949]"
                                                                    : "bg-white text-[#146949] border-[#dde7e2]"
                                                            )}
                                                        >
                                                            <MapPin size={20} />
                                                        </div>
                                                        <strong className="block text-base font-bold text-[#11281e]">
                                                            Pimpinan Cabang
                                                        </strong>
                                                        <small className="block text-xs text-[#566e63] mt-1 leading-relaxed">
                                                            Bergabung langsung di tingkat kabupaten Magetan.
                                                        </small>
                                                    </div>
                                                </label>

                                                <label
                                                    htmlFor="role-pac"
                                                    className={cn(
                                                        "flex items-start gap-4 p-5 rounded-2xl border text-left transition-all cursor-pointer relative",
                                                        form.data.target_role === "PAC"
                                                            ? "border-[#146949] bg-[#eaf5f0]"
                                                            : "border-[#dde7e2] bg-white hover:bg-[#f8faf9] hover:border-[#b8cec4]"
                                                    )}
                                                >
                                                    <RadioGroupItem
                                                        value="PAC"
                                                        id="role-pac"
                                                        className="mt-0.5 shrink-0 bg-white"
                                                    />
                                                    <div>
                                                        <div
                                                            className={cn(
                                                                "p-2 rounded-xl border inline-flex items-center justify-center mb-2.5 shadow-2xs",
                                                                form.data.target_role === "PAC"
                                                                    ? "bg-[#146949] text-white border-[#146949]"
                                                                    : "bg-white text-[#146949] border-[#dde7e2]"
                                                            )}
                                                        >
                                                            <MapPin size={20} />
                                                        </div>
                                                        <strong className="block text-base font-bold text-[#11281e]">
                                                            Pimpinan Anak Cabang
                                                        </strong>
                                                        <small className="block text-xs text-[#566e63] mt-1 leading-relaxed">
                                                            Bergabung melalui PAC di tingkat kecamatan Anda.
                                                        </small>
                                                    </div>
                                                </label>
                                            </RadioGroup>

                                            {errors.target_role && (
                                                <p className="text-red-600 text-xs font-semibold">
                                                    {errors.target_role}
                                                </p>
                                            )}

                                            {organizationError && (
                                                <Notice type="error">
                                                    {organizationError}{" "}
                                                    <Button
                                                        type="button"
                                                        variant="link"
                                                        size="sm"
                                                        className="h-auto p-0 font-bold underline cursor-pointer text-inherit hover:text-inherit ml-1 inline-flex items-center gap-1"
                                                        disabled={reloading}
                                                        onClick={() => {
                                                            setReloading(true);
                                                            router.reload({
                                                                only: [
                                                                    "organizations",
                                                                    "organizationError",
                                                                ],
                                                                onFinish: () =>
                                                                    setReloading(false),
                                                            });
                                                        }}
                                                    >
                                                        <RefreshCw
                                                            size={13}
                                                            className={
                                                                reloading ? "animate-spin" : ""
                                                            }
                                                        />
                                                        {reloading
                                                            ? "Memuat…"
                                                            : "Muat ulang"}
                                                    </Button>
                                                </Notice>
                                            )}

                                            {form.data.target_role === "PAC" && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 rounded-2xl bg-white border border-[#dde7e2]">
                                                    <div className="flex flex-col gap-2">
                                                        <Label htmlFor="pac_select">
                                                            Pimpinan Anak Cabang *
                                                        </Label>
                                                        <Select
                                                            value={form.data.target_id || undefined}
                                                            onValueChange={(value) =>
                                                                form.setData({
                                                                    ...form.data,
                                                                    target_id: value,
                                                                    wilayah_id: "",
                                                                })
                                                            }
                                                        >
                                                            <SelectTrigger id="pac_select">
                                                                <SelectValue placeholder="Pilih PAC" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {organizations?.pac.map(
                                                                    (unit) => (
                                                                        <SelectItem
                                                                            key={unit.id}
                                                                            value={unit.id}
                                                                        >
                                                                            {unit.name}
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                        {errors.target_id && (
                                                            <small className="text-red-600 text-xs font-medium">
                                                                {errors.target_id}
                                                            </small>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-col gap-2">
                                                        <Label htmlFor="wilayah_select">
                                                            Ranting / Komisariat{" "}
                                                            {Boolean(
                                                                selectedUnit?.wilayah.length,
                                                            ) && "*"}
                                                        </Label>
                                                        <Select
                                                            value={form.data.wilayah_id || undefined}
                                                            disabled={
                                                                !selectedUnit ||
                                                                !selectedUnit.wilayah.length
                                                            }
                                                            onValueChange={(value) =>
                                                                form.setData(
                                                                    "wilayah_id",
                                                                    value,
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger id="wilayah_select">
                                                                <SelectValue placeholder="Pilih Ranting / Komisariat" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {selectedUnit?.wilayah.map(
                                                                    (area) => (
                                                                        <SelectItem
                                                                            key={area.id}
                                                                            value={area.id}
                                                                        >
                                                                            {area.nama} ·{" "}
                                                                            {area.jenis}
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                        {errors.wilayah_id && (
                                                            <small className="text-red-600 text-xs font-medium">
                                                                {errors.wilayah_id}
                                                            </small>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {form.data.target_role === "CABANG" &&
                                                errors.target_id && (
                                                    <Notice type="error">
                                                        {errors.target_id}
                                                    </Notice>
                                                )}

                                            {selectedUnit && (
                                                <div className="flex items-center gap-4 p-4 rounded-xl bg-[#eaf5f0] border border-[#146949]/30 text-[#0e4832] shadow-2xs">
                                                    <span className="p-2.5 rounded-lg bg-white text-[#146949] shadow-2xs shrink-0">
                                                        <MapPin size={20} />
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <small className="block text-[0.68rem] font-extrabold uppercase tracking-widest opacity-80">
                                                            TUJUAN KEANGGOTAAN TERPILIH
                                                        </small>
                                                        <strong className="block text-sm sm:text-base font-bold truncate">
                                                            {form.data.target_role === "CABANG"
                                                                ? "Pimpinan Cabang"
                                                                : selectedUnit.name}
                                                        </strong>
                                                        <p className="text-xs opacity-90 truncate mt-0.5">
                                                            {selectedArea
                                                                ? `${selectedArea.nama} · `
                                                                : ""}
                                                            Periode{" "}
                                                            {selectedUnit.periodeAktif
                                                                ?.nama || "belum tersedia"}
                                                        </p>
                                                    </div>
                                                    <Check size={20} className="text-[#146949] shrink-0" />
                                                </div>
                                            )}
                                            <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-[#dde7e2] text-xs text-[#566e63]">
                                                <ShieldCheck size={18} className="text-[#146949] shrink-0 mt-0.5" />
                                                <p className="leading-relaxed">
                                                    Pengajuan akan diperiksa oleh pengurus
                                                    pimpinan yang kamu pilih. Pastikan tujuan
                                                    keanggotaanmu sudah sesuai.
                                                </p>
                                            </div>
                                        </>
                                    )}

                                    {/* STEP 1: BIODATA ANGGOTA */}
                                    {step === 1 && (
                                        <>
                                            {/* SSO Identity Box */}
                                            <div className="p-5 rounded-2xl bg-white border border-[#dde7e2]">
                                                <div className="flex items-center justify-between pb-3 border-b border-[#dde7e2] mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <img
                                                            src="/images/logo-sso.webp"
                                                            alt=""
                                                            className="size-5 object-contain"
                                                        />
                                                        <span className="text-xs font-bold text-[#11281e] uppercase tracking-wider">
                                                            Identitas IPNU IPPNU ID
                                                        </span>
                                                    </div>
                                                    <span className="inline-flex items-center gap-1 text-[0.7rem] font-semibold text-[#566e63] bg-white px-2.5 py-1 rounded-full border border-[#dde7e2]">
                                                        <LockKeyhole size={11} className="text-[#146949]" />
                                                        Tersinkron SSO
                                                    </span>
                                                </div>
                                                    <div className="flex items-center gap-3.5 mb-4">
                                                        <Avatar
                                                            src={user.avatar_url}
                                                            alt={user.name}
                                                            fallback={user.name}
                                                            className="size-12 rounded-xl shadow-xs"
                                                        />
                                                        <div className="min-w-0">
                                                            <h4 className="text-sm font-bold text-[#11281e] truncate">{user.name}</h4>
                                                            <p className="text-xs text-[#566e63] truncate">{user.email}</p>
                                                        </div>
                                                    </div>
                                                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                    <DataRow
                                                        label="Nama lengkap"
                                                        value={user.name}
                                                    />
                                                    <DataRow
                                                        label="Jenis kelamin"
                                                        value={
                                                            user.gender === "L"
                                                                ? "Laki-laki · IPNU"
                                                                : user.gender === "P"
                                                                  ? "Perempuan · IPPNU"
                                                                  : ""
                                                        }
                                                    />
                                                    <DataRow
                                                        label="Email"
                                                        value={user.email}
                                                    />
                                                    <DataRow
                                                        label="Nomor WhatsApp"
                                                        value={user.phone}
                                                    />
                                                </dl>
                                            </div>

                                            {/* Data Pribadi Fields */}
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-bold text-[#11281e] uppercase tracking-wider pb-2 border-b border-[#dde7e2]">
                                                    Data Pribadi
                                                </h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center justify-between">
                                                            <Label htmlFor="nik_field">NIK *</Label>
                                                            <span
                                                                className={`text-[11px] font-medium transition-colors ${
                                                                    form.data.nik.length === 16
                                                                        ? "text-[#146949]"
                                                                        : form.data.nik.length > 0
                                                                        ? "text-amber-600"
                                                                        : "text-[#566e63]"
                                                                }`}
                                                            >
                                                                {form.data.nik
                                                                    ? `${form.data.nik.length}/16 angka`
                                                                    : profile.nik
                                                                    ? "Tersimpan (16 angka)"
                                                                    : "Wajib 16 angka"}
                                                            </span>
                                                        </div>
                                                        <Input
                                                            id="nik_field"
                                                            value={form.data.nik}
                                                            inputMode="numeric"
                                                            maxLength={16}
                                                            autoComplete="off"
                                                            pattern="[0-9]*"
                                                            placeholder={
                                                                profile.nik
                                                                    ? "•••• •••• •••• ••••"
                                                                    : "Masukkan 16 angka NIK"
                                                            }
                                                            onKeyDown={(e) => {
                                                                if (
                                                                    [
                                                                        "Backspace",
                                                                        "Delete",
                                                                        "Tab",
                                                                        "Escape",
                                                                        "Enter",
                                                                        "ArrowLeft",
                                                                        "ArrowRight",
                                                                        "ArrowUp",
                                                                        "ArrowDown",
                                                                        "Home",
                                                                        "End",
                                                                    ].includes(e.key) ||
                                                                    e.ctrlKey ||
                                                                    e.metaKey
                                                                ) {
                                                                    return;
                                                                }
                                                                if (!/^[0-9]$/.test(e.key)) {
                                                                    e.preventDefault();
                                                                }
                                                            }}
                                                            onPaste={(e) => {
                                                                e.preventDefault();
                                                                const pasted = e.clipboardData.getData("text") || "";
                                                                const digits = pasted.replace(/\D/g, "");
                                                                const input = e.currentTarget;
                                                                const start = input.selectionStart ?? 0;
                                                                const end = input.selectionEnd ?? 0;
                                                                const current = form.data.nik;
                                                                const nextVal = (current.slice(0, start) + digits + current.slice(end)).slice(0, 16);
                                                                form.setData("nik", nextVal);
                                                                if (errors.nik && nextVal.length === 16) {
                                                                    form.clearErrors("nik");
                                                                }
                                                            }}
                                                            onChange={(e) => {
                                                                const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
                                                                form.setData("nik", digits);
                                                                if (errors.nik && digits.length === 16) {
                                                                    form.clearErrors("nik");
                                                                }
                                                            }}
                                                        />
                                                        <small
                                                            className={
                                                                errors.nik
                                                                    ? "text-red-600 text-xs font-medium"
                                                                    : form.data.nik.length === 16
                                                                    ? "text-[#146949] text-xs font-medium"
                                                                    : form.data.nik.length > 0
                                                                    ? "text-amber-600 text-xs"
                                                                    : "text-[#566e63] text-xs"
                                                            }
                                                        >
                                                            {errors.nik ||
                                                                (form.data.nik.length === 16
                                                                    ? "✓ NIK lengkap."
                                                                    : form.data.nik.length > 0
                                                                    ? `NIK baru ${form.data.nik.length} angka. Kurang ${16 - form.data.nik.length} angka lagi.`
                                                                    : profile.nik
                                                                    ? "NIK tersimpan. Kosongkan jika tidak ingin mengganti."
                                                                    : "Hanya angka (0-9), wajib 16 angka sesuai KTP")}
                                                        </small>
                                                    </div>

                                                    <div className="flex flex-col gap-2">
                                                        <Label htmlFor="nia_field">NIA (Nomor Anggota)</Label>
                                                        <Input
                                                            id="nia_field"
                                                            value={form.data.nia}
                                                            autoComplete="off"
                                                            maxLength={100}
                                                            placeholder={profile.nia ? "••••" : "Nomor induk anggota (opsional)"}
                                                            onChange={(e) =>
                                                                form.setData("nia", e.target.value)
                                                            }
                                                        />
                                                        <small className={errors.nia ? "text-red-600 text-xs" : "text-[#566e63] text-xs"}>
                                                            {errors.nia || (profile.nia ? "NIA tersimpan. Kosongkan untuk mempertahankan." : "Opsional, isi jika sudah memiliki nomor anggota.")}
                                                        </small>
                                                    </div>

                                                    <div className="flex flex-col gap-2">
                                                        <Label htmlFor="birth_place_field">Tempat Lahir *</Label>
                                                        <Input
                                                            id="birth_place_field"
                                                            value={form.data.birth_place}
                                                            maxLength={255}
                                                            placeholder="Kota / kabupaten kelahiran"
                                                            onChange={(e) =>
                                                                form.setData("birth_place", e.target.value)
                                                            }
                                                        />
                                                        {errors.birth_place && (
                                                            <small className="text-red-600 text-xs font-medium">{errors.birth_place}</small>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-col gap-2">
                                                        <Label htmlFor="birth_date_field">Tanggal Lahir *</Label>
                                                        <DatePicker
                                                            id="birth_date_field"
                                                            value={form.data.birth_date}
                                                            max={today}
                                                            fromYear={1960}
                                                            toYear={new Date().getFullYear()}
                                                            defaultYear={2006}
                                                            placeholder="Pilih tanggal lahir"
                                                            onChange={(val) =>
                                                                form.setData("birth_date", val)
                                                            }
                                                        />
                                                        {errors.birth_date && (
                                                            <small className="text-red-600 text-xs font-medium">{errors.birth_date}</small>
                                                        )}
                                                    </div>

                                                    <div className="sm:col-span-2 flex flex-col gap-2">
                                                        <Label htmlFor="address_field">Alamat Lengkap *</Label>
                                                        <Textarea
                                                            id="address_field"
                                                            value={form.data.address}
                                                            rows={3}
                                                            maxLength={2000}
                                                            placeholder="Jalan, RT/RW, desa/kelurahan, kecamatan"
                                                            onChange={(e) =>
                                                                form.setData("address", e.target.value)
                                                            }
                                                        />
                                                        {errors.address && (
                                                            <small className="text-red-600 text-xs font-medium">{errors.address}</small>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-col gap-2">
                                                        <Label htmlFor="occupation_field">Pekerjaan</Label>
                                                        <Input
                                                            id="occupation_field"
                                                            value={form.data.occupation}
                                                            maxLength={255}
                                                            placeholder="Contoh: Pelajar / Mahasiswa"
                                                            onChange={(e) =>
                                                                form.setData("occupation", e.target.value)
                                                            }
                                                        />
                                                        {errors.occupation && (
                                                            <small className="text-red-600 text-xs font-medium">{errors.occupation}</small>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-col gap-2">
                                                        <Label htmlFor="position_field">Jabatan dalam Organisasi</Label>
                                                        <Input
                                                            id="position_field"
                                                            value={form.data.position}
                                                            maxLength={255}
                                                            placeholder="Contoh: Anggota"
                                                            onChange={(e) =>
                                                                form.setData("position", e.target.value)
                                                            }
                                                        />
                                                        {errors.position && (
                                                            <small className="text-red-600 text-xs font-medium">{errors.position}</small>
                                                        )}
                                                    </div>

                                                    <div className="sm:col-span-2 flex flex-col gap-2">
                                                        <Label htmlFor="hobby_field">Hobi dan Minat</Label>
                                                        <Input
                                                            id="hobby_field"
                                                            value={form.data.hobby}
                                                            maxLength={1000}
                                                            placeholder="Contoh: Menulis, desain, olahraga"
                                                            onChange={(e) =>
                                                                form.setData("hobby", e.target.value)
                                                            }
                                                        />
                                                        {errors.hobby && (
                                                            <small className="text-red-600 text-xs font-medium">{errors.hobby}</small>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Education Repeater */}
                                            <div className="p-5 rounded-2xl bg-white border border-[#dde7e2] space-y-4">
                                                <div className="flex items-center justify-between pb-3 border-b border-[#dde7e2]">
                                                    <div>
                                                        <h3 className="font-bold text-sm text-[#11281e] flex items-center gap-2">
                                                            <GraduationCap size={18} className="text-[#146949]" />
                                                            Riwayat Pendidikan
                                                        </h3>
                                                        <p className="text-xs text-[#566e63] mt-0.5">
                                                            Tambahkan pendidikan terbaru di urutan pertama (opsional).
                                                        </p>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={form.data.educations.length >= 20}
                                                        onClick={() =>
                                                            form.setData("educations", [
                                                                ...form.data.educations,
                                                                { level: "", institution: "" },
                                                            ])
                                                        }
                                                        className="gap-1.5 text-xs font-semibold border-[#dde7e2] bg-white hover:bg-[#f8faf9] hover:border-[#b8cec4] text-[#0e4832] cursor-pointer shadow-2xs"
                                                    >
                                                        <Plus size={14} />
                                                        Tambah
                                                    </Button>
                                                </div>

                                                {!form.data.educations.length ? (
                                                    <p className="text-xs text-[#566e63] italic py-2">
                                                        Belum ada pendidikan ditambahkan. Bagian ini opsional.
                                                    </p>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {form.data.educations.map((education, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-[#dde7e2] shadow-2xs"
                                                            >
                                                                <div className="w-32 shrink-0">
                                                                    <Select
                                                                        value={education.level || undefined}
                                                                        onValueChange={(value) =>
                                                                            updateEducation(index, {
                                                                                level: value,
                                                                            })
                                                                        }
                                                                    >
                                                                        <SelectTrigger className="text-xs font-semibold px-2.5">
                                                                            <SelectValue placeholder="Jenjang" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {educationLevels.map((lvl) => (
                                                                                <SelectItem
                                                                                    key={lvl}
                                                                                    value={lvl}
                                                                                    className="text-xs font-semibold"
                                                                                >
                                                                                    {lvl}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <Input
                                                                        value={education.institution}
                                                                        placeholder="Nama sekolah / instansi"
                                                                        maxLength={255}
                                                                        onChange={(e) =>
                                                                            updateEducation(index, {
                                                                                institution: e.target.value,
                                                                            })
                                                                        }
                                                                    />
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="size-9 text-[#566e63] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer shrink-0"
                                                                    aria-label={`Hapus pendidikan ${index + 1}`}
                                                                    onClick={() =>
                                                                        form.setData(
                                                                            "educations",
                                                                            form.data.educations.filter(
                                                                                (_, i) => i !== index,
                                                                            ),
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2 size={16} />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Training Repeater */}
                                            <div className="p-5 rounded-2xl bg-white border border-[#dde7e2] space-y-4">
                                                <div className="flex items-center justify-between pb-3 border-b border-[#dde7e2]">
                                                    <div>
                                                        <h3 className="font-bold text-sm text-[#11281e] flex items-center gap-2">
                                                            <ShieldCheck size={18} className="text-[#146949]" />
                                                            Riwayat Pengkaderan
                                                        </h3>
                                                        <p className="text-xs text-[#566e63] mt-0.5">
                                                            Catat kegiatan kaderisasi yang pernah diikuti (opsional).
                                                        </p>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={form.data.trainings.length >= 50}
                                                        onClick={() =>
                                                            form.setData("trainings", [
                                                                ...form.data.trainings,
                                                                { name: "", date: "", place: "" },
                                                            ])
                                                        }
                                                        className="gap-1.5 text-xs font-semibold border-[#dde7e2] bg-white hover:bg-[#f8faf9] hover:border-[#b8cec4] text-[#0e4832] cursor-pointer shadow-2xs"
                                                    >
                                                        <Plus size={14} />
                                                        Tambah
                                                    </Button>
                                                </div>

                                                {!form.data.trainings.length ? (
                                                    <p className="text-xs text-[#566e63] italic py-2">
                                                        Belum ada pengkaderan ditambahkan. Bagian ini opsional.
                                                    </p>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {form.data.trainings.map((training, index) => (
                                                            <div
                                                                key={index}
                                                                className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3.5 rounded-xl bg-white border border-[#dde7e2] shadow-2xs items-center"
                                                            >
                                                                <div className="sm:col-span-4">
                                                                    <Select
                                                                        value={training.name || undefined}
                                                                        onValueChange={(value) =>
                                                                            updateTraining(index, {
                                                                                name: value,
                                                                            })
                                                                        }
                                                                    >
                                                                        <SelectTrigger className="text-xs font-semibold">
                                                                            <SelectValue placeholder="Pilih Kaderisasi" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {trainingNames.map((name) => (
                                                                                <SelectItem
                                                                                    key={name}
                                                                                    value={name}
                                                                                    className="text-xs font-semibold"
                                                                                >
                                                                                    {name}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                <div className="sm:col-span-3">
                                                                    <DatePicker
                                                                        value={training.date}
                                                                        max={today}
                                                                        fromYear={2010}
                                                                        toYear={new Date().getFullYear()}
                                                                        placeholder="Tanggal kegiatan"
                                                                        onChange={(val) =>
                                                                            updateTraining(index, {
                                                                                date: val,
                                                                            })
                                                                        }
                                                                    />
                                                                </div>
                                                                <div className="sm:col-span-4">
                                                                    <Input
                                                                        value={training.place}
                                                                        maxLength={255}
                                                                        placeholder="Lokasi kegiatan"
                                                                        onChange={(e) =>
                                                                            updateTraining(index, {
                                                                                place: e.target.value,
                                                                            })
                                                                        }
                                                                    />
                                                                </div>
                                                                <div className="sm:col-span-1 flex justify-end">
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="size-9 text-[#566e63] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                                                                        aria-label={`Hapus pengkaderan ${index + 1}`}
                                                                        onClick={() =>
                                                                            form.setData(
                                                                                "trainings",
                                                                                form.data.trainings.filter(
                                                                                    (_, i) => i !== index,
                                                                                ),
                                                                            )
                                                                        }
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    {/* STEP 2: PERIKSA & KIRIM */}
                                    {step === 2 && (
                                        <div className="space-y-6">
                                            <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#eaf5f0] border border-[#146949]/30 text-[#0e4832] shadow-2xs">
                                                <div className="p-2.5 rounded-xl bg-white text-[#146949] shadow-2xs shrink-0">
                                                    <BadgeCheck size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-base mb-1">
                                                        Selangkah lagi untuk terdaftar.
                                                    </h3>
                                                    <p className="text-xs opacity-90 leading-relaxed">
                                                        Setelah dikirim, profil dikunci hingga pengurus selesai memverifikasi pengajuanmu.
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Review Tujuan Keanggotaan */}
                                            <div className="p-5 rounded-2xl bg-white border border-[#dde7e2] space-y-3">
                                                <div className="flex items-center justify-between pb-2 border-b border-[#dde7e2]">
                                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#11281e]">
                                                        Tujuan Keanggotaan
                                                    </h4>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-xs text-[#146949] hover:bg-[#eaf5f0] font-semibold gap-1"
                                                        onClick={() => goTo(0)}
                                                    >
                                                        Ubah <ChevronRight size={13} />
                                                    </Button>
                                                </div>
                                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                                    <DataRow label="Pimpinan" value={organizationName} />
                                                    <DataRow
                                                        label="Ranting / Komisariat"
                                                        value={selectedArea?.nama || "Tidak dipilih"}
                                                    />
                                                    <DataRow
                                                        label="Periode aktif"
                                                        value={selectedUnit?.periodeAktif?.nama || "Belum tersedia"}
                                                    />
                                                </dl>
                                            </div>

                                            {/* Review Biodata */}
                                            <div className="p-5 rounded-2xl bg-white border border-[#dde7e2] space-y-3">
                                                <div className="flex items-center justify-between pb-2 border-b border-[#dde7e2]">
                                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#11281e]">
                                                        Ringkasan Biodata
                                                    </h4>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-xs text-[#146949] hover:bg-[#eaf5f0] font-semibold gap-1"
                                                        onClick={() => goTo(1)}
                                                    >
                                                        Ubah <ChevronRight size={13} />
                                                    </Button>
                                                </div>
                                                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#dde7e2]">
                                                    <Avatar
                                                        src={user.avatar_url}
                                                        alt={user.name}
                                                        fallback={user.name}
                                                        className="size-11 rounded-xl shadow-xs"
                                                    />
                                                    <div className="min-w-0">
                                                        <h4 className="text-sm font-bold text-[#11281e] truncate">{user.name}</h4>
                                                        <p className="text-xs text-[#566e63] truncate">{user.email}</p>
                                                    </div>
                                                </div>
                                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                                    <DataRow label="Nama lengkap" value={user.name} />
                                                    <DataRow label="Nomor WhatsApp" value={user.phone} />
                                                    <DataRow
                                                        label="NIK"
                                                        value={
                                                            form.data.nik || profile.nik
                                                                ? "•••• •••• •••• ••••"
                                                                : ""
                                                        }
                                                        secure
                                                    />
                                                    <DataRow
                                                        label="NIA"
                                                        value={
                                                            form.data.nia || profile.nia
                                                                ? "••••"
                                                                : ""
                                                        }
                                                        secure
                                                    />
                                                    <DataRow
                                                        label="Tempat, tanggal lahir"
                                                        value={`${form.data.birth_place}, ${dateLabel(form.data.birth_date)}`}
                                                    />
                                                    <DataRow
                                                        label="Pekerjaan / jabatan"
                                                        value={[
                                                            form.data.occupation,
                                                            form.data.position,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(" · ")}
                                                    />
                                                    <div className="sm:col-span-2">
                                                        <DataRow label="Alamat" value={form.data.address} />
                                                    </div>
                                                    <DataRow
                                                        label="Pendidikan"
                                                        value={
                                                            form.data.educations.length
                                                                ? form.data.educations
                                                                      .map(
                                                                          (e) =>
                                                                              `${e.level} · ${e.institution}`,
                                                                      )
                                                                      .join("; ")
                                                                : "Belum ditambahkan"
                                                        }
                                                    />
                                                    <DataRow
                                                        label="Pengkaderan"
                                                        value={
                                                            form.data.trainings.length
                                                                ? form.data.trainings
                                                                      .map(
                                                                          (t) =>
                                                                              `${t.name} · ${t.place}`,
                                                                      )
                                                                      .join("; ")
                                                                : "Belum ditambahkan"
                                                        }
                                                    />
                                                </dl>
                                            </div>

                                            {/* Confirmation Checkbox */}
                                            <div className="p-4 rounded-xl bg-white border border-[#dde7e2] shadow-2xs">
                                                <div className="flex items-start gap-3">
                                                    <Checkbox
                                                        id="confirmation"
                                                        checked={confirmed}
                                                        onCheckedChange={(checked) =>
                                                            setConfirmed(checked === true)
                                                        }
                                                        className="mt-0.5"
                                                    />
                                                    <Label
                                                        htmlFor="confirmation"
                                                        className="text-xs sm:text-sm text-[#11281e] font-medium leading-relaxed select-none normal-case tracking-normal cursor-pointer"
                                                    >
                                                        Saya sudah memeriksa data dan pimpinan tujuan. Data ini siap
                                                        dikirim kepada pengurus untuk verifikasi resmi keanggotaan.
                                                    </Label>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </fieldset>
                            </CardContent>

                            <CardFooter className="p-6 sm:p-7 border-t border-[#dde7e2] bg-white flex items-center justify-between gap-4">
                                <div>
                                    {step > 0 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={busy}
                                            onClick={() => goTo(step - 1)}
                                            className="gap-2 text-sm font-semibold border-[#dde7e2] bg-white text-[#11281e] hover:bg-[#f8faf9] hover:border-[#b8cec4] cursor-pointer shadow-2xs"
                                        >
                                            <ArrowLeft size={16} />
                                            Kembali
                                        </Button>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={busy || retryRequired}
                                        onClick={() => save()}
                                        className="gap-2 text-sm font-semibold border-[#dde7e2] bg-white text-[#11281e] hover:bg-[#f8faf9] hover:border-[#b8cec4] cursor-pointer shadow-2xs"
                                    >
                                        {form.processing ? (
                                            <LoaderCircle size={16} className="animate-spin text-[#146949]" />
                                        ) : (
                                            <Save size={16} />
                                        )}
                                        <span>Simpan draf</span>
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={
                                            busy ||
                                            retryRequired ||
                                            (step === 2 && (!confirmed || missingIdentity))
                                        }
                                        className="gap-2 text-sm font-bold bg-gradient-to-r from-[#146949] to-[#0e4832] text-white hover:opacity-95 cursor-pointer shadow-xs"
                                    >
                                        {busy ? (
                                            <>
                                                <LoaderCircle size={16} className="animate-spin text-white" />
                                                <span>Memproses…</span>
                                            </>
                                        ) : step === 2 ? (
                                            <>
                                                <span>Kirim Pengajuan</span>
                                                <Send size={16} />
                                            </>
                                        ) : (
                                            <>
                                                <span>Selanjutnya</span>
                                                <ArrowRight size={16} />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </form>
                </div>
            </div>
        </MemberLayout>
    );
}
