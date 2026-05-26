import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const baseUrl = process.env.BFF_BASE_URL;

  if (!baseUrl) {
    return NextResponse.json({ error: "BFF_BASE_URL não configurado" }, { status: 500 });
  }

  const cookie = request.headers.get("cookie") ?? "";
  const response = await fetch(`${baseUrl}/bff/auth/logout`, {
    method: "POST",
    headers: {
      cookie
    },
    cache: "no-store"
  });

  const data = await response.json();
  const nextResponse = NextResponse.json(data, { status: response.status });
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    nextResponse.headers.set("set-cookie", setCookie);
  }

  return nextResponse;
}
