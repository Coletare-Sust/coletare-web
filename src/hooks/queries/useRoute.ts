import { useQuery } from "@tanstack/react-query";
import { ONE_DAY_IN_MS, FORTY_FIVE_MINUTES_IN_MS } from "@common/constants/generic";
import { getRoute } from "@/store/services/route";
import { RouteEntity } from "@/common/entities/route";

export function getRouteQueryKey(routeId: string) {
  return ["route", routeId];
}

export const getRouteQueryFn = (routeId: string) => {
  return () => getRoute(routeId);
};

const useRoute = <T = RouteEntity | null>(
  routeId: string,
  select?: (data: RouteEntity | null) => T
) => {
  return useQuery(getRouteQueryKey(routeId), getRouteQueryFn(routeId), {
    select,
    staleTime: FORTY_FIVE_MINUTES_IN_MS,
    cacheTime: ONE_DAY_IN_MS,
    enabled: !!routeId
  });
};

export default useRoute;
