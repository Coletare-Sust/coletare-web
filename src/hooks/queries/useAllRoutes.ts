import { useQuery } from "@tanstack/react-query";
import type { DocumentData } from "@/common/entities/documentData";

import {
  ONE_DAY_IN_MS,
  FIFTEEN_MINUTES_IN_MS
} from "@common/constants/generic";

import { getRoutes } from "@/store/services/route";
import { RouteEntity } from "@/common/entities/route";

export function getAllUsersQueryKey(cityId: string) {
  return ["routes", cityId];
}

export const getAllUsersQueryFn = (cityId: string) => {
  return () => getRoutes(cityId);
};

const useAllRoutes = <T = RouteEntity[]>(
  cityId: string,
  select?: (data: DocumentData) => T
) => {
  return useQuery(getAllUsersQueryKey(cityId), getAllUsersQueryFn(cityId), {
    select,
    staleTime: FIFTEEN_MINUTES_IN_MS,
    cacheTime: ONE_DAY_IN_MS
  });
};

export default useAllRoutes;
