import { Dispatch, SetStateAction } from "react";

export interface DatePickerProps {
  date: Date | undefined;
  setDate: Dispatch<SetStateAction<Date | undefined>>;
  endDate?: Date | undefined;
  setEndDate?: Dispatch<SetStateAction<Date | undefined>>;
  mode?: "single" | "range";
  label?: string;
  className?: string;
  classNameButton?: string;
  disabled?: boolean;
  activeDays?: Date[];
}
