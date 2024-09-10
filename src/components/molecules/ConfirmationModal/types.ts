export interface ConfirmationModalProps {
  isOpen: boolean;
  onOpenChange: (value: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmIsLoading?: boolean;
}
