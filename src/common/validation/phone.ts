import { z } from "zod";

export default z
  .string({ required_error: "Insira seu telefone" })
  .min(7, "Deve ter no mínimo 7 caracteres")
  .regex(/^[A-zÀ-ú-\s]+$/, "Não utilize caracteres especiais")
  .transform((value) => value.replace(/\s+/g, " ").trim());
