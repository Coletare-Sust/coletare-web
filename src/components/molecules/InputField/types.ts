import { FieldErrors, UseFormRegister } from "react-hook-form";

export interface InputFieldProps {
  label: string;
  type?: string;
  placeholder: string;
  formErrors?: FieldErrors;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formRegister?: UseFormRegister<any>;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  mandatory?: boolean;
  setValue?: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  mask?: string;
  className?: string;
  disabled?: boolean;
}
