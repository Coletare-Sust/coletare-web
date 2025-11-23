import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEcoponto } from "@/store/services/ecopoint";
import { getAllEcopontosQueryKey } from "./useAllEcopontos";

export default function useCreateEcoponto(cityId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: any) => createEcoponto(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getAllEcopontosQueryKey(cityId)
      });
    }
  });
}
