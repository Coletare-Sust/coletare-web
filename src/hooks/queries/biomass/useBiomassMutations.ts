import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  registerCollectBiomass,
  removeCollectBiomass,
  RegisterBiomassInput
} from "@/store/services/biomass";
import { biomassKey } from "./useCollectBiomass";

export function useRegisterBiomass(collectId: string) {
  const queryClient = useQueryClient();
  return useMutation(
    (body: RegisterBiomassInput) => registerCollectBiomass(collectId, body),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(biomassKey(collectId));
        queryClient.invalidateQueries(["collects"]);
        queryClient.invalidateQueries(["dashboard"]);
      }
    }
  );
}

export function useRemoveBiomass(collectId: string) {
  const queryClient = useQueryClient();
  return useMutation(() => removeCollectBiomass(collectId), {
    onSuccess: () => {
      queryClient.invalidateQueries(biomassKey(collectId));
    }
  });
}
