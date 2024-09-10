import React from "react";
import { Check } from "lucide-react";

import { DayCheckboxProps } from "./types";

const DayCheckbox = ({
  name,
  label,
  days,
  position,
  setDays,
  setError
}: DayCheckboxProps) => {
  const isCheckboxChecked = days[position];

  return (
    <div>
      <label htmlFor={name}>
        <div className="flex cursor-pointer items-center gap-2">
          {!isCheckboxChecked && (
            <div className="h-4 w-4 rounded-sm border-2 border-greenAqua-1000"></div>
          )}
          {isCheckboxChecked && (
            <div className="h-4 w-4 rounded-sm border-2 border-greenAqua-1000 bg-greenAqua-1000">
              <Check size={14} color="#FFF" strokeWidth={2.5} />
            </div>
          )}
          <p className="text-xs text-greenDark-1000">{label}</p>
        </div>
      </label>
      <input
        type="checkbox"
        id={name}
        className="hidden"
        checked={days[position]}
        onChange={() => {
          setError("");
          setDays(days.map((day, index) => (index === position ? !day : day)));
        }}
      />
    </div>
  );
};

export default DayCheckbox;
