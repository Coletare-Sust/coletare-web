import { Dispatch, ReactNode, SetStateAction } from "react";

export interface RadioDropdownProps {
  open: boolean;
  onOpenChange: () => void;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  active: string;
  options: string[];
  setActive: Dispatch<SetStateAction<string>>;
}
