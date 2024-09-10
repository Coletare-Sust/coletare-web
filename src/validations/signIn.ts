import email from "@/common/validation/email";
import { z } from "zod";

export default z.object({
  email,
  password: z.string()
});
