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
    const response = await fetch("/api/email", {
      method: "post",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        subject,
        html
      })
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { error: body.error ?? `HTTP ${response.status}` };
    }
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Falha de rede" };
  }
};
