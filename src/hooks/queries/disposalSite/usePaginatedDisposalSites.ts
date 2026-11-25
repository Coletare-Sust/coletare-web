import { useQuery } from "@tanstack/react-query";
import {
  ONE_DAY_IN_MS,
  FIFTEEN_MINUTES_IN_MS
} from "@common/constants/generic";
import type { PageEntity } from "@/common/entities/pagination";
import {
  DisposalSite,
  DisposalSiteFilters,
  getDisposalSitesPage
} from "@/store/services/disposalSite";
import { disposalSitesKey } from "./useAllDisposalSites";

export default function usePaginatedDisposalSites(
  cityId: string,
  page = 0,
  size = 10,
  filters?: DisposalSiteFilters
) {
  return useQuery<PageEntity<DisposalSite> | null>(
    [
      ...disposalSitesKey(cityId),
      "page",
      page,
      size,
      filters?.name ?? "",
      filters?.type ?? "",
      filters?.active ?? ""
    ],
    () => getDisposalSitesPage(cityId, page, size, filters),
    {
      enabled: Boolean(cityId),
      keepPreviousData: true,
      staleTime: FIFTEEN_MINUTES_IN_MS,
      cacheTime: ONE_DAY_IN_MS
    }
  );
}
