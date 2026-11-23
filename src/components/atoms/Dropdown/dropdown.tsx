"use client";

import Select from "@atoms/Select/select";
import { cn } from "@/utils";

import { DropdownProps } from "./types";

/**
 * Lista de opções com ação por item. Usa o mesmo visual do Select padrão;
 * `value` é o texto exibido no botão.
 */
const Dropdown = ({
  value,
  className,
  options,
  disabled = false
}: DropdownProps) => {
  const isDisabled = options === undefined || options.length === 0 || disabled;
  const selectedIndex = options?.findIndex((item) => item.label === value);

  return (
    <Select
      value={
        selectedIndex !== undefined && selectedIndex >= 0
          ? String(selectedIndex)
          : ""
      }
      onChange={(index) => options?.[Number(index)]?.onClick()}
      options={(options ?? []).map((item, index) => ({
        value: String(index),
        label: item.label
      }))}
      placeholder={value}
      disabled={isDisabled}
      className={cn("w-full sm:w-auto sm:min-w-[11rem]", className)}
    />
  );
};

export default Dropdown;
