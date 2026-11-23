import { twMerge } from "tailwind-merge";
import { TitleProps } from "./types";

const Title = ({ children, className, onClick }: TitleProps) => {
  return (
    <h1
      className={twMerge(
        "break-words font-display text-2xl font-bold leading-tight text-greenBlue-1000 sm:text-[30px]",
        className
      )}
      onClick={onClick}
    >
      {children}
    </h1>
  );
};

export default Title;
