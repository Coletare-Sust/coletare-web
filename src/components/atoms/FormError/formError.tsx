import { twMerge } from "tailwind-merge";
import { FormErrorProps } from "./types";

export default function FormErrorLabel({
  children,
  className
}: FormErrorProps) {
  return (
    <p className={twMerge("text-xs text-red-600", className)}>{children}</p>
  );
}
