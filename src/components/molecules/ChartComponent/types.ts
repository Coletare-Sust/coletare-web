import { StackedChartProps } from "@atoms/StackedChart/types";
import { BarChartProps } from "@atoms/BarChart/types";
import React from "react";

export interface ChartComponentProps {
  title: string;
  dropdownOptions: { label: string; onClick: () => void }[];
  barChartData?: BarChartProps;
  stackedChartData?: StackedChartProps;
}
