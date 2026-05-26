import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const baseUrl = process.env.BFF_BASE_URL;

  if (!baseUrl) {
    return NextResponse.json({ authenticated: false, error: "BFF_BASE_URL não configurado" }, { status: 500 });
  }

  const cookie = request.headers.get("cookie") ?? "";
  const response = await fetch(`${baseUrl}/bff/auth/me`, {
    method: "GET",
    headers: {
      cookie
    },
    cache: "no-store"
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
