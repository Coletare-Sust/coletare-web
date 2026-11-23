import { twMerge } from "tailwind-merge";

import LoadingComponent from "@atoms/Loading/loading";
import { ButtonProps, ButtonVariant } from "./types";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-greenBlue-1000 text-white-1000 shadow-sm lg:hover:bg-greenBlue-800",
  secondary:
    "border-transparent bg-greenAqua-200 text-greenBlue-1000 lg:hover:bg-greenAqua-400",
  outline:
    "border-greenBlue-800 bg-white-1000 text-greenBlue-1000 lg:hover:bg-greenAqua-200",
  destructive:
    "border-transparent bg-error text-white-1000 shadow-sm lg:hover:bg-error/90",
  ghost:
    "border-transparent bg-transparent text-greenBlue-1000 lg:hover:bg-greenAqua-200"
};

const loadingColor: Record<ButtonVariant, string> = {
  primary: "#fff",
  secondary: "#004A55",
  outline: "#004A55",
  destructive: "#fff",
  ghost: "#004A55"
};

export default function Button({
  onClick,
  children,
  disabled = false,
  loading = false,
  className,
  classNameText,
  alertNumber,
  buttonType = "submit",
  variant = "primary"
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      type={buttonType}
      disabled={disabled || loading}
      className={twMerge(
        "min-h-11 relative select-none rounded-[8px] border px-[16px] py-[10px] text-[14px] font-medium tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-aqua focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        variantStyles[variant],
        className
      )}
    >
      {loading ? (
        <LoadingComponent color={loadingColor[variant]} size={20} />
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
