import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { z } from "zod";
import { requireRole } from "@/utils/serverSession";

const bodySchema = z.object({
  email: z.string().email().max(254),
  subject: z.string().min(1).max(200),
  html: z.string().min(1).max(20000)
});

export async function POST(request: Request) {
  // Sem esta checagem a rota era um relay aberto de e-mail pela conta do projeto.
  const session = await requireRole(request, ["ADMIN", "PLATFORM_ADMIN"]);
  if ("response" in session) return session.response;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  const data = parsed.data;

  // Preferir variaveis sem o prefixo NEXT_PUBLIC_, que nao devem carregar credenciais.
  const user =
    process.env.NODEMAILER_USER ?? process.env.NEXT_PUBLIC_NODEMAILER_USER;
  const pass =
    process.env.NODEMAILER_PASS ?? process.env.NEXT_PUBLIC_NODEMAILER_PASS;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass }
  });

  try {
    await transporter.sendMail({
      from: `Coletare <${user}>`,
      to: data.email,
      replyTo: user,
      subject: data.subject,
      html: data.html
    });
    return NextResponse.json({ error: null });
  } catch (error) {
    return NextResponse.json(
      { error: "Não foi possível enviar o email" },
      { status: 502 }
    );
  }
}
