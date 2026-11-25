import { apiFetch } from "@/utils/apiFetch";

// ---------- Backend DTOs (/admin/integrations, só PLATFORM_ADMIN) ----------

export type IntegrationEnvironment = "LIVE" | "TEST";
export type IntegrationClientStatus = "ACTIVE" | "SUSPENDED";
export type IntegrationScope = "BIOMASS_READ";

export interface IntegrationClient {
  id: string;
  name: string;
  ownerEmails: string[];
  allowedCityIds: string[];
  scopes: IntegrationScope[];
  environment: IntegrationEnvironment;
  status: IntegrationClientStatus;
  ipAllowlist: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIntegrationClientInput {
  name: string;
  ownerEmails: string[];
  allowedCityIds: string[];
  scopes: IntegrationScope[];
  environment: IntegrationEnvironment;
  ipAllowlist: string[];
}

export type UpdateIntegrationClientInput = Partial<
  Omit<CreateIntegrationClientInput, "environment">
> & { status?: IntegrationClientStatus };

export interface ApiKeyInfo {
  keyId: string;
  prefix: string;
  last4: string;
  environment: IntegrationEnvironment;
  status: string;
  createdAt: string;
  expiresAt: string;
  revokedAt: string | null;
  lastUsedAt: string | null;
  lastUsedIp: string | null;
  rotatedFromKeyId: string | null;
}

/** A `apiKey` só existe nesta resposta: o backend guarda apenas o hash. */
export interface IssuedApiKey {
  key: ApiKeyInfo;
  apiKey: string;
  notice: string;
}

// ---------- Services ----------

const base = "/admin/integrations";

export const getIntegrationClients = () =>
  apiFetch<IntegrationClient[]>(`${base}/clients`);

export const createIntegrationClient = (input: CreateIntegrationClientInput) =>
  apiFetch<IntegrationClient>(`${base}/clients`, {
    method: "POST",
    body: JSON.stringify(input)
  });

export const updateIntegrationClient = (
  clientId: string,
  input: UpdateIntegrationClientInput
) =>
  apiFetch<IntegrationClient>(`${base}/clients/${clientId}`, {
    method: "PUT",
    body: JSON.stringify(input)
  });

export const getApiKeys = (clientId: string) =>
  apiFetch<ApiKeyInfo[]>(`${base}/clients/${clientId}/keys`);

export const issueApiKey = (clientId: string, ttlDays?: number) =>
  apiFetch<IssuedApiKey>(`${base}/clients/${clientId}/keys`, {
    method: "POST",
    body: JSON.stringify(ttlDays ? { ttlDays } : {})
  });

export const rotateApiKey = (clientId: string, keyId: string) =>
  apiFetch<IssuedApiKey>(`${base}/clients/${clientId}/keys/${keyId}/rotate`, {
    method: "POST"
  });

export const revokeApiKey = async (clientId: string, keyId: string) => {
  await apiFetch(`${base}/clients/${clientId}/keys/${keyId}`, {
    method: "DELETE"
  });
};
