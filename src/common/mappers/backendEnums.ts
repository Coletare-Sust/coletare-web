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

// ---------- DisposalSiteType ----------

export const DISPOSAL_SITE_TYPE_LABELS: Record<string, string> = {
  LANDFILL: "Aterro sanitário",
  COMPOSTING: "Compostagem",
  BIODIGESTER: "Biodigestor",
  SORTING_CENTER: "Central de triagem",
  OTHER: "Outro"
};

export function getDisposalSiteTypeLabel(backendValue: string): string {
  return DISPOSAL_SITE_TYPE_LABELS[backendValue] ?? backendValue;
}

// ---------- ResidueType ----------

export const RESIDUE_TYPE_LABELS: Record<string, string> = {
  RECYCLED: "Recicláveis",
  MIX: "Resíduos Mistos (Mix)",
  CONSTRUCTION: "Resíduos de Construção",
  NORMAL: "Resíduo Comum",
  PRUNING: "Resíduos de Podas",
  HIGH_VOLUMES: "Grandes Volumes",
  ELECTRONICS: "Eletroeletrônicos"
};

export const DEFAULT_RESIDUE_TYPE = "NORMAL";

export function getResidueTypeLabel(backendValue: string): string {
  return RESIDUE_TYPE_LABELS[backendValue] ?? backendValue;
}

/**
 * Converte uma chave do enum ou uma label (sem diferenciar maiúsculas) para a chave do enum
 * que o backend aceita (ResidueType.valueOf). Retorna undefined se não reconhecer.
 */
export function toResidueTypeKey(
  value: string | null | undefined
): string | undefined {
  if (!value) return undefined;
  if (value in RESIDUE_TYPE_LABELS) return value;

  const normalized = value.trim().toLowerCase();
  return Object.keys(RESIDUE_TYPE_LABELS).find(
    (key) => RESIDUE_TYPE_LABELS[key].toLowerCase() === normalized
  );
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
