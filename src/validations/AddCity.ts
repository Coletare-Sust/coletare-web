import name from "@/common/validation/name";
import email from "@/common/validation/email";
import password from "@/common/validation/password";
import number from "@/common/validation/number";
import { z } from "zod";

export default z.object({
  name,
  email,
  password,
  facilitatorName: name,
  supportEmail: email,
  landfillDelivery: number,
  fuel: number
});
