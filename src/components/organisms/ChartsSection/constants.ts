import { getYear } from "./functions";

export const costsRelation = (
  dataLandfill: number[] | undefined | null,
  dataFuel: number[] | undefined | null
) => ({
  labelsX: getYear(),
  chartData: [
    {
      label: "Custo entrega aterro",
      data: (dataLandfill ?? Array(12).fill(0)).map((num) => Number(num.toFixed(2))),
      color: "#004A55"
    },
    {
      label: "Consumo de combustivel",
      data: (dataFuel ?? Array(12).fill(0)).map((num) => Number(num.toFixed(2))),
      color: "#00ADB4"
    }
  ]
});

export const collectedMass = (data: number[] | undefined | null) => ({
  labelsX: getYear(),
  chartData: data ?? (Array.from({ length: 12 }).fill(0) as number[])
});

export const emissionsData = (data: number[] | undefined | null) => ({
  labelsX: getYear(),
  chartData: (data ?? (Array.from({ length: 12 }).fill(0))).map((num) => Number(num).toFixed(2))
});
