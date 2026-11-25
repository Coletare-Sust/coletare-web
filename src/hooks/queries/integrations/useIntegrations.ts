import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createIntegrationClient,
  getApiKeys,
  getIntegrationClients,
  issueApiKey,
  revokeApiKey,
  rotateApiKey,
  updateIntegrationClient,
  CreateIntegrationClientInput,
  UpdateIntegrationClientInput
} from "@/store/services/integrations";

const clientsKey = ["integration-clients"];
const keysKey = (clientId: string) => ["integration-keys", clientId];

// Dados sensíveis de gestão: sem cache longo, sempre revalida.
export function useIntegrationClients() {
  return useQuery(clientsKey, getIntegrationClients, { staleTime: 0 });
}

export function useApiKeys(clientId: string, enabled = true) {
  return useQuery(keysKey(clientId), () => getApiKeys(clientId), {
    enabled: Boolean(clientId) && enabled,
    staleTime: 0
  });
}

export function useCreateIntegrationClient() {
  const queryClient = useQueryClient();
  return useMutation(
    (input: CreateIntegrationClientInput) => createIntegrationClient(input),
    { onSuccess: () => queryClient.invalidateQueries(clientsKey) }
  );
}

export function useUpdateIntegrationClient() {
  const queryClient = useQueryClient();
  return useMutation(
    ({
      clientId,
      input
    }: {
      clientId: string;
      input: UpdateIntegrationClientInput;
    }) => updateIntegrationClient(clientId, input),
    { onSuccess: () => queryClient.invalidateQueries(clientsKey) }
  );
}

/**
 * Emitir/rotacionar devolvem a key completa. O resultado NÃO deve ir para o cache do
 * React Query (que é persistido em localStorage): quem chama guarda só em estado local.
 */
export function useIssueApiKey(clientId: string) {
  const queryClient = useQueryClient();
  return useMutation((ttlDays?: number) => issueApiKey(clientId, ttlDays), {
    onSuccess: () => queryClient.invalidateQueries(keysKey(clientId))
  });
}

export function useRotateApiKey(clientId: string) {
  const queryClient = useQueryClient();
  return useMutation((keyId: string) => rotateApiKey(clientId, keyId), {
    onSuccess: () => queryClient.invalidateQueries(keysKey(clientId))
  });
}

export function useRevokeApiKey(clientId: string) {
  const queryClient = useQueryClient();
  return useMutation((keyId: string) => revokeApiKey(clientId, keyId), {
    onSuccess: () => queryClient.invalidateQueries(keysKey(clientId))
  });
}
