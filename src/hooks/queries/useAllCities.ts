import { useQuery } from "@tanstack/react-query";
import { ONE_DAY_IN_MS, FORTY_FIVE_MINUTES_IN_MS } from "@common/constants/generic";
import type { UserEntity } from "@common/entities/user";
import { getAllCities } from "@/store/services/user";

export function getAllCitiesQueryKey() {
  return ["cities"];
}

export const getAllCitiesQueryFn = () => {
  return () => getAllCities();
};

const useAllCities = <T = UserEntity[]>(select?: (data: UserEntity[]) => T) => {
  return useQuery(getAllCitiesQueryKey(), getAllCitiesQueryFn(), {
    select,
    staleTime: FORTY_FIVE_MINUTES_IN_MS,
    cacheTime: ONE_DAY_IN_MS
  });
};

export default useAllCities;
