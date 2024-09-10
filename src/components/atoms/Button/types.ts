export interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  classNameText?: string;
  alertNumber?: number;
  buttonType?: "button" | "submit" | "reset";
}
