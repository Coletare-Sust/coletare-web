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
      <div className="flex items-center justify-between">
        <Subtitle className="text-[24px] font-semibold text-greenBlue-1000">
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
      <div className="bg-white-800 py-[52px]">
        <div className="m-auto h-[300px] w-[1377px]">
          {barChartData && <BarChart {...barChartData} />}
          {stackedChartData && <StackedChartLabels {...stackedChartData} />}
        </div>
      </div>
    </section>
  );
};

export default ChartComponent;
