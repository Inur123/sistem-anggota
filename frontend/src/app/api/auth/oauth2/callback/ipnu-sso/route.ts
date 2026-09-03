import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const backend = process.env.BACKEND_INTERNAL_URL;
  if (!backend)
    return NextResponse.json(
      { message: "BACKEND_INTERNAL_URL belum dikonfigurasi." },
      { status: 500 },
    );
  const response = await fetch(
    `${backend}/api/v1/auth/callback${request.nextUrl.search}`,
    { redirect: "manual" },
  );
  const location = response.headers.get("location");
  if (!location)
    return new NextResponse(await response.text(), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  const redirect = NextResponse.redirect(location);
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) redirect.headers.set("set-cookie", setCookie);
  return redirect;
}
