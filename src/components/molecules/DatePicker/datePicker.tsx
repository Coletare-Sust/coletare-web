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
  className,
  classNameButton,
  disabled = false,
  activeDays
}: DatePickerProps) => {
  return (
    <div className="flex items-center gap-2">
      <p className="font-medium text-greenBlue-1000">Data</p>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            disabled={disabled}
            variant={"outline"}
            className={cn(
              "w-[200px] items-center justify-center border border-greenDark-600 text-left font-normal text-greenDark-1000",
              !date && "",
              classNameButton
            )}
          >
            {date ? (
              <span
                className={twMerge("text-lg text-greenDark-800", className)}
              >
                {format(date, "P", { locale: ptBR })}
              </span>
            ) : (
              <span>Selecione uma data</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto bg-white-1000 p-0">
          <Calendar
            locale={ptBR}
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
            activeDays={activeDays}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DatePicker;
