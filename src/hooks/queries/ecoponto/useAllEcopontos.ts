import { getEcopontosByCity } from "@/store/services/ecopoint";
import { useQuery } from "@tanstack/react-query";

export const getAllEcopontosQueryKey = (cityId: string) => [
  "ecopontos",
  cityId
];

export default function useAllEcopontos(cityId: string) {
  return useQuery({
    queryKey: getAllEcopontosQueryKey(cityId),
    queryFn: () => getEcopontosByCity(cityId),
    staleTime: 1000 * 60 * 30,
    cacheTime: 1000 * 60 * 60 * 24,
    enabled: !!cityId
  });
}
