import React from "react";
import StackedChart from "@atoms/StackedChart/StackedChart";
import { StackedChartProps } from "@atoms/StackedChart/types";

const StackedChartLabels = ({
  labelsX,
  chartData,
  className,
  barThickness
}: StackedChartProps) => {
  return (
    <div className="flex h-full w-full flex-col gap-4 lg:flex-row lg:gap-8">
      <div className="min-h-0 flex-1 lg:w-[75%] lg:flex-none">
        <StackedChart
          chartData={chartData}
          labelsX={labelsX}
          className={className}
          barThickness={barThickness}
        />
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 font-barlow lg:w-[25%] lg:flex-col lg:flex-nowrap lg:gap-0 lg:space-y-[30px]">
        {chartData.map((data, key) => (
          <div
            key={key}
            className="flex flex-shrink-0 items-center gap-3 text-base font-medium text-greenBlue-1000 sm:text-lg lg:mt-8 lg:text-[20px]"
          >
            <span
              className="h-[29px] w-[34px]"
              style={{ backgroundColor: data.color }}
            ></span>
            <span className="whitespace-none">{data.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StackedChartLabels;
