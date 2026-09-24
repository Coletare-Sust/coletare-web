import { useQuery } from "@tanstack/react-query";

import {
  ONE_DAY_IN_MS,
  FORTY_FIVE_MINUTES_IN_MS
} from "@common/constants/generic";

import type { CollectEntity } from "@common/entities/Collect";
import { getAllCollectsByRoute } from "@/store/services/collects";
import { DocumentData } from "firebase/firestore";

// Get de todas as cidades (que no caso são users).

export function getAllCollectsQueryKey(routeId: string) {
  return ["collects", routeId];
}

export const getAllCollectsQueryFn = (routeId: string) => {
  return () => getAllCollectsByRoute(routeId);
};

const useAllCollectsByRoute = <T = CollectEntity[]>(
  routeId: string,
  select?: (data: DocumentData) => T,
  enabled = true
) => {
  return useQuery(
    getAllCollectsQueryKey(routeId),
    getAllCollectsQueryFn(routeId),
    {
      select,
      enabled: Boolean(routeId) && enabled,
      staleTime: FORTY_FIVE_MINUTES_IN_MS,
      cacheTime: ONE_DAY_IN_MS
    }
  );
};

export default useAllCollectsByRoute;
