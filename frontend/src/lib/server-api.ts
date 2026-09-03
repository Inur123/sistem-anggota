import { cookies } from "next/headers";
import type { OrganizationsResponse, Profile, SessionResponse } from "@/types/member";

type BackendResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
};

async function backendFetch<T>(path: string): Promise<BackendResult<T>> {
  const backendURL = process.env.BACKEND_INTERNAL_URL;
  if (!backendURL) throw new Error("BACKEND_INTERNAL_URL belum dikonfigurasi.");
  const cookieStore = await cookies();
  const response = await fetch(`${backendURL}${path}`, {
    headers: { cookie: cookieStore.toString() },
    cache: "no-store",
  });
  let data: T | null = null;
  if (response.headers.get("content-type")?.includes("application/json")) {
    data = (await response.json()) as T;
  }
  return { ok: response.ok, status: response.status, data };
}

export async function getMemberContext() {
  const [session, profile] = await Promise.all([
    backendFetch<SessionResponse>("/api/v1/auth/session"),
    backendFetch<Profile>("/api/v1/profile"),
  ]);
  if (!session.ok || !profile.ok || !session.data || !profile.data) return null;
  return { user: session.data.user, profile: profile.data };
}

export async function getOrganizations() {
  const result = await backendFetch<OrganizationsResponse>("/api/v1/organizations");
  if (!result.ok || !result.data?.success) return null;
  return result.data.data;
}
