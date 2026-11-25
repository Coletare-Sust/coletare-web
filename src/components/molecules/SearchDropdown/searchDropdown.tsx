"use client";

import * as React from "react";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { SearchDropdownProps } from "./types";

export function SearchDropdown({
  placeholder,
  value,
  setValue,
  options
}: SearchDropdownProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-11 w-full justify-between gap-2 rounded-lg border border-greenBlue-800 bg-greenBebe-200 px-4 font-normal text-greenBlue-1000 hover:bg-greenBebe-200 sm:w-[400px] [&[aria-expanded=true]>svg]:rotate-180"
        >
          <span className={value ? "truncate" : "truncate text-greenDark-600"}>
            {value
              ? options?.find((option) => option.value === value)?.label
              : placeholder}
          </span>
          <ChevronDown size={18} className="shrink-0 transition-transform" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] rounded-lg border-greenBlue-800 bg-white-1000 p-0 shadow-md">
        <Command className={""}>
          <CommandInput placeholder={placeholder} className="h-9" />
          <CommandEmpty>Sem resultados</CommandEmpty>
          <CommandGroup>
            {options?.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={(currentValue: string) => {
                  setValue(currentValue === value ? "" : currentValue);
                  setOpen(false);
                }}
              >
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
