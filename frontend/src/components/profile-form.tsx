"use client";

import { Children, cloneElement, isValidElement, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BadgeCheckIcon,
  Building2Icon,
  CheckIcon,
  GraduationCapIcon,
  LoaderCircleIcon,
  LockKeyholeIcon,
  PlusIcon,
  ShieldCheckIcon,
  Trash2Icon,
  UserRoundIcon,
  UsersIcon,
} from "lucide-react";
import { toast } from "sonner";
import { MemberDatePicker } from "@/components/member-date-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field as ShadcnField,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type {
  Education,
  Organizations,
  OrganizationsResponse,
  Profile,
  SessionUser,
  Training,
} from "@/types/member";

type FormState = {
  nik: string;
  nia: string;
  birthPlace: string;
  birthDate: string;
  address: string;
  educations: Education[];
  trainings: Training[];
  occupation: string;
  hobby: string;
  position: string;
};

const educationLevels = ["SD", "SMP", "SMA", "D3", "D4", "S1", "S2", "S3"];
const trainingNames = ["Makesta", "Lakmud", "Lakut", "Latin", "Latpel", "Diklatama", "Diklatmad"];
const educationLevelItems = Object.fromEntries(educationLevels.map((level) => [level, level]));
const trainingNameItems = Object.fromEntries(trainingNames.map((name) => [name, name]));
const today = new Date();
const steps = [
  { number: 1, label: "Asal pimpinan", description: "Tujuan pengajuan" },
  { number: 2, label: "Data anggota", description: "Identitas pendukung" },
  { number: 3, label: "Periksa & kirim", description: "Konfirmasi akhir" },
];

function parseArray<T>(value: string): T[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function normalizeGender(value: string) {
  const normalized = value.toLowerCase();
  if (["l", "male", "laki-laki", "pria"].includes(normalized)) return "L";
  if (["p", "female", "perempuan", "wanita"].includes(normalized)) return "P";
  return "";
}

async function responseMessage(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message || fallback;
  } catch {
    return fallback;
  }
}

export function ProfileForm({
  user,
  initialProfile,
  initialOrganizations,
}: {
  user: SessionUser;
  initialProfile: Profile;
  initialOrganizations: Organizations | null;
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const previousStep = useRef(1);
  const initialRole = initialProfile.organization?.role.toLowerCase() ?? "";
  const [step, setStep] = useState(1);
  const [version, setVersion] = useState(initialProfile.version);
  const [tingkatan, setTingkatan] = useState(initialRole);
  const [pimpinan, setPimpinan] = useState(initialProfile.organization?.targetId ?? "");
  const [ranting, setRanting] = useState(initialProfile.organization?.wilayahId ?? "");
  const [organizations, setOrganizations] = useState<Organizations | null>(initialOrganizations);
  const [organizationError, setOrganizationError] = useState("");
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(!initialOrganizations);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>(() => ({
    nik: "",
    nia: "",
    birthPlace: initialProfile.birthPlace,
    birthDate: initialProfile.birthDate,
    address: initialProfile.address,
    educations: parseArray<Education>(initialProfile.educationHistory),
    trainings: parseArray<Training>(initialProfile.trainingHistory),
    occupation: initialProfile.occupation,
    hobby: initialProfile.hobby,
    position: initialProfile.position,
  }));

  useEffect(() => {
    if (initialOrganizations) return;
    let active = true;
    async function loadOrganizations() {
      try {
        const response = await fetch("/api/backend/organizations", { cache: "no-store" });
        const body = (await response.json()) as OrganizationsResponse;
        if (!response.ok || !body.success) throw new Error(body.message || "Data organisasi tidak tersedia.");
        if (active) setOrganizations(body.data);
      } catch (error) {
        if (active) setOrganizationError(error instanceof Error ? error.message : "Data organisasi tidak tersedia.");
      } finally {
        if (active) setIsLoadingOrganizations(false);
      }
    }
    void loadOrganizations();
    return () => {
      active = false;
    };
  }, [initialOrganizations]);

  useEffect(() => {
    if (previousStep.current === step) return;
    previousStep.current = step;
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const selectedPAC = organizations?.pac.find((organization) => organization.id === pimpinan);
  const availableAreas = selectedPAC?.wilayah ?? [];
  const selectedArea = availableAreas.find((area) => area.id === ranting);
  const leadershipItems = Object.fromEntries((organizations?.pac ?? []).map((item) => [item.id, item.name]));
  const areaItems = Object.fromEntries(availableAreas.map((area) => [area.id, `${area.nama} · ${area.jenis}`]));
  const selectedLeadership = tingkatan === "cabang" ? organizations?.cabang : selectedPAC;
  const organizationName = selectedLeadership?.name ?? initialProfile.organization?.targetName ?? "";
  const organizationID = selectedLeadership?.id ?? initialProfile.organization?.targetId ?? "";

  const stepOneValid = Boolean(
    (tingkatan === "cabang" && organizationID && organizationName) ||
      (tingkatan === "pac" && organizationID && organizationName && (availableAreas.length === 0 || ranting)),
  );
  const nikValid = (initialProfile.hasNik && form.nik === "") || /^\d{16}$/.test(form.nik);
  const historiesValid =
    form.educations.every((item) => item.level && item.institution.trim()) &&
    form.trainings.every((item) => item.name && item.date && item.place.trim());
  const stepTwoValid = Boolean(
    normalizeGender(user.gender || initialProfile.gender) &&
      user.name.trim() &&
      user.phone.trim() &&
      nikValid &&
      form.birthPlace.trim() &&
      form.birthDate &&
      form.address.trim() &&
      historiesValid,
  );
  const missingSSOIdentity = !user.name.trim() || !user.phone.trim() || !normalizeGender(user.gender || initialProfile.gender);

  function updateForm<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateEducation(index: number, patch: Partial<Education>) {
    updateForm(
      "educations",
      form.educations.map((education, currentIndex) => (currentIndex === index ? { ...education, ...patch } : education)),
    );
  }

  function updateTraining(index: number, patch: Partial<Training>) {
    updateForm(
      "trainings",
      form.trainings.map((training, currentIndex) => (currentIndex === index ? { ...training, ...patch } : training)),
    );
  }

  async function handleSubmit() {
    if (!stepOneValid || !stepTwoValid || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const saveResponse = await fetch("/api/backend/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version,
          tingkatan,
          pimpinan: organizationID,
          pimpinanName: organizationName,
          ranting: tingkatan === "pac" ? ranting : "",
          rantingName: tingkatan === "pac" ? selectedArea?.nama ?? initialProfile.organization?.wilayahName ?? "" : "",
          rantingType: tingkatan === "pac" ? selectedArea?.jenis ?? initialProfile.organization?.wilayahType ?? "" : "",
          formData: {
            fullName: user.name,
            gender: normalizeGender(user.gender || initialProfile.gender),
            email: user.email,
            phone: user.phone,
            ...form,
          },
        }),
      });
      if (!saveResponse.ok) throw new Error(await responseMessage(saveResponse, "Profil gagal disimpan."));
      const saved = (await saveResponse.json()) as { version: number };
      setVersion(saved.version);

      const submitResponse = await fetch("/api/backend/profile/submit", { method: "POST" });
      if (!submitResponse.ok) {
        toast.error(await responseMessage(submitResponse, "Profil tersimpan, tetapi belum berhasil dikirim ke Laci."));
        return;
      }
      toast.success(await responseMessage(submitResponse, "Profil berhasil dikirim ke Laci."));
      router.replace("/profile?msg=Profil berhasil dikirim dan menunggu verifikasi.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Profil gagal diproses.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div ref={containerRef} className="mx-auto w-full max-w-5xl scroll-mt-20 sm:scroll-mt-24">
      <Card className="gap-0 overflow-visible rounded-2xl border border-border bg-white py-0 shadow-none ring-0">
        <ProgressHeader step={step} onStepChange={setStep} />

        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (step < 3) setStep((current) => current + 1);
            else void handleSubmit();
          }}
        >
          <CardContent className="min-h-[470px] px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
            {step === 1 ? (
              <section aria-labelledby="organization-title">
                <FormHeading
                  number="01"
                  title="Pilih asal pimpinan"
                  description="Tentukan pengurus yang akan menerima dan memverifikasi profilmu di Laci."
                  id="organization-title"
                />

                {organizationError ? (
                  <div className="mt-7 rounded-xl border border-destructive bg-destructive/5 p-4 text-sm leading-6 text-destructive">
                    {organizationError} Muat ulang halaman untuk mencoba kembali.
                  </div>
                ) : null}

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <OrganizationChoice
                    active={tingkatan === "cabang"}
                    icon={Building2Icon}
                    title="Pimpinan Cabang"
                    description={organizations?.cabang?.name ?? "Keanggotaan pada tingkat cabang"}
                    disabled={isLoadingOrganizations || !organizations?.cabang}
                    onClick={() => {
                      setTingkatan("cabang");
                      setPimpinan(organizations?.cabang?.id ?? "");
                      setRanting("");
                    }}
                  />
                  <OrganizationChoice
                    active={tingkatan === "pac"}
                    icon={UsersIcon}
                    title="Pimpinan Anak Cabang"
                    description="Pilih PAC beserta Ranting atau Komisariat"
                    disabled={isLoadingOrganizations}
                    onClick={() => {
                      if (tingkatan !== "pac") {
                        setPimpinan(initialRole === "pac" ? initialProfile.organization?.targetId ?? "" : "");
                        setRanting(initialRole === "pac" ? initialProfile.organization?.wilayahId ?? "" : "");
                      }
                      setTingkatan("pac");
                    }}
                  />
                </div>

                {isLoadingOrganizations ? (
                  <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
                    <LoaderCircleIcon className="size-4 animate-spin" /> Memuat daftar organisasi…
                  </div>
                ) : null}

                {tingkatan === "pac" ? (
                  <div className="mt-8 grid gap-5 border-t border-border pt-7 sm:grid-cols-2">
                    <FormField label="Pimpinan Anak Cabang" controlId="leadership-select" required>
                      <Select items={leadershipItems} value={pimpinan} onValueChange={(value) => { setPimpinan(String(value)); setRanting(""); }}>
                        <SelectTrigger id="leadership-select" className="w-full"><SelectValue placeholder="Pilih PAC" /></SelectTrigger>
                        <SelectContent alignItemWithTrigger={false}>
                          {organizations?.pac.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormField>
                    <FormField
                      label="Ranting / Komisariat"
                      controlId="area-select"
                      hint={!pimpinan ? "Pilih PAC terlebih dahulu" : undefined}
                      required={availableAreas.length > 0}
                    >
                      <Select items={areaItems} value={ranting} onValueChange={(value) => setRanting(String(value))} disabled={!pimpinan || availableAreas.length === 0}>
                        <SelectTrigger id="area-select" className="w-full"><SelectValue placeholder={availableAreas.length ? "Pilih wilayah" : "Tidak ada wilayah turunan"} /></SelectTrigger>
                        <SelectContent alignItemWithTrigger={false}>
                          {availableAreas.map((area) => <SelectItem key={area.id} value={area.id}>{area.nama} · {area.jenis}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>
                ) : null}
              </section>
            ) : null}

            {step === 2 ? (
              <section aria-labelledby="profile-data-title">
                <FormHeading
                  number="02"
                  title="Lengkapi data anggota"
                  description="Periksa identitas dari SSO, lalu lengkapi informasi yang masih bisa diperbarui."
                  id="profile-data-title"
                />

                {missingSSOIdentity ? (
                  <div className="mt-7 rounded-xl border border-destructive bg-destructive/5 p-4 text-sm leading-6 text-destructive">
                    Nama, jenis kelamin, atau nomor HP belum lengkap di IPNU IPPNU ID. Perbarui identitas pusat terlebih dahulu sebelum mengirim profil.
                  </div>
                ) : null}

                <IdentitySummary user={user} gender={normalizeGender(user.gender || initialProfile.gender)} />

                <FormSection
                  icon={UserRoundIcon}
                  title="Data pribadi"
                  description="Informasi inti untuk administrasi keanggotaan."
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                      label="NIK"
                      hint={initialProfile.hasNik && !form.nik ? "Tersimpan aman" : undefined}
                      required
                      error={form.nik.length > 0 && !nikValid ? "NIK harus tepat 16 angka." : undefined}
                    >
                      <Input
                        inputMode="numeric"
                        autoComplete="off"
                        value={form.nik}
                        onChange={(event) => updateForm("nik", event.target.value.replace(/\D/g, ""))}
                        placeholder={initialProfile.hasNik ? "Kosongkan jika tidak berubah" : "16 digit NIK"}
                        maxLength={16}
                        aria-invalid={form.nik.length > 0 && !nikValid}
                      />
                    </FormField>
                    <FormField label="NIA" hint={initialProfile.hasNia && !form.nia ? "Tersimpan" : "Opsional"}>
                      <Input
                        value={form.nia}
                        onChange={(event) => updateForm("nia", event.target.value)}
                        placeholder={initialProfile.hasNia ? "Kosongkan jika tidak berubah" : "Nomor Induk Anggota"}
                      />
                    </FormField>
                    <FormField label="Tempat lahir" required>
                      <Input value={form.birthPlace} onChange={(event) => updateForm("birthPlace", event.target.value)} placeholder="Kota atau kabupaten kelahiran" />
                    </FormField>
                    <FormField label="Tanggal lahir" required>
                      <MemberDatePicker value={form.birthDate} onChange={(value) => updateForm("birthDate", value)} maxDate={today} placeholder="Pilih tanggal lahir" />
                    </FormField>
                    <div className="sm:col-span-2">
                      <FormField label="Alamat lengkap" required>
                        <Textarea value={form.address} onChange={(event) => updateForm("address", event.target.value)} placeholder="Jalan, RT/RW, desa atau kelurahan, kecamatan" />
                      </FormField>
                    </div>
                  </div>
                </FormSection>

                <FormSection
                  icon={Building2Icon}
                  title="Aktivitas anggota"
                  description="Keterangan pendukung yang membantu pengurus mengenal profilmu."
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField label="Jabatan saat ini" hint="Opsional">
                      <Input value={form.position} onChange={(event) => updateForm("position", event.target.value)} placeholder="Ketua, sekretaris, anggota…" />
                    </FormField>
                    <FormField label="Pekerjaan" hint="Opsional">
                      <Input value={form.occupation} onChange={(event) => updateForm("occupation", event.target.value)} placeholder="Pekerjaan saat ini" />
                    </FormField>
                    <div className="sm:col-span-2">
                      <FormField label="Hobi / minat bakat" hint="Opsional">
                        <Input value={form.hobby} onChange={(event) => updateForm("hobby", event.target.value)} placeholder="Contoh: desain, olahraga, menulis" />
                      </FormField>
                    </div>
                  </div>
                </FormSection>

                <HistorySection
                  icon={GraduationCapIcon}
                  title="Riwayat pendidikan"
                  description="Tambahkan jenjang yang paling relevan."
                  empty="Belum ada riwayat pendidikan."
                  onAdd={() => updateForm("educations", [...form.educations, { level: "", institution: "" }])}
                >
                  {form.educations.map((education, index) => (
                    <div key={`education-${index}`} className="grid gap-3 border-t border-border pt-5 first:border-t-0 first:pt-0 sm:grid-cols-[54px_140px_1fr_40px] sm:items-end">
                      <RowNumber index={index} />
                      <FormField label="Jenjang" controlId={`education-level-${index}`}>
                        <Select items={educationLevelItems} value={education.level} onValueChange={(value) => updateEducation(index, { level: String(value) })}>
                          <SelectTrigger id={`education-level-${index}`} className="w-full"><SelectValue placeholder="Pilih" /></SelectTrigger>
                          <SelectContent alignItemWithTrigger={false}>{educationLevels.map((level) => <SelectItem key={level} value={level}>{level}</SelectItem>)}</SelectContent>
                        </Select>
                      </FormField>
                      <FormField label="Sekolah / kampus">
                        <Input value={education.institution} onChange={(event) => updateEducation(index, { institution: event.target.value })} placeholder="Nama instansi pendidikan" />
                      </FormField>
                      <Button type="button" variant="ghost" size="icon" aria-label="Hapus riwayat pendidikan" onClick={() => updateForm("educations", form.educations.filter((_, itemIndex) => itemIndex !== index))} className="self-end text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                        <Trash2Icon />
                      </Button>
                    </div>
                  ))}
                </HistorySection>

                <HistorySection
                  icon={UsersIcon}
                  title="Riwayat pengkaderan"
                  description="Catat pelatihan kader yang sudah diikuti."
                  empty="Belum ada riwayat pengkaderan."
                  onAdd={() => updateForm("trainings", [...form.trainings, { name: "", date: "", place: "" }])}
                >
                  {form.trainings.map((training, index) => (
                    <div key={`training-${index}`} className="grid gap-3 border-t border-border pt-5 first:border-t-0 first:pt-0 lg:grid-cols-[54px_1fr_1fr_1fr_40px] lg:items-end">
                      <RowNumber index={index} />
                      <FormField label="Nama kaderisasi" controlId={`training-name-${index}`}>
                        <Select items={trainingNameItems} value={training.name} onValueChange={(value) => updateTraining(index, { name: String(value) })}>
                          <SelectTrigger id={`training-name-${index}`} className="w-full"><SelectValue placeholder="Pilih" /></SelectTrigger>
                          <SelectContent alignItemWithTrigger={false}>{trainingNames.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}</SelectContent>
                        </Select>
                      </FormField>
                      <FormField label="Tanggal">
                        <MemberDatePicker value={training.date} onChange={(value) => updateTraining(index, { date: value })} maxDate={today} placeholder="Pilih tanggal" />
                      </FormField>
                      <FormField label="Tempat">
                        <Input value={training.place} onChange={(event) => updateTraining(index, { place: event.target.value })} placeholder="Lokasi kegiatan" />
                      </FormField>
                      <Button type="button" variant="ghost" size="icon" aria-label="Hapus riwayat pengkaderan" onClick={() => updateForm("trainings", form.trainings.filter((_, itemIndex) => itemIndex !== index))} className="self-end text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                        <Trash2Icon />
                      </Button>
                    </div>
                  ))}
                </HistorySection>
              </section>
            ) : null}

            {step === 3 ? (
              <section aria-labelledby="confirmation-title">
                <FormHeading
                  number="03"
                  title="Periksa sebelum dikirim"
                  description="Pastikan tujuan organisasi dan data penting sudah tepat sebelum profil dikirim ke Laci."
                  id="confirmation-title"
                />
                <div className="mt-8 grid gap-5 md:grid-cols-[1.15fr_.85fr]">
                  <div className="rounded-xl border border-border p-5 sm:p-6">
                    <p className="font-utility text-[9px] font-bold uppercase tracking-[0.18em] text-primary/70">Ringkasan pengajuan</p>
                    <dl className="mt-5 space-y-4">
                      <ReviewRow label="Nama anggota" value={user.name} />
                      <ReviewRow label="Tujuan organisasi" value={organizationName} />
                      {tingkatan === "pac" ? <ReviewRow label="Ranting / Komisariat" value={selectedArea?.nama ?? initialProfile.organization?.wilayahName ?? "Tidak ada"} /> : null}
                      <ReviewRow label="NIK" value={form.nik ? "NIK baru siap disimpan" : initialProfile.hasNik ? "NIK tersimpan aman" : "Belum diisi"} />
                      <ReviewRow label="Alamat" value={form.address} />
                    </dl>
                  </div>
                  <div className="flex flex-col justify-between rounded-xl border border-primary/25 bg-secondary/45 p-6">
                    <div>
                      <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground"><ShieldCheckIcon className="size-5" /></span>
                      <h3 className="text-balance mt-5 font-display text-2xl font-[760] leading-tight tracking-[-0.035em]">Siap diverifikasi pengurus.</h3>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">Setelah dikirim, profil dikunci sementara agar pengurus memeriksa satu versi data yang konsisten.</p>
                    </div>
                    <Badge variant="outline" className="mt-6 w-fit border-primary/20 bg-white text-primary">Berikutnya · Menunggu verifikasi</Badge>
                  </div>
                </div>
              </section>
            ) : null}
          </CardContent>

          <div className="flex items-center justify-between gap-3 rounded-b-2xl border-t border-border bg-muted/25 px-5 py-4 sm:px-8 lg:px-12">
            {step === 1 ? <span /> : (
              <Button type="button" variant="ghost" className="h-10 rounded-lg px-3" onClick={() => setStep((current) => Math.max(1, current - 1))}>
                <ArrowLeftIcon /> Kembali
              </Button>
            )}
            <Button type="submit" className="h-11 min-w-36 rounded-xl px-5 font-bold" disabled={(step === 1 && !stepOneValid) || (step === 2 && !stepTwoValid) || isSubmitting}>
              {isSubmitting ? <><LoaderCircleIcon className="animate-spin" /> Memproses…</> : step === 3 ? <><ShieldCheckIcon /> Simpan & kirim</> : <>Selanjutnya <ArrowRightIcon /></>}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function ProgressHeader({ step, onStepChange }: { step: number; onStepChange: (step: number) => void }) {
  return (
    <div className="rounded-t-2xl border-b border-border bg-muted/35 px-5 py-5 sm:px-8 sm:py-6 lg:px-12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-utility text-[9px] font-bold uppercase tracking-[0.2em] text-primary/70">Progres profil</p>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">Langkah {step} dari {steps.length}</p>
        </div>
        <span className="hidden items-center gap-2 text-[11px] font-semibold text-muted-foreground sm:flex">
          <LockKeyholeIcon className="size-4 text-primary" /> Data sensitif tidak disimpan di browser
        </span>
      </div>

      <ol className="relative mt-6 grid grid-cols-3" aria-label="Tahapan pengisian profil">
        <span className="absolute left-[16.66%] right-[16.66%] top-4 h-px bg-border" aria-hidden="true" />
        {steps.map((item) => {
          const completed = step > item.number;
          const active = step === item.number;
          return (
            <li key={item.number} className="relative z-10 min-w-0">
              <button
                type="button"
                onClick={() => item.number < step && onStepChange(item.number)}
                disabled={item.number > step}
                aria-current={active ? "step" : undefined}
                className="group flex w-full flex-col items-center text-center outline-none disabled:cursor-default"
              >
                <span className={cn(
                  "grid size-8 place-items-center rounded-full border bg-white text-[11px] font-extrabold transition-colors group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-primary",
                  active && "border-primary bg-primary text-primary-foreground",
                  completed && "border-primary bg-white text-primary",
                  !active && !completed && "border-border text-muted-foreground",
                )}>
                  {completed ? <CheckIcon className="size-4" /> : item.number}
                </span>
                <span className={cn("mt-2 block truncate text-[10px] font-extrabold sm:text-xs", !active && !completed && "text-muted-foreground")}>{item.label}</span>
                <span className="mt-0.5 hidden text-[10px] text-muted-foreground sm:block">{item.description}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function FormHeading({ number, title, description, id }: { number: string; title: string; description: string; id: string }) {
  return (
    <div>
      <p className="font-utility text-[9px] font-bold uppercase tracking-[0.2em] text-primary/70">Langkah {number}</p>
      <h2 id={id} className="text-balance mt-2 font-display text-2xl font-[760] leading-tight tracking-[-0.04em] sm:text-3xl">{title}</h2>
      <p className="text-pretty mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

function IdentitySummary({ user, gender }: { user: SessionUser; gender: string }) {
  return (
    <div className="mt-8 border-y border-border py-5">
      <div className="flex items-center gap-2 text-xs font-extrabold text-primary"><BadgeCheckIcon className="size-4" /> Identitas dari IPNU IPPNU ID</div>
      <dl className="mt-4 grid gap-4 sm:grid-cols-3">
        <IdentityItem label="Nama lengkap" value={user.name || "Belum lengkap"} />
        <IdentityItem label="Jenis kelamin" value={gender === "L" ? "Laki-laki · IPNU" : gender === "P" ? "Perempuan · IPPNU" : "Belum lengkap"} />
        <IdentityItem label="Nomor WhatsApp / HP" value={user.phone || "Belum lengkap"} />
      </dl>
    </div>
  );
}

function IdentityItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold text-muted-foreground">{label}</dt>
      <dd className="mt-1 truncate text-sm font-extrabold" title={value}>{value}</dd>
    </div>
  );
}

function FormSection({ icon: Icon, title, description, children }: { icon: LucideIcon; title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="mt-9 border-t border-border pt-8">
      <div className="mb-6 flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-primary"><Icon className="size-4" /></span>
        <div>
          <h3 className="font-display text-base font-extrabold tracking-[-0.02em]">{title}</h3>
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function FormField({
  label,
  hint,
  required,
  controlId,
  error,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  controlId?: string;
  error?: string;
  children: React.ReactNode;
}) {
  const generatedId = useId();
  const id = controlId ?? generatedId;
  const childArray = Children.toArray(children);
  const firstChild = childArray[0];
  const labelledChildren = isValidElement<{ id?: string }>(firstChild) && firstChild.type !== Select
    ? [cloneElement(firstChild, { id: firstChild.props.id ?? id }), ...childArray.slice(1)]
    : childArray;

  return (
    <ShadcnField data-invalid={Boolean(error)} className="gap-2">
      <div className="flex min-h-4 items-center justify-between gap-3">
        <FieldLabel htmlFor={id} className="text-xs font-extrabold text-foreground/80">
          {label}{required ? <span className="text-destructive">*</span> : null}
        </FieldLabel>
        {hint ? <FieldDescription className="text-right text-[10px] leading-4">{hint}</FieldDescription> : null}
      </div>
      {labelledChildren}
      {error ? <FieldError className="text-xs">{error}</FieldError> : null}
    </ShadcnField>
  );
}

function OrganizationChoice({ active, disabled, icon: Icon, title, description, onClick }: { active: boolean; disabled?: boolean; icon: LucideIcon; title: string; description: string; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex min-h-28 items-start gap-4 rounded-xl border border-border bg-white p-4 text-left outline-none transition-colors hover:border-primary/45 focus-visible:border-primary disabled:pointer-events-none disabled:opacity-50",
        active && "border-primary bg-secondary/35",
      )}
    >
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}><Icon className="size-5" /></span>
      <span className="min-w-0">
        <span className="flex items-center gap-2 font-extrabold">{title}{active ? <CheckIcon className="size-4 text-primary" /> : null}</span>
        <span className="mt-1 block text-xs leading-5 text-muted-foreground">{description}</span>
      </span>
    </button>
  );
}

function HistorySection({ icon: Icon, title, description, empty, onAdd, children }: { icon: LucideIcon; title: string; description: string; empty: string; onAdd: () => void; children: React.ReactNode }) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return (
    <section className="mt-9 border-t border-border pt-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-primary"><Icon className="size-4" /></span>
          <div><h3 className="font-display text-base font-extrabold tracking-[-0.02em]">{title}</h3><p className="mt-0.5 text-xs leading-5 text-muted-foreground">{description}</p></div>
        </div>
        <Button type="button" variant="outline" size="sm" className="h-9 rounded-lg border-border px-3 font-bold shadow-none" onClick={onAdd}><PlusIcon /> Tambah</Button>
      </div>
      <div className="mt-6 space-y-5">
        {hasChildren ? children : <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">{empty}</div>}
      </div>
    </section>
  );
}

function RowNumber({ index }: { index: number }) {
  return <span className="font-utility hidden h-11 items-center text-[10px] font-bold tracking-[0.14em] text-muted-foreground sm:flex">{String(index + 1).padStart(2, "0")}</span>;
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-4 border-b border-border pb-4 last:border-0 last:pb-0 sm:grid-cols-[130px_1fr]">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-semibold leading-5 text-foreground">{value || "—"}</dd>
    </div>
  );
}
