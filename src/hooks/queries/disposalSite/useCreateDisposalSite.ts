import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createDisposalSite,
  DisposalSiteInput
} from "@/store/services/disposalSite";
import { disposalSitesKey } from "./useAllDisposalSites";

export default function useCreateDisposalSite(cityId: string) {
  const queryClient = useQueryClient();
  return useMutation(
    (body: DisposalSiteInput) => createDisposalSite(cityId, body),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(disposalSitesKey(cityId));
      }
    }
  );
}
