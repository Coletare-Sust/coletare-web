/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Bar } from "react-chartjs-2";
import * as ChartDataLabelsImport from "chartjs-plugin-datalabels";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ChartDataLabels = (ChartDataLabelsImport as any).default ?? ChartDataLabelsImport;
import "chart.js/auto";
import { twMerge } from "tailwind-merge";
import { monthsArray } from "@/common/constants/chartData";

import { BarChartProps } from "./types";
import { generateColorsBarChart } from "./generateColorsBarChart";

function BarChart({
  barLabel,
  chartData,
  className,
  labelsX = monthsArray,
  barThickness = 50
}: BarChartProps) {
  const bgColors = generateColorsBarChart(chartData.length);
  return (
    <div className={twMerge("h-full w-full", className)}>
      <Bar
        plugins={[ChartDataLabels]}
        data={{
          labels: labelsX,
          datasets: [
            {
              datalabels: {
                display: true,
                anchor: "end",
                clamp: true,
                align: "top",
                formatter: (value) => {
                  return parseFloat(value).toFixed(2).replace(".", ",");
                }
              },
              label: barLabel,
              data: chartData,
              backgroundColor: bgColors,
              borderWidth: 1,
              barThickness // Ajuste aqui a largura das barras conforme necessário
            }
          ]
        }}
        options={{
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              display: true,
              grid: {
                display: false // Não exibir linhas de grade para o eixo X,
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
                display: true, // Exibir linhas de grade para o eixo Y
                drawTicks: false // Não desenhar os ticks do eixo Y
              },
              ticks: {
                color: "#004A55",
                padding: 20,
                font: {
                  size: 18,
                  weight: 500
                }
              }
            }
          },
          maintainAspectRatio: false
        }}
      />
    </div>
  );
}
export default BarChart;
