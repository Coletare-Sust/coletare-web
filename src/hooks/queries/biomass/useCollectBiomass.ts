import { useQuery } from "@tanstack/react-query";
import { getCollectBiomass } from "@/store/services/biomass";

export const biomassKey = (collectId: string) => ["biomass", collectId];

export default function useCollectBiomass(collectId: string, enabled = true) {
  return useQuery(biomassKey(collectId), () => getCollectBiomass(collectId), {
    enabled: Boolean(collectId) && enabled,
    retry: false
  });
}
