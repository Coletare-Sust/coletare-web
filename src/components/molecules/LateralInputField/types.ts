import { ReactNode } from "react";
import { FieldErrors, UseFormRegister } from "react-hook-form";

export interface LateralInputFieldProps {
  label: ReactNode;
  type?: string;
  placeholder: string;
  formErrors?: FieldErrors;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formRegister?: UseFormRegister<any>;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setValue?: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  mask?: string;
  className?: string;
  formErrorLabelClassName?: string;
  disabled?: boolean;
}
