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
    <div className="flex h-full w-full gap-8">
      <div className="w-[75%]">
        <StackedChart
          chartData={chartData}
          labelsX={labelsX}
          className={className}
          barThickness={barThickness}
        />
      </div>
      <div className="w-[25%] space-y-[30px] font-barlow">
        {chartData.map((data, key) => (
          <div
            key={key}
            className="mt-8 flex flex-shrink-0 items-center gap-3 text-[20px] font-medium text-greenBlue-1000"
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
