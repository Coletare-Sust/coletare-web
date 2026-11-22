import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateDisposalSite,
  DisposalSiteInput
} from "@/store/services/disposalSite";
import { disposalSitesKey } from "./useAllDisposalSites";

export default function useUpdateDisposalSite(cityId: string) {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, body }: { id: string; body: Partial<DisposalSiteInput> }) =>
      updateDisposalSite(id, body),
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries(disposalSitesKey(cityId));
        queryClient.invalidateQueries(["disposal-site", variables.id]);
      }
    }
  );
}
