import { useQuery } from "@tanstack/react-query";

import {
  ONE_DAY_IN_MS,
  FIFTEEN_MINUTES_IN_MS,
} from "@common/constants/generic";
import type { PageEntity } from "@/common/entities/pagination";
import type { RouteEntity } from "@/common/entities/route";
import { getRoutesPage } from "@/store/services/route";

export interface PaginatedRoutesFilters {
  name?: string;
  residueType?: string;
}

export function getPaginatedRoutesQueryKey(
  cityId: string,
  page: number,
  size: number,
  filters?: PaginatedRoutesFilters,
) {
  return [
    "routes",
    cityId,
    "page",
    page,
    size,
    filters?.name ?? "",
    filters?.residueType ?? "",
  ];
}

const usePaginatedRoutes = (
  cityId: string,
  page = 0,
  size = 10,
  filters?: PaginatedRoutesFilters,
) => {
  return useQuery<PageEntity<RouteEntity> | null>(
    getPaginatedRoutesQueryKey(cityId, page, size, filters),
    () => getRoutesPage(cityId, page, size, filters),
    {
      enabled: Boolean(cityId),
      keepPreviousData: true,
      staleTime: FIFTEEN_MINUTES_IN_MS,
      cacheTime: ONE_DAY_IN_MS,
    },
  );
};

export default usePaginatedRoutes;
