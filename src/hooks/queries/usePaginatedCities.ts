import { useQuery } from "@tanstack/react-query";

import {
  ONE_DAY_IN_MS,
  FIFTEEN_MINUTES_IN_MS,
} from "@common/constants/generic";
import type { PageEntity } from "@/common/entities/pagination";
import type { UserEntity } from "@/common/entities/user";
import { getCitiesPage } from "@/store/services/user";

export default function usePaginatedCities(
  page = 0,
  size = 10,
  filters?: { name?: string },
) {
  return useQuery<PageEntity<UserEntity> | null>(
    ["cities", "page", page, size, filters?.name ?? ""],
    () => getCitiesPage(page, size, filters),
    {
      keepPreviousData: true,
      staleTime: FIFTEEN_MINUTES_IN_MS,
      cacheTime: ONE_DAY_IN_MS,
    },
  );
}
