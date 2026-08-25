import DashboardIcon from "@atoms/Icons/DashboardIcon";
import MapIcon from "@atoms/Icons/MapIcon";
import TrashIcon from "@atoms/Icons/TrashIcon";
import TruckIcon from "@atoms/Icons/TruckIcon";
import BellIcon from "@atoms/Icons/BellIcon";
import { renderToString } from "react-dom/server";
import { KeyRound, RecycleIcon } from "lucide-react";
import ColaboratorIcon from "@/components/atoms/Icons/ColaboratorIcon";

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
    alertNumber: -1,
    hiddenInSidebar: false
  },
  {
    label: "Rotas em tempo real",
    url: "/rotas-andamento",
    icon: (color?: string) => {
      const svgString = renderToString(<TruckIcon color={color} />);
      return `data:image/svg+xml;base64,${Buffer.from(svgString).toString(
        "base64"
      )}`;
    },
    alertNumber: -1,
    hiddenInSidebar: false
  },
  {
    label: "Visualizar rota",
    url: "/rotas",
    icon: (color?: string) => {
      const svgString = renderToString(<MapIcon color={color} />);
      return `data:image/svg+xml;base64,${Buffer.from(svgString).toString(
        "base64"
      )}`;
    },
    alertNumber: -1,
    hiddenInSidebar: false
  },
  {
    label: "Cadastrar rota",
    url: "/criar-rota",
    icon: (color?: string) => {
      const svgString = renderToString(<MapIcon color={color} />);
      return `data:image/svg+xml;base64,${Buffer.from(svgString).toString(
        "base64"
      )}`;
    },
    alertNumber: -1,
    hiddenInSidebar: true
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
    alertNumber: -1,
    hiddenInSidebar: false
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
    alertNumber: -1,
    hiddenInSidebar: false
  },
  {
    label: "Colaboradores e veículos",
    url: "/veiculos-colaboradores",
    icon: (color?: string) => {
      const svgString = renderToString(<ColaboratorIcon color={color} />);
      return `data:image/svg+xml;base64,${Buffer.from(svgString).toString(
        "base64"
      )}`;
    },
    alertNumber: -1,
    hiddenInSidebar: false
  },
  {
    label: "Cadastrar novo veículo",
    url: "/cadastrar-veiculo",
    icon: (color?: string) => {
      const svgString = renderToString(<ColaboratorIcon color={color} />);
      return `data:image/svg+xml;base64,${Buffer.from(svgString).toString(
        "base64"
      )}`;
    },
    alertNumber: -1,
    hiddenInSidebar: true
  },
  {
    label: "Cadastrar novo colaborador",
    url: "/cadastrar-colaborador",
    icon: (color?: string) => {
      const svgString = renderToString(<ColaboratorIcon color={color} />);
      return `data:image/svg+xml;base64,${Buffer.from(svgString).toString(
        "base64"
      )}`;
    },
    alertNumber: -1,
    hiddenInSidebar: true
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
    alertNumber: -1,
    hiddenInSidebar: false
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
    alertNumber: -1,
    hiddenInSidebar: false
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
    alertNumber: -1,
    hiddenInSidebar: false
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
    alertNumber: -1,
    hiddenInSidebar: false
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
    alertNumber: -1,
    hiddenInSidebar: false
  },
  {
    label: "Permissoes",
    url: "/permissoes",
    icon: (color?: string) => {
      const svgString = renderToString(<KeyRound color={color} />);
      return `data:image/svg+xml;base64,${Buffer.from(svgString).toString(
        "base64"
      )}`;
    },
    alertNumber: -1,
    hiddenInSidebar: false
  }
];

export const colors = [
  { name: "red", hex: "#AD0000" },
  { name: "green", hex: "#008000" },
  { name: "blue", hex: "#0000FF" },
  { name: "orange", hex: "#FF6B00" }
];
