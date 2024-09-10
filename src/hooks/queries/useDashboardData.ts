import { useQuery } from "@tanstack/react-query";

import {
  ONE_DAY_IN_MS,
  FORTY_FIVE_MINUTES_IN_MS
} from "@common/constants/generic";

import { DocumentData } from "firebase/firestore";
import { getDashboardData } from "@/store/services/collects";
import { DashboardEntity } from "@/common/entities/dashboard";

export function getDashboardDataQueryKey(cityId: string) {
  return ["dashboard", cityId];
}

export const getDashboardDataQueryFn = (cityId: string) => {
  return () => getDashboardData(cityId);
};

const useAllDashboard = <T = DashboardEntity>(
  cityId: string,
  select?: (data: DocumentData) => T
) => {
  return useQuery(
    getDashboardDataQueryKey(cityId),
    getDashboardDataQueryFn(cityId),
    {
      select,
      staleTime: FORTY_FIVE_MINUTES_IN_MS,
      cacheTime: ONE_DAY_IN_MS
    }
  );
};

export default useAllDashboard;
