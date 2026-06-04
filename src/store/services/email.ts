const API_BASE =
  process.env.NEXT_PUBLIC_API_EMAIL_URL || "http://localhost:8080/bff/email";

export const sendEmail = async ({
  email,
  subject,
  html
}: {
  email: string;
  subject: string;
  html: string;
}): Promise<{ error: string | null }> => {
  try {
    const res = await fetch(`${API_BASE}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, subject, html })
    });
    const data = await res.json();
    return { error: data.error ?? null };
  } catch (err: any) {
    return { error: err.message ?? "Erro ao enviar email" };
  }
};
