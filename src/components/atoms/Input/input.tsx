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
  disabled
}: InputProps) => {
  return (
    <ReactInputMask
      disabled={disabled}
      className={`${twMerge(
        "rounded-lg border border-greenDark-400 bg-transparent px-2 py-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
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
