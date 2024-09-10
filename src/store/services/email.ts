export const sendEmail = async ({
  email,
  subject,
  html
}: {
  email: string;
  subject: string;
  html: string;
}) => {
  return await fetch("/api/email", {
    method: "post",
    body: JSON.stringify({
      email,
      subject,
      html
    })
  })
    .then(() => ({ error: null }))
    .catch((err: string) => ({
      error: err
    }));
};
