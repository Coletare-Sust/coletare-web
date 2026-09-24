import { useQuery } from "@tanstack/react-query";

import {
  ONE_DAY_IN_MS,
  FIFTEEN_MINUTES_IN_MS
} from "@common/constants/generic";
import type { PageEntity } from "@/common/entities/pagination";
import { Ecoponto, getEcopontosPage } from "@/store/services/ecopoint";

export function getPaginatedEcopontosQueryKey(
  cityId: string,
  page: number,
  size: number,
  filters?: {
    name?: string;
    residueType?: string;
    isActive?: boolean;
  }
) {
  return [
    "ecopontos",
    cityId,
    "page",
    page,
    size,
    filters?.name ?? "",
    filters?.residueType ?? "",
    filters?.isActive ?? ""
  ];
}

export default function usePaginatedEcopontos(
  cityId: string,
  page = 0,
  size = 10,
  filters?: {
    name?: string;
    residueType?: string;
    isActive?: boolean;
  }
) {
  return useQuery<PageEntity<Ecoponto> | null>(
    getPaginatedEcopontosQueryKey(cityId, page, size, filters),
    () => getEcopontosPage(cityId, page, size, filters),
    {
      enabled: Boolean(cityId),
      keepPreviousData: true,
      staleTime: FIFTEEN_MINUTES_IN_MS,
      cacheTime: ONE_DAY_IN_MS
    }
  );
}
