import type { UserEntity } from "@/common/entities/user";

export type PermissionKey =
  | "AUTH_ME_READ"
  | "CITY_READ"
  | "CITY_CREATE"
  | "CITY_UPDATE"
  | "CITY_CALC_DATA_UPDATE"
  | "VEHICLE_READ"
  | "VEHICLE_CREATE"
  | "VEHICLE_UPDATE"
  | "VEHICLE_DELETE"
  | "EMPLOYEE_READ"
  | "EMPLOYEE_CREATE"
  | "EMPLOYEE_UPDATE"
  | "EMPLOYEE_DELETE"
  | "CITIZEN_READ"
  | "CITIZEN_CREATE"
  | "CITIZEN_UPDATE"
  | "CITIZEN_DELETE"
  | "USER_READ"
  | "USER_UPDATE"
  | "USER_SELF_UPDATE"
  | "USER_DELETE"
  | "USER_TOKEN_UPDATE"
  | "RBAC_PERMISSION_READ"
  | "RBAC_PROFILE_READ"
  | "RBAC_PROFILE_CREATE"
  | "RBAC_PROFILE_UPDATE"
  | "RBAC_PROFILE_DELETE"
  | "RBAC_USER_PERMISSION_READ"
  | "RBAC_USER_PERMISSION_UPDATE"
  | "ROUTE_READ"
  | "ROUTE_CREATE"
  | "ROUTE_UPDATE"
  | "ROUTE_DELETE"
  | "ROUTE_POLYLINE_CALCULATE"
  | "COLLECT_READ"
  | "COLLECT_CREATE"
  | "COLLECT_UPDATE"
  | "COLLECT_DELETE"
  | "COLLECT_LOCATION_SEND"
  | "WITHDRAWAL_REQUEST_READ"
  | "WITHDRAWAL_REQUEST_READ_OWN"
  | "WITHDRAWAL_REQUEST_CREATE"
  | "WITHDRAWAL_REQUEST_UPDATE"
  | "WITHDRAWAL_REQUEST_DELETE"
  | "WITHDRAWAL_REQUEST_DELETE_OWN"
  | "WARNING_READ"
  | "WARNING_CREATE"
  | "WARNING_UPDATE"
  | "WARNING_DELETE"
  | "ECOPOINT_READ"
  | "ECOPOINT_CREATE"
  | "ECOPOINT_UPDATE"
  | "ECOPOINT_DELETE"
  | "METRICS_DASHBOARD_READ";

export type PermissionRule = PermissionKey | PermissionKey[];

export function hasPermission(
  user: UserEntity | null | undefined,
  permission: PermissionRule,
) {
  if (!user) return false;
  if (user.role === "platformAdmin") return true;

  const userPermissions = new Set(user.permissions ?? []);
  const requiredPermissions = Array.isArray(permission)
    ? permission
    : [permission];

  return requiredPermissions.some((item) => userPermissions.has(item));
}

export function canAccessAll(
  user: UserEntity | null | undefined,
  permissions: PermissionRule[],
) {
  return permissions.every((permission) => hasPermission(user, permission));
}
