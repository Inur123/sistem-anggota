import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MemberShell } from "@/components/member-shell";
import { ProfileForm } from "@/components/profile-form";
import { getMemberContext, getOrganizations } from "@/lib/server-api";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Lengkapi profil" };

export default async function CompleteProfilePage() {
  const [member, organizations] = await Promise.all([getMemberContext(), getOrganizations()]);
  if (!member) redirect("/");
  if (member.profile.status !== "DRAFT") redirect("/profile");

  return (
    <MemberShell
      user={member.user}
      eyebrow="Mulai profil"
      title="Siapkan profil anggotamu."
      description="Tentukan asal pimpinan, lengkapi data yang diperlukan, lalu kirim untuk diverifikasi pengurus."
    >
      <ProfileForm user={member.user} initialProfile={member.profile} initialOrganizations={organizations} />
    </MemberShell>
  );
}
