import { Dispatch, SetStateAction } from "react";

export interface SearchDropdownProps {
  placeholder: string;
  options:
    | {
        value: string;
        label: string;
      }[]
    | undefined;
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
}
