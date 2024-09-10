export interface DropdownProps {
  value: string;
  className?: string;
  options: { label: string; onClick: () => void }[];
  disabled?: boolean;
}
