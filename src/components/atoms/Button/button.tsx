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
        "min-h-11 relative select-none rounded-[8px] border bg-greenBlue-1000 px-[16px] py-[10px] text-[14px] font-medium tracking-wider text-white-1000 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-aqua focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 lg:hover:scale-105",
        className
      )}
    >
      {loading ? (
        <LoadingComponent color="#fff" size={20} />
      ) : (
        <div className={`${classNameText}`}>{children}</div>
      )}
      {alertNumber && (
        <span className="absolute -right-2 -top-3 flex h-[24px] min-w-[24px] items-center justify-center rounded-full bg-error px-1.5 text-xs font-bold leading-none text-white-900 ring-2 ring-white-1000">
          {alertNumber > 99 ? "99+" : alertNumber}
        </span>
      )}
    </button>
  );
}
