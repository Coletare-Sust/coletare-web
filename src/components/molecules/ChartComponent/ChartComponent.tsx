import React, { useState } from "react";
import Dropdown from "@atoms/Dropdown/dropdown";
import BarChart from "@atoms/BarChart/barChart";
import Subtitle from "@atoms/Subtitle/subtitle";
import StackedChartLabels from "@molecules/StackedChartLabels/StackedChartLabels";

import { ChartComponentProps } from "./types";

const ChartComponent = ({
  title,
  dropdownOptions,
  barChartData,
  stackedChartData
}: ChartComponentProps) => {
  const [dropdownValue, setDropdownValue] = useState(dropdownOptions[0].label);
  return (
    <section className="w-full space-y-4">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Subtitle className="text-xl font-semibold text-greenBlue-1000 sm:text-[24px]">
          {title}
        </Subtitle>
        <Dropdown
          options={dropdownOptions.map((item) => ({
            ...item,
            onClick: () => {
              item.onClick();
              setDropdownValue(item.label);
            }
          }))}
          value={dropdownValue}
        />
      </div>
      <div className="rounded-lg bg-white-800 px-3 py-6 sm:px-6 sm:py-10 lg:py-[52px]">
        <div className="m-auto h-[300px] w-full max-w-[1377px] sm:h-[320px]">
          {barChartData && <BarChart {...barChartData} />}
          {stackedChartData && <StackedChartLabels {...stackedChartData} />}
        </div>
      </div>
    </section>
  );
};

export default ChartComponent;
