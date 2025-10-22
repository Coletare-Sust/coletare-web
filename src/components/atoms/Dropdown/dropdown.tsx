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
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        disabled={disabled}
        className={twMerge(
          `cursor-pointer rounded-[8px] bg-greenBlue-1000 py-[10px] pl-[16px] pr-[10px] tracking-wide text-white-1000 ${
            (options === undefined || options.length === 0 || disabled) &&
            "cursor-not-allowed opacity-60"
          }`,
          className
        )}
        asChild
      >
        <span className="flex items-center gap-2">
          {value}
          <ChevronDown />
        </span>
      </DropdownMenuTrigger>
      {options && !disabled && (
        <DropdownMenuContent>
          {options?.map((item, key) =>
            options.indexOf(item) === options.length - 1 ? (
              <div key={key} onClick={() => item.onClick()}>
                <DropdownMenuItem className="cursor-pointer">
                  {item.label}
                </DropdownMenuItem>
              </div>
            ) : (
              <div key={key} onClick={() => item.onClick()}>
                <DropdownMenuItem className="cursor-pointer">
                  {item.label}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </div>
            )
          )}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
};

export default Dropdown;
