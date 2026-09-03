import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MemberShell } from "@/components/member-shell";
import { ProfileView } from "@/components/profile-view";
import { getMemberContext, getOrganizations } from "@/lib/server-api";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Profil anggota" };

type ProfilePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const [member, organizations] = await Promise.all([getMemberContext(), getOrganizations()]);
  if (!member) redirect("/");
  if (member.profile.status === "DRAFT") {
    const params = await searchParams;
    const message = typeof params.msg === "string" ? `?msg=${encodeURIComponent(params.msg)}` : "";
    redirect(`/lengkapi-profil${message}`);
  }

  return (
    <MemberShell user={member.user}>
      <ProfileView user={member.user} profile={member.profile} organizations={organizations} />
    </MemberShell>
  );
}
