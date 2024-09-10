import { z } from "zod";
import number from "@/common/validation/number";

export default z.object({
  name: z
    .string({ required_error: "Insira o nome do veículo" })
    .min(4, "Deve ter no mínimo 4 caracteres"),
  emission: number,
  consume: number,
  carPlate: z
    .string()
    .min(7, { message: "A placa deve ter no mínimo 7 caracteres" })
});
