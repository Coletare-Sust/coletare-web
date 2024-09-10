export interface LineChartProps {
  labelsX?: string[];
  chartData: {
    label: string;
    data: number[];
    color: string;
  }[];
  className?: string;
}
