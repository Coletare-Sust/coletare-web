import { twMerge } from "tailwind-merge";
import { subtitleProps } from "./types";

const Subtitle = ({ children, className, onClick }: subtitleProps) => {
  return (
    <p
      className={twMerge(
        "text-xl font-semibold text-greenBlue-1000 sm:text-[24px]",
        className
      )}
      onClick={onClick}
    >
      {children}
    </p>
  );
};

export default Subtitle;
