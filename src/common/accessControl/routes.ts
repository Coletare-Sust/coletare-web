import type { PermissionRule } from "./permissions";

export interface RouteAccessRule {
  path: string;
  permissions: PermissionRule[];
}

export const routeAccessRules: RouteAccessRule[] = [
  { path: "/dashboard/inserir-dados", permissions: ["COLLECT_CREATE"] },
  { path: "/dashboard", permissions: ["METRICS_DASHBOARD_READ"] },
  { path: "/rotas-andamento", permissions: ["COLLECT_LOCATION_SEND"] },
  { path: "/rotas", permissions: ["ROUTE_READ"] },
  { path: "/rota", permissions: ["COLLECT_READ"] },
  { path: "/criar-rota", permissions: ["ROUTE_CREATE"] },
  { path: "/ecopontos/criar-ecoponto", permissions: ["ECOPOINT_CREATE"] },
  { path: "/ecopontos", permissions: ["ECOPOINT_READ"] },
  { path: "/solicitacoes-retirada", permissions: ["WITHDRAWAL_REQUEST_READ"] },
  {
    path: "/veiculos-colaboradores",
    permissions: [["VEHICLE_READ", "EMPLOYEE_READ"]]
  },
  { path: "/cadastrar-veiculo", permissions: ["VEHICLE_CREATE"] },
  { path: "/cadastrar-colaborador", permissions: ["EMPLOYEE_CREATE"] },
  { path: "/avisos/cadastrar", permissions: ["WARNING_CREATE"] },
  { path: "/avisos", permissions: ["WARNING_READ"] },
  { path: "/municipios/cadastrar", permissions: ["CITY_CREATE"] },
  { path: "/municipios", permissions: ["CITY_READ"] },
  {
    path: "/permissoes",
    permissions: [
      "RBAC_PERMISSION_READ",
      "RBAC_USER_PERMISSION_READ",
      "RBAC_USER_PERMISSION_UPDATE"
    ]
  }
];

export function getRouteAccessRule(pathname: string) {
  return routeAccessRules.find(
    (rule) => pathname === rule.path || pathname.startsWith(`${rule.path}/`)
  );
}
