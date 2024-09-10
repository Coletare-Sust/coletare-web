import { Line } from "react-chartjs-2";
import { twMerge } from "tailwind-merge";
import { monthsArray } from "@/common/constants/chartData";
import { LineChartProps } from "./types";

const LineChart = ({
  chartData,
  className,
  labelsX = monthsArray
}: LineChartProps) => {
  return (
    <div className={twMerge("h-full w-full", className)}>
      <Line
        data={{
          labels: labelsX,
          datasets: chartData.map((line) => ({
            label: line.label,
            data: line.data,
            borderColor: [line.color],
            pointBackgroundColor: [line.color],
            borderWidth: 2,
            fill: false
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
              offset: true,
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
      />
    </div>
  );
};

export default LineChart;
