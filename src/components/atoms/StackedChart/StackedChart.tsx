import { Bar } from "react-chartjs-2";
import { twMerge } from "tailwind-merge";
import * as ChartDataLabelsImport from "chartjs-plugin-datalabels";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ChartDataLabels = (ChartDataLabelsImport as any).default ?? ChartDataLabelsImport;
import { monthsArray } from "@/common/constants/chartData";
import { StackedChartProps } from "./types";

const StackedChart = ({
  className,
  chartData,
  labelsX = monthsArray,
  barThickness = 50
}: StackedChartProps) => {
  return (
    <div className={twMerge("h-full w-full", className)}>
      <Bar
        data={{
          labels: labelsX,
          datasets: chartData.map((item, index) => ({
            datalabels: {
              formatter: function (value: any, context: any) {
                const valA = parseFloat(String(value));
                const valB = parseFloat(
                  String(chartData[0].data[context.dataIndex])
                );

                const total = valA + valB;

                return total.toFixed(2).replace(".", ",");
              },
              display: index === 1,
              anchor: "end",
              clamp: true,
              align: "top"
            },
            label: item.label,
            data: item.data,
            backgroundColor: item.color,
            barThickness,
            stack: "1" // esse valor é somente pra determinar que todos os datasets passados estarão em uma só barra
          }))
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              offset: true,
              display: true,
              grid: {
                display: false
              },
              ticks: {
                color: "#004A55",
                font: {
                  size: 18,
                  weight: 500
                }
              }
            },
            y: {
              grid: {
                display: true,
                drawTicks: false
              },
              ticks: {
                color: "#004A55",
                padding: 20,
                stepSize: 5,
                font: {
                  size: 18,
                  weight: 500
                }
              }
            }
          }
        }}
        plugins={[ChartDataLabels]}
      />
    </div>
  );
};

export default StackedChart;
