import { z } from "zod";

export default z
  .string({ required_error: "Digite um valor" })
  .refine(
    (value) => {
      return /^[0-9]+(\.[0-9]+)?$/.test(value);
    },
    {
      message: "Digite um número válido"
    }
  )
  .refine(
    (value) => {
      return !isNaN(parseFloat(value)) && isFinite(parseFloat(value));
    },
    {
      message: "Digite um número válido"
    }
  );
