import { NextRequest, NextResponse } from "next/server";

type Context = { params: Promise<{ path: string[] }> };

async function proxy(request: NextRequest, { params }: Context) {
  const { path } = await params;
  const backend = process.env.BACKEND_INTERNAL_URL;
  if (!backend)
    return NextResponse.json(
      { message: "BACKEND_INTERNAL_URL belum dikonfigurasi." },
      { status: 500 },
    );
  const body = ["GET", "HEAD"].includes(request.method)
    ? undefined
    : await request.arrayBuffer();
  const response = await fetch(
    `${backend}/api/v1/${path.join("/")}${request.nextUrl.search}`,
    {
      method: request.method,
      headers: {
        cookie: request.headers.get("cookie") ?? "",
        "content-type":
          request.headers.get("content-type") ?? "application/json",
      },
      body,
      cache: "no-store",
    },
  );
  return new NextResponse(await response.arrayBuffer(), {
    status: response.status,
    headers: {
      "content-type":
        response.headers.get("content-type") ?? "application/json",
    },
  });
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
