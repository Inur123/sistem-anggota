import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MemberShell } from "@/components/member-shell";
import { ProfileForm } from "@/components/profile-form";
import { getMemberContext, getOrganizations } from "@/lib/server-api";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit profil" };

export default async function EditProfilePage() {
  const [member, organizations] = await Promise.all([getMemberContext(), getOrganizations()]);
  if (!member) redirect("/");
  if (member.profile.status === "DRAFT") redirect("/lengkapi-profil");
  if (member.profile.status === "PENDING") redirect("/profile?error=Profil sedang menunggu verifikasi.");

  return (
    <MemberShell
      user={member.user}
      eyebrow="Pengaturan profil"
      title="Perbarui data anggota."
      description="Identitas utama dari SSO tetap terkunci. Ubah data pendukung atau asal pimpinan yang perlu diperbarui."
    >
      <ProfileForm user={member.user} initialProfile={member.profile} initialOrganizations={organizations} />
    </MemberShell>
  );
}
