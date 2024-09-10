export interface TransitionModalProps {
  children?: React.ReactNode;
  title?: string;
  description?: string;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}
