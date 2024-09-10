export interface DayCheckboxProps {
  name: string;
  label: string;
  position: number;
  days: boolean[];
  setDays: (days: boolean[]) => void;
  setError: (error: string) => void;
}
