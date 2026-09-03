import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const backend = process.env.BACKEND_INTERNAL_URL;
  if (!backend)
    return NextResponse.json(
      { message: "BACKEND_INTERNAL_URL belum dikonfigurasi." },
      { status: 500 },
    );
  const response = await fetch(`${backend}/api/v1/auth/logout`, {
    method: "POST",
    headers: { cookie: request.headers.get("cookie") ?? "" },
    redirect: "manual",
  });
  if (response.status < 300 || response.status >= 400) {
    return NextResponse.json({ message: "Logout gagal diproses." }, { status: 502 });
  }
  const result = NextResponse.json({ message: "Berhasil keluar." });
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) result.headers.set("set-cookie", setCookie);
  return result;
}
