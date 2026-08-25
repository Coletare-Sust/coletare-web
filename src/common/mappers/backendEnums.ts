/**
 * Mappers entre os nomes dos enums Java (backend) e as labels amigáveis em português.
 * Baseados nos enums do backend em:
 *   - modules/logistics/core/domain/enums/WithdrawalRequestType.java
 *   - modules/logistics/core/domain/enums/ResidueType.java
 *   - modules/access/core/domain/enums/UserRole.java
 */

// ---------- WithdrawalRequestType ----------

export const WITHDRAWAL_REQUEST_TYPE_LABELS: Record<string, string> = {
  RESIDENCE: "Residencial",
  INAPPROPRIATE_LOCATION: "Localização Inapropriada"
};

export function getWithdrawalRequestTypeLabel(backendValue: string): string {
  return WITHDRAWAL_REQUEST_TYPE_LABELS[backendValue] ?? backendValue;
}

/** Converte o enum Java para o tipo interno do frontend */
export function normalizeWithdrawalRequestType(
  backendValue: string
): "residence" | "inappropriate-location" {
  return backendValue === "INAPPROPRIATE_LOCATION"
    ? "inappropriate-location"
    : "residence";
}

// ---------- ResidueType ----------

export const RESIDUE_TYPE_LABELS: Record<string, string> = {
  RECYCLED: "Recicláveis",
  MIX: "Resíduos Mistos (Mix)",
  CONSTRUCTION: "Resíduos de Construção",
  NORMAL: "Resíduo Comum",
  PRUNING: "Resíduos de Podas",
  HIGH_VOLUMES: "Grandes Volumes"
};

export function getResidueTypeLabel(backendValue: string): string {
  return RESIDUE_TYPE_LABELS[backendValue] ?? backendValue;
}

// ---------- UserRole ----------

export function normalizeUserRole(
  backendRole: string
): "admin" | "platformAdmin" | "vehicle" | "employee" | "citizen" {
  const map: Record<
    string,
    "admin" | "platformAdmin" | "vehicle" | "employee" | "citizen"
  > = {
    ADMIN: "admin",
    PLATFORM_ADMIN: "platformAdmin",
    VEHICLE: "vehicle",
    EMPLOYEE: "employee",
    CITIZEN: "citizen",
    // já normalizado
    admin: "admin",
    platformAdmin: "platformAdmin",
    vehicle: "vehicle",
    employee: "employee",
    citizen: "citizen"
  };
  return map[backendRole] ?? "citizen";
}
