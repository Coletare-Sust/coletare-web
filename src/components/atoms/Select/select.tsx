"use client";

import {
  Select as SelectRoot,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

export type SelectOption = { value: string; label: string };

type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  "aria-label"?: string;
};

// O Radix não aceita item com valor vazio, então "" vira este marcador.
const EMPTY = "__empty__";

/**
 * Select padrão da aplicação (visual do filtro de ecopontos).
 * Use no lugar de `<select>` nativo, que abre o seletor do navegador.
 */
export default function Select({
  value,
  onChange,
  options,
  placeholder = "Selecione",
  className,
  disabled,
  id,
  name,
  "aria-label": ariaLabel
}: SelectProps) {
  const hasEmptyOption = options.some((option) => option.value === "");
  const current = value === "" && hasEmptyOption ? EMPTY : value;

  return (
    <SelectRoot
      value={current}
      onValueChange={(next) => onChange(next === EMPTY ? "" : next)}
      disabled={disabled}
      name={name}
    >
      <SelectTrigger id={id} aria-label={ariaLabel} className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.value || EMPTY}
            value={option.value === "" ? EMPTY : option.value}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
}
