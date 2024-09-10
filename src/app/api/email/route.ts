import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  const data: { email: string; html: string; subject: string } =
    await request.json();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NEXT_PUBLIC_NODEMAILER_USER,
      pass: process.env.NEXT_PUBLIC_NODEMAILER_PASS
    }
  });

  try {
    await transporter.sendMail({
      from: `Coletare <${process.env.NEXT_PUBLIC_NODEMAILER_USER}>`,
      to: data.email,
      replyTo: process.env.NEXT_PUBLIC_NODEMAILER_USER,
      subject: data.subject,
      html: data.html
    });
    return NextResponse.json({ error: null });
  } catch (error) {
    return NextResponse.json({ error: "Não foi possível enviar o email" });
  }
}
