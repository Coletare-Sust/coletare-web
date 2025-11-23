import DashboardIcon from "@atoms/Icons/DashboardIcon";
import MapIcon from "@atoms/Icons/MapIcon";
import TrashIcon from "@atoms/Icons/TrashIcon";
import TruckIcon from "@atoms/Icons/TruckIcon";
import BellIcon from "@atoms/Icons/BellIcon";
import { renderToString } from "react-dom/server";
import { RecycleIcon } from "lucide-react";

export const linksCity = [
  {
    label: "Dashboard",
    url: "/dashboard",
    icon: (color?: string) => {
      const svgString = renderToString(<DashboardIcon color={color} />);
      return `data:image/svg+xml;base64,${Buffer.from(svgString).toString(
        "base64"
      )}`;
    },
    alertNumber: -1
  },
  {
    label: "Cadastrar rota",
    url: "/rotas",
    icon: (color?: string) => {
      const svgString = renderToString(<MapIcon color={color} />);
      return `data:image/svg+xml;base64,${Buffer.from(svgString).toString(
        "base64"
      )}`;
    },
    alertNumber: -1
  },
  {
    label: "Cadastrar ecopontos",
    url: "/ecopontos",
    icon: (color?: string) => {
      const svgString = renderToString(<RecycleIcon color={color} />);
      return `data:image/svg+xml;base64,${Buffer.from(svgString).toString(
        "base64"
      )}`;
    },
    alertNumber: -1
  },
  {
    label: "Solicitação de retirada de lixo ",
    url: "/solicitacoes-retirada",
    icon: (color?: string) => {
      const svgString = renderToString(<TrashIcon color={color} />);
      return `data:image/svg+xml;base64,${Buffer.from(svgString).toString(
        "base64"
      )}`;
    },
    alertNumber: -1
  },
  {
    label: "Veículos e colaboradores",
    url: "/veiculos-colaboradores",
    icon: (color?: string) => {
      const svgString = renderToString(<TruckIcon color={color} />);
      return `data:image/svg+xml;base64,${Buffer.from(svgString).toString(
        "base64"
      )}`;
    },
    alertNumber: -1
  },
  {
    label: "Avisos",
    url: "/avisos",
    icon: (color?: string) => {
      const svgString = renderToString(<BellIcon color={color} />);
      return `data:image/svg+xml;base64,${Buffer.from(svgString).toString(
        "base64"
      )}`;
    },
    alertNumber: -1
  }
];

export const linksAdmin = [
  {
    label: "Dashboard",
    url: "/dashboard",
    icon: (color?: string) => {
      const svgString = renderToString(<DashboardIcon color={color} />);
      return `data:image/svg+xml;base64,${Buffer.from(svgString).toString(
        "base64"
      )}`;
    },
    alertNumber: -1
  },
  {
    label: "Todas as rotas",
    url: "/rotas",
    icon: (color?: string) => {
      const svgString = renderToString(<MapIcon color={color} />);
      return `data:image/svg+xml;base64,${Buffer.from(svgString).toString(
        "base64"
      )}`;
    },
    alertNumber: -1
  },

  {
    label: "Retirada de lixo ",
    url: "/solicitacoes-retirada",
    icon: (color?: string) => {
      const svgString = renderToString(<TrashIcon color={color} />);
      return `data:image/svg+xml;base64,${Buffer.from(svgString).toString(
        "base64"
      )}`;
    },
    alertNumber: -1
  },
  {
    label: "Municípios",
    url: "/municipios",
    icon: (color?: string) => {
      const svgString = renderToString(<TruckIcon color={color} />);
      return `data:image/svg+xml;base64,${Buffer.from(svgString).toString(
        "base64"
      )}`;
    },
    alertNumber: -1
  }
];

export const colors = [
  { name: "red", hex: "#AD0000" },
  { name: "green", hex: "#008000" },
  { name: "blue", hex: "#0000FF" },
  { name: "orange", hex: "#FF6B00" }
];
