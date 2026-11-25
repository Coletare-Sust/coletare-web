import { twMerge } from "tailwind-merge";
import { BackgroundWrapperProps } from "./types";

const BackgroundWrapper = ({ children, className }: BackgroundWrapperProps) => {
  return (
    <div
      className={twMerge(
        "w-full rounded-lg bg-white-800 px-4 py-6 shadow-sm sm:px-8 sm:py-9 lg:px-24",
        className
      )}
    >
      {children}
    </div>
  );
};

export default BackgroundWrapper;
