import { useQuery } from "@tanstack/react-query";

import {
  ONE_DAY_IN_MS,
  FORTY_FIVE_MINUTES_IN_MS
} from "@common/constants/generic";

import type { UserEntity } from "@common/entities/user";
import { getAllCities } from "@/store/services/user";
import type { DocumentData } from "@/common/entities/documentData";

// Get de todas as cidades (que no caso são users).

export function getAllCitiesQueryKey() {
  return ["cities"];
}

export const getAllCitiesQueryFn = () => {
  return () => getAllCities();
};

const useAllCities = <T = UserEntity[]>(select?: (data: DocumentData) => T) => {
  return useQuery(getAllCitiesQueryKey(), getAllCitiesQueryFn(), {
    select,
    staleTime: 10000,
    cacheTime: ONE_DAY_IN_MS
  });
};

export default useAllCities;
