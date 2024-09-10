import { twMerge } from "tailwind-merge";
import { subtitleProps } from "./types";

const Subtitle = ({ children, className }: subtitleProps) => {
  return (
    <p
      className={twMerge(
        "text-[24px] font-semibold text-greenBlue-1000",
        className
      )}
    >
      {children}
    </p>
  );
};

export default Subtitle;
