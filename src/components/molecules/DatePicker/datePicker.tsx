"use client";

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

import { cn } from "@/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { DatePickerProps } from "./types";

const DatePicker = ({
  date,
  setDate,
  endDate,
  setEndDate,
  mode = "single",
  label = "Data",
  className,
  classNameButton,
  disabled = false,
  activeDays
}: DatePickerProps) => {
  const isRange = mode === "range";
  const buttonLabel = React.useMemo(() => {
    if (!isRange) {
      return date ? format(date, "P", { locale: ptBR }) : "Selecione uma data";
    }

    if (date && endDate) {
      return `${format(date, "P", { locale: ptBR })} - ${format(endDate, "P", {
        locale: ptBR
      })}`;
    }

    if (date) {
      return `${format(date, "P", { locale: ptBR })} - ...`;
    }

    return "Selecione um periodo";
  }, [date, endDate, isRange]);

  return (
    <div className="flex items-center gap-2">
      <p className="font-medium text-greenBlue-1000">{label}</p>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            disabled={disabled}
            variant={"outline"}
            className={cn(
              "w-[200px] items-center justify-center border border-greenDark-600 text-left font-normal text-greenDark-1000",
              !date && "",
              isRange && "w-[260px]",
              classNameButton
            )}
          >
            <span className={twMerge("text-lg text-greenDark-800", className)}>
              {buttonLabel}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto bg-white-1000 p-0">
          {isRange ? (
            <Calendar
              locale={ptBR}
              mode="range"
              selected={{ from: date, to: endDate }}
              onSelect={(range) => {
                setDate(range?.from);
                setEndDate?.(range?.to);
              }}
              initialFocus
              activeDays={activeDays}
            />
          ) : (
            <Calendar
              locale={ptBR}
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              activeDays={activeDays}
            />
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DatePicker;
