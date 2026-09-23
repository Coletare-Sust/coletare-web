import { useQuery } from "@tanstack/react-query";

import {
  ONE_DAY_IN_MS,
  FIFTEEN_MINUTES_IN_MS,
} from "@common/constants/generic";
import type { PageEntity } from "@/common/entities/pagination";
import type { RouteEntity } from "@/common/entities/route";
import { getRoutesPage } from "@/store/services/route";

export function getPaginatedRoutesQueryKey(
  cityId: string,
  page: number,
  size: number,
  name?: string,
) {
  return ["routes", cityId, "page", page, size, name ?? ""];
}

const usePaginatedRoutes = (
  cityId: string,
  page = 0,
  size = 10,
  name?: string,
) => {
  return useQuery<PageEntity<RouteEntity> | null>(
    getPaginatedRoutesQueryKey(cityId, page, size, name),
    () => getRoutesPage(cityId, page, size, name),
    {
      enabled: Boolean(cityId),
      keepPreviousData: true,
      staleTime: FIFTEEN_MINUTES_IN_MS,
      cacheTime: ONE_DAY_IN_MS,
    },
  );
};

export default usePaginatedRoutes;
