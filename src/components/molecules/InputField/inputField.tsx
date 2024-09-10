import Input from "@atoms/Input/input";
import FormErrorLabel from "@atoms/FormError/formError";

import { InputFieldProps } from "./types";

const InputField = ({
  placeholder,
  label,
  type,
  formErrors,
  name,
  formRegister,
  onChange,
  mandatory,
  value,
  mask = "",
  onBlur,
  className,
  disabled = false
}: InputFieldProps) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-greenDark-800">
        {label}
        {mandatory && <span className="text-red-600">*</span>}
      </label>
      <Input
        className={className}
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
      <FormErrorLabel className="self-end">
        {formErrors && formErrors[name]?.message
          ? String(formErrors[name]?.message)
          : ""}
      </FormErrorLabel>
    </div>
  );
};

export default InputField;
