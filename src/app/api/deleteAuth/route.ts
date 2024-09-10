import { NextResponse } from "next/server";
import { deleteUserAuthAdmin } from "@store/services/firebaseAdmin";
import { initAdmin } from "@/config/firebaseAdmin";

export async function POST(request: Request) {
  const userUid = await request.json();
  await initAdmin();
  const { error } = await deleteUserAuthAdmin(userUid);

  return NextResponse.json({ error });
}
