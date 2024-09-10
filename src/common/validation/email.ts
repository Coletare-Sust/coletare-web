import { z } from "zod";

export default z
  .string({ required_error: "Insira seu e-mail" })
  .email("Insira um e-mail válido")
  .transform((v) => v.trim());
