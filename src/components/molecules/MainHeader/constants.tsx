import DashboardIcon from "@atoms/Icons/DashboardIcon";
import MapIcon from "@atoms/Icons/MapIcon";
import TrashIcon from "@atoms/Icons/TrashIcon";
import TruckIcon from "@atoms/Icons/TruckIcon";
import BellIcon from "@atoms/Icons/BellIcon";
import { renderToString } from "react-dom/server";
import { Factory, KeyRound, Plug, RecycleIcon } from "lucide-react";
import ColaboratorIcon from "@/components/atoms/Icons/ColaboratorIcon";
import type { PermissionRule } from "@/common/accessControl/permissions";

export type NavigationLink = {
  label: string;
  url: string;
  icon: (color?: string) => string;
  alertNumber: number;
  hiddenInSidebar: boolean;
  permissions: PermissionRule[];
};

export const linksCity: NavigationLink[] = [
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
    hiddenInSidebar: false,
    permissions: ["METRICS_DASHBOARD_READ"]
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
    hiddenInSidebar: false,
    permissions: ["COLLECT_READ"]
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
    hiddenInSidebar: false,
    permissions: ["ROUTE_READ"]
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
    hiddenInSidebar: true,
    permissions: ["ROUTE_CREATE"]
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
    hiddenInSidebar: false,
    permissions: ["ECOPOINT_READ"]
  },
  {
    label: "Destinos de resíduos",
    url: "/destinos",
    icon: (color?: string) => {
      const svgString = renderToString(<Factory color={color} />);
      return `data:image/svg+xml;base64,${Buffer.from(svgString).toString(
        "base64"
      )}`;
    },
    alertNumber: -1,
    hiddenInSidebar: false,
    permissions: ["DISPOSAL_SITE_READ"]
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
    hiddenInSidebar: false,
    permissions: ["WITHDRAWAL_REQUEST_READ"]
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
    hiddenInSidebar: false,
    permissions: [["VEHICLE_READ", "EMPLOYEE_READ"]]
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
    hiddenInSidebar: true,
    permissions: ["VEHICLE_CREATE"]
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
    hiddenInSidebar: true,
    permissions: ["EMPLOYEE_CREATE"]
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
    hiddenInSidebar: false,
    permissions: ["WARNING_READ"]
  }
];

export const linksAdmin: NavigationLink[] = [
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
    hiddenInSidebar: false,
    permissions: ["METRICS_DASHBOARD_READ"]
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
    hiddenInSidebar: false,
    permissions: ["ROUTE_READ"]
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
    hiddenInSidebar: false,
    permissions: ["WITHDRAWAL_REQUEST_READ"]
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
    hiddenInSidebar: false,
    permissions: ["CITY_READ"]
  },
  {
    label: "Integrações",
    url: "/integracoes",
    icon: (color?: string) => {
      const svgString = renderToString(<Plug color={color} />);
      return `data:image/svg+xml;base64,${Buffer.from(svgString).toString(
        "base64"
      )}`;
    },
    alertNumber: -1,
    hiddenInSidebar: false,
    permissions: ["INTEGRATION_CLIENT_READ"]
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
    hiddenInSidebar: false,
    permissions: [
      "RBAC_PERMISSION_READ",
      "RBAC_USER_PERMISSION_READ",
      "RBAC_USER_PERMISSION_UPDATE"
    ]
  }
];

export const colors = [
  { name: "red", hex: "#AD0000" },
  { name: "green", hex: "#008000" },
  { name: "blue", hex: "#0000FF" },
  { name: "orange", hex: "#FF6B00" }
];
