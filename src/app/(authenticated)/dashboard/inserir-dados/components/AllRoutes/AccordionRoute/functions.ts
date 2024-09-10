import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Timestamp } from "firebase/firestore";

export const getProperties = (
  city: string,
  date: Timestamp,
  residueType: string
) => {
  return [
    {
      prop: "Cidade",
      answer: city
    },
    {
      prop: "Data",
      answer: format(date.seconds * 1000, "P", { locale: ptBR })
    },
    { prop: "Tipo de residuo", answer: residueType }
  ];
};
