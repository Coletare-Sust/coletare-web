import { z } from "zod";
import email from "@/common/validation/email";
import password from "@/common/validation/password";
import number from "@/common/validation/number";

export default z
  .object({
    name: z
      .string({ required_error: "Insira o nome do veículo" })
      .min(4, "Deve ter no mínimo 4 caracteres"),
    email,
    carPlate: z
      .string()
      .min(7, { message: "A placa deve ter no mínimo 7 caracteres" }),
    emission: number,
    consume: number,
    fuelType: z.string().optional(),
    password,
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não são iguais",
    path: ["confirmPassword"]
  });
