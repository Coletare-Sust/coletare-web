import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDisposalSite } from "@/store/services/disposalSite";
import { disposalSitesKey } from "./useAllDisposalSites";

export default function useDeleteDisposalSite(cityId: string) {
  const queryClient = useQueryClient();
  return useMutation((id: string) => deleteDisposalSite(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(disposalSitesKey(cityId));
    }
  });
}
