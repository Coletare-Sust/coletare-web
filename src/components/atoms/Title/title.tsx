import { twMerge } from "tailwind-merge";
import { TitleProps } from "./types";

const Title = ({ children, className, onClick }: TitleProps) => {
  return (
    <h1
      className={twMerge(
        "text-[30px] font-bold text-greenBlue-1000",
        className
      )}
      onClick={onClick}
    >
      {children}
    </h1>
  );
};

export default Title;
