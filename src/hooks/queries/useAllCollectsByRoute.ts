import { useQuery } from "@tanstack/react-query";
import { ONE_DAY_IN_MS, FORTY_FIVE_MINUTES_IN_MS } from "@common/constants/generic";
import type { CollectEntity } from "@common/entities/Collect";
import { getAllCollectsByRoute } from "@/store/services/collects";

export function getAllCollectsQueryKey(routeId: string) {
  return ["collects", routeId];
}

export const getAllCollectsQueryFn = (routeId: string) => {
  return () => getAllCollectsByRoute(routeId);
};

const useAllCollectsByRoute = <T = CollectEntity[]>(
  routeId: string,
  select?: (data: CollectEntity[]) => T
) => {
  return useQuery(
    getAllCollectsQueryKey(routeId),
    getAllCollectsQueryFn(routeId),
    {
      select,
      staleTime: FORTY_FIVE_MINUTES_IN_MS,
      cacheTime: ONE_DAY_IN_MS
    }
  );
};

export default useAllCollectsByRoute;
