import { useQuery } from "@tanstack/react-query";
import { ONE_DAY_IN_MS, FORTY_FIVE_MINUTES_IN_MS } from "@common/constants/generic";
import { getDashboardData } from "@/store/services/collects";
import { DashboardEntity } from "@/common/entities/dashboard";

export function getDashboardDataQueryKey(cityId: string, routeId: string) {
  return ["dashboard", cityId, routeId];
}

export const getDashboardDataQueryFn = (cityId: string, routeId: string) => {
  return () => getDashboardData(cityId, routeId);
};

const useAllDashboardByRoutes = <T = DashboardEntity | null>(
  cityId: string,
  routeId: string,
  select?: (data: DashboardEntity | null) => T
) => {
  return useQuery(
    getDashboardDataQueryKey(cityId, routeId),
    getDashboardDataQueryFn(cityId, routeId),
    { select, staleTime: FORTY_FIVE_MINUTES_IN_MS, cacheTime: ONE_DAY_IN_MS }
  );
};

export default useAllDashboardByRoutes;
