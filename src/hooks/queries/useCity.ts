import { useQuery } from "@tanstack/react-query";
import { DocumentData } from "firebase/firestore";

import {
  ONE_DAY_IN_MS,
  FORTY_FIVE_MINUTES_IN_MS
} from "@common/constants/generic";

import type { UserEntity } from "@common/entities/user";
import { getCityById } from "@/store/services/user";

// Get  de uma cidade (que no caso é um user)

export function getCityQueryKey(id: string | null) {
  return ["city", id];
}

export const getCityQueryFn = (id: string | null) => {
  return () => getCityById(id);
};

const useCity = <T = UserEntity>(
  id: string | null,
  select?: (data: DocumentData) => T
) => {
  return useQuery(getCityQueryKey(id), getCityQueryFn(id), {
    select,
    staleTime: FORTY_FIVE_MINUTES_IN_MS,
    cacheTime: ONE_DAY_IN_MS,
    enabled: !!id
  });
};

export default useCity;
