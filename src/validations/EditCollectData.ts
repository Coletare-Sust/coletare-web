import { z } from "zod";
import number from "@common/validation/number";

export default z.object({
  mass: number,
  consume: number,
  emission: number,
  landfillDelivery: number,
  fuel: number
});
