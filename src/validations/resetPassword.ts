import { z } from "zod";

// Mesma regra do backend (PasswordResetConfirmInput): obrigatória e com no mínimo 8 caracteres.
export default z
  .object({
    password: z
      .string()
      .min(8, { message: "A senha deve ter no mínimo 8 caracteres" }),
    confirmPassword: z.string().min(1, { message: "Confirme a nova senha" })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"]
  });
