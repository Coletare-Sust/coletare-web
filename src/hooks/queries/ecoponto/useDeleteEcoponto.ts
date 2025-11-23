import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteEcoponto } from "@/store/services/ecopoint";
import { getAllEcopontosQueryKey } from "./useAllEcopontos";

export default function useDeleteEcoponto(cityId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEcoponto(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getAllEcopontosQueryKey(cityId)
      });
    }
  });
}
