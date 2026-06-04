import { useQuery } from "@tanstack/react-query";
import { ONE_DAY_IN_MS, FORTY_FIVE_MINUTES_IN_MS } from "@common/constants/generic";
import type { UserEntity } from "@common/entities/user";
import { getAllVehicles } from "@/store/services/user";

export function getAllVehiclesQueryKey(cityId: string) {
  return ["vehicles", cityId];
}

export const getAllVehiclesQueryFn = (cityId: string) => {
  return () => getAllVehicles(cityId);
};

const useAllVehicles = <T = UserEntity[]>(
  cityId: string,
  select?: (data: UserEntity[]) => T
) => {
  return useQuery(
    getAllVehiclesQueryKey(cityId),
    getAllVehiclesQueryFn(cityId),
    {
      select,
      staleTime: FORTY_FIVE_MINUTES_IN_MS,
      cacheTime: ONE_DAY_IN_MS
    }
  );
};

export default useAllVehicles;
