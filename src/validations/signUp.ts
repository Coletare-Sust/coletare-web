import email from "@/common/validation/email";
import name from "@/common/validation/name";
import password from "@/common/validation/password";
import phone from "@/common/validation/phone";
import { z } from "zod";

export default z
  .object({
    name,
    email,
    phone,
    dob: z.string({ required_error: "Insira uma data de nascimento" }),
    password,
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não são iguais",
    path: ["confirmPassword"]
  });
