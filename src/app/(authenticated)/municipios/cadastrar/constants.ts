import { ColorsOptions } from "@/common/entities/colors";

export const inputsData = [
  {
    name: "name",
    label: "Nome do município"
  },
  {
    name: "email",
    label: "Email"
  },
  {
    name: "password",
    label: "Senha"
  },
  {
    name: "facilitatorName",
    label: "Nome do facilitador"
  },
  {
    name: "supportEmail",
    label: "Email pra contato (população)"
  },
  {
    name: "landfillDelivery",
    label: "Custo de entrega no aterro (R$/ton)"
  },
  {
    name: "fuel",
    label: "Custo do combustível (R$/L)"
  },
  {
    name: "status",
    label: "Status do município"
  }
];

export type ColorType = {
  name: ColorsOptions;
  hex: string;
};

export const colors: ColorType[] = [
  { name: "red", hex: "#AD0000" },
  { name: "green", hex: "#008000" },
  { name: "blue", hex: "#0000FF" },
  { name: "orange", hex: "#FF6B00" }
];
