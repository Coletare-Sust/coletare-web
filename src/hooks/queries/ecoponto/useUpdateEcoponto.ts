import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateEcoponto } from "@/store/services/ecopoint";
import { getAllEcopontosQueryKey } from "./useAllEcopontos";

export default function useUpdateEcoponto(cityId: string) {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, body }: { id: string; body: any }) => updateEcoponto(id, body),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(getAllEcopontosQueryKey(cityId));
      }
    }
  );
}
