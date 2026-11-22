import { useQuery } from "@tanstack/react-query";
import {
  ONE_DAY_IN_MS,
  FIFTEEN_MINUTES_IN_MS
} from "@common/constants/generic";
import { getDisposalSitesByCity } from "@/store/services/disposalSite";

export const disposalSitesKey = (cityId: string) => ["disposal-sites", cityId];

export default function useAllDisposalSites(cityId: string) {
  return useQuery(
    disposalSitesKey(cityId),
    () => getDisposalSitesByCity(cityId),
    {
      enabled: Boolean(cityId),
      staleTime: FIFTEEN_MINUTES_IN_MS,
      cacheTime: ONE_DAY_IN_MS
    }
  );
}
