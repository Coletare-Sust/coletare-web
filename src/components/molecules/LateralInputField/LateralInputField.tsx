import { twMerge } from "tailwind-merge";
import Input from "@atoms/Input/input";
import FormErrorLabel from "@atoms/FormError/formError";

import { LateralInputFieldProps } from "./types";

const LateralInputField = ({
  placeholder,
  label,
  type,
  formErrors,
  name,
  formRegister,
  onChange,
  value,
  mask = "",
  onBlur,
  className,
  formErrorLabelClassName,
  disabled = false
}: LateralInputFieldProps) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-4">
        <label className="font-medium text-greenDark-1000">{label}</label>
        <Input
          className={twMerge("h-[42px]", className)}
          placeholder={placeholder}
          type={type}
          name={name}
          formRegister={formRegister}
          onChange={onChange}
          value={value}
          mask={mask}
          onBlur={onBlur}
          disabled={disabled}
        />
      </div>
      <FormErrorLabel className={formErrorLabelClassName ?? ""}>
        {formErrors && formErrors[name]?.message
          ? String(formErrors[name]?.message)
          : ""}
      </FormErrorLabel>
    </div>
  );
};

export default LateralInputField;
