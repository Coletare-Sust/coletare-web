import { apiFetch } from "@/utils/apiFetch";

export interface PermissionDTO {
  key: string;
  module: string;
  label: string;
  description: string;
}

export interface UserPermissionsDTO {
  userId: string;
  profile: string;
  effectivePermissions: string[];
  extraPermissions: string[];
  revokedPermissions: string[];
}

export interface UpdateUserPermissionsInput {
  extraPermissions: string[];
  revokedPermissions: string[];
}

export const getPermissions = async (): Promise<PermissionDTO[]> => {
  return apiFetch<PermissionDTO[]>("/access/permissions");
};

export const getUserPermissions = async (
  userId: string
): Promise<UserPermissionsDTO> => {
  return apiFetch<UserPermissionsDTO>(`/access/users/${userId}/permissions`);
};

export const updateUserPermissions = async (
  userId: string,
  input: UpdateUserPermissionsInput
): Promise<UserPermissionsDTO> => {
  return apiFetch<UserPermissionsDTO>(`/access/users/${userId}/permissions`, {
    method: "PUT",
    body: JSON.stringify(input)
  });
};
