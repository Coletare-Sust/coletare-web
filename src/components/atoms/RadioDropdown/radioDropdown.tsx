import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import React from "react";
import { twMerge } from "tailwind-merge";
import { RadioDropdownProps } from "./types";
import Radio from "../Radio/Radio";

const RadioDropdown = ({
  open,
  onOpenChange,
  children,
  active,
  setActive,
  options,
  className,
  disabled = false
}: RadioDropdownProps) => {
  return (
    <DropdownMenu modal={false} open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger
        className={twMerge(
          `cursor-pointer rounded-[8px] border border-greenBlue-1000 bg-greenBebe-200 px-[12px] py-[8px] text-center text-xs font-medium tracking-wide text-greenBlue-1000 ${
            (active === undefined || disabled) &&
            "cursor-not-allowed opacity-60"
          }`,
          className
        )}
        asChild
      >
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#fff] text-greenBlue-1000">
        <DropdownMenuItem className="cursor-pointer justify-start">
          <Radio
            orientation="vertical"
            value={active}
            onValueChange={setActive as (value: string) => void}
            options={options.map((option, index) => ({
              id: index.toString(),
              text: option,
              value: option.toLowerCase()
            }))}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RadioDropdown;
