import { NextResponse } from "next/server";
import { createUserAuthAdmin } from "@store/services/firebaseAdmin";
import { initAdmin } from "@/config/firebaseAdmin";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  await initAdmin();
  const { uid, error } = await createUserAuthAdmin(email, password);
  console.log("oi", uid);
  return NextResponse.json({ uid, error });
}
