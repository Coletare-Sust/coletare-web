import { useQuery } from "@tanstack/react-query";
import { ONE_DAY_IN_MS, FORTY_FIVE_MINUTES_IN_MS } from "@common/constants/generic";
import type { UserEntity } from "@common/entities/user";
import { getUser } from "@/store/services/user";

export function getCityQueryKey(id: string | null) {
  return ["city", id];
}

export const getCityQueryFn = (id: string | null) => {
  return () => getUser(id);
};

const useCity = <T = UserEntity | null>(
  id: string | null,
  select?: (data: UserEntity | null) => T
) => {
  return useQuery(getCityQueryKey(id), getCityQueryFn(id), {
    select,
    staleTime: FORTY_FIVE_MINUTES_IN_MS,
    cacheTime: ONE_DAY_IN_MS,
    enabled: !!id
  });
};

export default useCity;
