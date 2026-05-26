import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const baseUrl = process.env.BFF_BASE_URL;

  if (!baseUrl) {
    return NextResponse.json({ error: "BFF_BASE_URL não configurado" }, { status: 500 });
  }

  const response = await fetch(`${baseUrl}/bff/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store"
  });

  const data = await response.json();
  const nextResponse = NextResponse.json(data, { status: response.status });
  const cookie = response.headers.get("set-cookie");
  if (cookie) {
    nextResponse.headers.set("set-cookie", cookie);
  }

  return nextResponse;
}
