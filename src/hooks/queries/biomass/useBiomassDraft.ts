import { useQuery } from "@tanstack/react-query";
import { getBiomassDraft } from "@/store/services/biomass";

export default function useBiomassDraft(collectId: string, enabled = true) {
  return useQuery(
    ["biomass-draft", collectId],
    () => getBiomassDraft(collectId),
    { enabled: Boolean(collectId) && enabled, retry: false, cacheTime: 0 }
  );
}
