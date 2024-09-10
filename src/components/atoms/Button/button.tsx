import { twMerge } from "tailwind-merge";

import LoadingComponent from "@atoms/Loading/loading";
import { ButtonProps } from "./types";

export default function Button({
  onClick,
  children,
  disabled = false,
  loading = false,
  className,
  classNameText,
  alertNumber,
  buttonType = "submit"
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      type={buttonType}
      disabled={disabled || loading}
      className={twMerge(
        "relative select-none rounded-[8px] border bg-greenBlue-1000 px-[16px] py-[10px] text-[14px] font-medium tracking-wider text-white-1000 shadow-sm transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60	",
        className
      )}
    >
      {loading ? (
        <LoadingComponent color="#fff" size={20} />
      ) : (
        <div className={`${classNameText}`}>{children}</div>
      )}
      {alertNumber && (
        <span className="absolute -top-2 right-[2px] h-[22px] w-[22px] rounded-full bg-error font-normal text-white-1000">
          {" "}
          {alertNumber}{" "}
        </span>
      )}
    </button>
  );
}
