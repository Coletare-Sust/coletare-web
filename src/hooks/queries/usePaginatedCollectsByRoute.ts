import { useQuery } from "@tanstack/react-query";

import {
  ONE_DAY_IN_MS,
  FORTY_FIVE_MINUTES_IN_MS
} from "@common/constants/generic";
import type { CollectEntity } from "@common/entities/Collect";
import type { PageEntity } from "@common/entities/pagination";
import { getCollectsPageByRoute } from "@/store/services/collects";

export function getPaginatedCollectsByRouteQueryKey(
  routeId: string,
  page: number,
  size: number
) {
  return ["collects", routeId, "page", page, size];
}

const usePaginatedCollectsByRoute = (
  routeId: string,
  page = 0,
  size = 10,
  enabled = true
) => {
  return useQuery<PageEntity<CollectEntity> | null>(
    getPaginatedCollectsByRouteQueryKey(routeId, page, size),
    () => getCollectsPageByRoute(routeId, page, size),
    {
      enabled: Boolean(routeId) && enabled,
      keepPreviousData: true,
      staleTime: FORTY_FIVE_MINUTES_IN_MS,
      cacheTime: ONE_DAY_IN_MS
    }
  );
};

export default usePaginatedCollectsByRoute;
