import { useQuery } from "@tanstack/react-query";
import { ONE_DAY_IN_MS, FORTY_FIVE_MINUTES_IN_MS } from "@common/constants/generic";
import { getCollect } from "@/store/services/collect";
import { CollectEntity } from "@/common/entities/Collect";

export function getCollectQueryKey(id: string) {
  return ["collect", id];
}

export const getCollectQueryFn = (id: string) => {
  return () => getCollect(id);
};

const useCollect = <T = CollectEntity | null>(
  id: string,
  select?: (data: CollectEntity | null) => T
) => {
  return useQuery(getCollectQueryKey(id), getCollectQueryFn(id), {
    select,
    staleTime: FORTY_FIVE_MINUTES_IN_MS,
    cacheTime: ONE_DAY_IN_MS
  });
};

export default useCollect;
