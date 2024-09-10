import { twMerge } from "tailwind-merge";
import { BackgroundWrapperProps } from "./types";

const BackgroundWrapper = ({ children, className }: BackgroundWrapperProps) => {
  return (
    <div
      className={twMerge(
        "w-full rounded-lg bg-white-800 px-24 py-9 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
};

export default BackgroundWrapper;
