import { useQuery } from "@tanstack/react-query";

import {
  ONE_DAY_IN_MS,
  FIFTEEN_MINUTES_IN_MS,
} from "@common/constants/generic";
import type { PageEntity } from "@/common/entities/pagination";
import type { UserEntity } from "@/common/entities/user";
import { getVehiclesPage } from "@/store/services/user";

export interface PaginatedVehiclesFilters {
  name?: string;
  carPlate?: string;
}

export default function usePaginatedVehicles(
  cityId: string,
  page = 0,
  size = 10,
  filters?: PaginatedVehiclesFilters,
) {
  return useQuery<PageEntity<UserEntity> | null>(
    [
      "vehicles",
      cityId,
      "page",
      page,
      size,
      filters?.name ?? "",
      filters?.carPlate ?? "",
    ],
    () => getVehiclesPage(cityId, page, size, filters),
    {
      enabled: Boolean(cityId),
      keepPreviousData: true,
      staleTime: FIFTEEN_MINUTES_IN_MS,
      cacheTime: ONE_DAY_IN_MS,
    },
  );
}
