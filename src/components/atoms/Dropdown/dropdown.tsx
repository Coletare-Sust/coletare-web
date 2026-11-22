import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import React from "react";
import { ChevronDown } from "lucide-react";
import { twMerge } from "tailwind-merge";

import { DropdownProps } from "./types";

const Dropdown = ({
  value,
  className,
  options,
  disabled = false
}: DropdownProps) => {
  const isDisabled = options === undefined || options.length === 0 || disabled;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        disabled={isDisabled}
        className={twMerge(
          "min-h-11 flex cursor-pointer items-center justify-between gap-2 rounded-[8px] bg-greenBlue-1000 py-[10px] pl-[16px] pr-[10px] tracking-wide text-white-1000 outline-none focus-visible:ring-2 focus-visible:ring-brand-aqua focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
          className
        )}
      >
        <span className="truncate">{value}</span>
        <ChevronDown className="shrink-0" />
      </DropdownMenuTrigger>
      {options && !disabled && (
        <DropdownMenuContent className="max-h-72 overflow-y-auto">
          {options?.map((item, key) => (
            <div key={key} onClick={() => item.onClick()}>
              <DropdownMenuItem className="min-h-10 cursor-pointer">
                {item.label}
              </DropdownMenuItem>
              {key < options.length - 1 && <DropdownMenuSeparator />}
            </div>
          ))}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
};

export default Dropdown;
