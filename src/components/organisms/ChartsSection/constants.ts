import { getYear } from "./functions";

export const costsRelation = (
  dataLandfill: number[] | undefined | null,
  dataFuel: number[] | undefined | null
) => ({
  labelsX: getYear(),
  chartData: [
    {
      label: "Custo entrega aterro",
      data: dataLandfill ?? (Array.from({ length: 12 }).fill(0) as number[]),
      color: "pink"
    },
    {
      label: "Consumo de combustivel",
      data: dataFuel ?? (Array.from({ length: 12 }).fill(0) as number[]),
      color: "purple"
    }
  ]
});

export const collectedMass = (data: number[] | undefined | null) => ({
  labelsX: getYear(),
  chartData: data ?? (Array.from({ length: 12 }).fill(0) as number[])
});

export const emissionsData = (data: number[] | undefined | null) => ({
  labelsX: getYear(),
  chartData: data ?? (Array.from({ length: 12 }).fill(0) as number[])
});
