import { useQuery } from "@tanstack/react-query";

import {
  ONE_DAY_IN_MS,
  FORTY_FIVE_MINUTES_IN_MS
} from "@common/constants/generic";

import type { CollectEntity } from "@common/entities/Collect";
import { getAllCollectsByCity } from "@/store/services/collects";
import type { DocumentData } from "@/common/entities/documentData";

// Get de todas as cidades (que no caso são users).

export function getAllCollectsQueryKey(cityId: string) {
  return ["collects", cityId];
}

export const getAllCollectsQueryFn = (cityId: string) => {
  return () => getAllCollectsByCity(cityId);
};

const useAllCollectsByCity = <T = CollectEntity[]>(
  cityId: string,
  select?: (data: DocumentData) => T
) => {
  return useQuery(
    getAllCollectsQueryKey(cityId),
    getAllCollectsQueryFn(cityId),
    {
      select,
      staleTime: FORTY_FIVE_MINUTES_IN_MS,
      cacheTime: ONE_DAY_IN_MS
    }
  );
};

export default useAllCollectsByCity;
