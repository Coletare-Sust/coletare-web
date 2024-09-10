import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import React from "react";
import { MoreVertical } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { MoraDropdownProps } from "./types";

const MoreDropdown = ({ options, disabled = false }: MoraDropdownProps) => {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        className={twMerge(
          `cursor-pointer rounded-[8px]  px-[10px] py-[10px] tracking-wide text-white-1000 ${
            (options === undefined || options.length === 0 || disabled) &&
            "cursor-not-allowed opacity-60"
          }`,
          ""
        )}
        asChild
      >
        <span>
          <MoreVertical
            color="#93B1B5"
            size={34}
            className="transition-all hover:scale-[110%]"
          />
        </span>
      </DropdownMenuTrigger>
      {options && !disabled && (
        <DropdownMenuContent className="-translate-x-[40%] -translate-y-2 bg-[#fff] text-greenBlue-1000">
          {options?.map((item, key) =>
            options.indexOf(item) === options.length - 1 ? (
              <div key={key} onClick={item.onClick}>
                <DropdownMenuItem className="cursor-pointer">
                  {item.label}
                </DropdownMenuItem>
              </div>
            ) : (
              <div key={key} onClick={item.onClick}>
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

export default MoreDropdown;
