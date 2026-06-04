import { useQuery } from "@tanstack/react-query";
import { ONE_DAY_IN_MS, FORTY_FIVE_MINUTES_IN_MS } from "@common/constants/generic";
import { CollectEntity } from "@/common/entities/Collect";
import { getAllCollects } from "@/store/services/collect";

export function getAllCollectsQueryKey() {
  return ["collects"];
}

export const getAllCollectsQueryFn = () => {
  return () => getAllCollects();
};

const useAllCollects = <T = CollectEntity[]>(
  select?: (data: CollectEntity[]) => T
) => {
  return useQuery(getAllCollectsQueryKey(), getAllCollectsQueryFn(), {
    select,
    staleTime: FORTY_FIVE_MINUTES_IN_MS,
    cacheTime: ONE_DAY_IN_MS
  });
};

export default useAllCollects;
