import { Loader2 } from "lucide-react";
import { LoadingComponentProps } from "./types";

export default function LoadingComponent({
  color,
  size
}: LoadingComponentProps) {
  return (
    <Loader2
      className="duration-[3000ms] mx-auto animate-spin opacity-100"
      color={color || "#004A55"}
      size={size || 32}
    />
  );
}
