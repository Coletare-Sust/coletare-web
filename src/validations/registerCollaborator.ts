import { z } from "zod";

import name from "@/common/validation/name";

export default z.object({
  name,
  cpf: z
    .string()
    .min(11, { message: "A placa deve ter no mínimo 11 caracteres" })
});
