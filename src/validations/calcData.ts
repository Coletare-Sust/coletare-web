import { z } from "zod";
import number from "@common/validation/number";

export default z.object({
  landfillDelivery: number,
  fuel: number
});
