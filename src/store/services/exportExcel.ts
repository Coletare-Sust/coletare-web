/* eslint-disable @typescript-eslint/no-explicit-any */
import XLSX from "sheetjs-style";
import * as FileSaver from "file-saver";
import { errorToast } from "@/hooks/useAppToast";

interface ExportJson {
  Rota: string | undefined;
  "Tipo de resíduo": string | undefined;
  Data: string | undefined;
  "Horário de partida": string | undefined;
  "Km Rodados (km)": string | undefined;
  "Duração (horas)": string | undefined;

  "Massa coletada (ton)": string | undefined;
  "Emissão específica (kgCO2eq/L)": string | undefined;
  "Consumo específico (L/km)": string | undefined;
  "Custo entrega no aterro (R$/ton)": string | undefined;
  "Custo de combustível (R$/L)": string | undefined;

  "Velocidade média (km/h)": string | undefined;
  "Emissões (kgCO2eq)": string | undefined;
  "Consumo de combustível (L)": string | undefined;
  "Custo (R$)": string | undefined;
}

const dataFromApp = [
  "Rota",
  "Tipo de resíduo",
  "Data",
  "Horário de partida",
  "Km Rodados (km)",
  "Duração (horas)"
];

const dataFromAdmin = [
  "Massa coletada (ton)",
  "Emissão específica (kgCO2eq/L)",
  "Consumo específico (L/km)",
  "Custo entrega no aterro (R$/ton)",
  "Custo de combustível (R$/L)"
];

export const exportExcel = (excelData: ExportJson[], fileName: string) => {
  if (!excelData || excelData.length === 0) {
    errorToast("Não há dados pra compartilhar!");
    return;
  }

  const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = ".xlsx";
  const ws = XLSX.utils.json_to_sheet(excelData);

  ws["!cols"] = [
    { wch: 20 }, // Rota
    { wch: 20 }, // Tipo de Resíduo
    ...Array.from({ length: Object.keys(excelData[0]).length - 2 }, () => ({
      wch: 12
    }))
  ];

  Object.keys(ws).forEach((key) => {
    if (key !== "!ref" && key !== "!margins") {
      const cell = ws[key];
      if (typeof cell === "object") {
        if (Object.keys(excelData[0]).includes(cell.v)) {
          cell.s = {
            font: { bold: false },
            fill: {
              bgColor: { indexed: 64 },
              fgColor: {
                rgb: dataFromApp.includes(cell.v)
                  ? "D9E2F3"
                  : dataFromAdmin.includes(cell.v)
                  ? "E2EFD9"
                  : "FBE4D5"
              }
            },
            alignment: { horizontal: "left", wrapText: true }
          };
        } else {
          cell.s = {
            font: { bold: false },
            alignment: { horizontal: "right", wrapText: true }
          };
        }
      }
    }
  });

  const excelBuffer = XLSX.write(
    {
      Sheets: { data: ws },
      SheetNames: ["data"]
    },
    { bookType: "xlsx", type: "array" }
  );
  const data = new Blob([excelBuffer], { type: fileType });
  FileSaver.saveAs(data, fileName + fileExtension);
};
