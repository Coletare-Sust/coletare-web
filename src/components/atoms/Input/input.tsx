import { twMerge } from "tailwind-merge";
import ReactInputMask from "react-input-mask";

import { InputProps } from "./types";

const Input = ({
  type = "text",
  placeholder,
  formRegister,
  name,
  className,
  onChange,
  value,
  mask = "",
  onBlur,
  disabled,
}: InputProps) => {
  return (
    <ReactInputMask
      disabled={disabled}
      className={`${twMerge(
        "h-11 w-full rounded-lg border border-greenBlue-800 bg-white-1000 px-4 py-2 text-greenBlue-1000 outline-none focus:border-greenDark-400 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}`}
      mask={mask}
      alwaysShowMask={false}
      maskPlaceholder=""
      type={type}
      step={"0.010"}
      placeholder={placeholder}
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      {...(formRegister ? formRegister(name, { required: true }) : {})}
      onBlur={onBlur || undefined}
    />
  );
};

export default Input;
