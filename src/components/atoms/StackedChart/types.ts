export interface StackedChartProps {
  labelsX?: string[];
  chartData: {
    label: string;
    data: number[];
    color: string;
  }[]; // cada um marca um subitem dentro do chart ---> só aceita um array com dois elemntos
  className?: string;
  barThickness?: number;
}
