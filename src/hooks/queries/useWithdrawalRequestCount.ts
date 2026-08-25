import { useQuery } from "@tanstack/react-query";
import {
  ONE_DAY_IN_MS,
  FIFTEEN_MINUTES_IN_MS
} from "@common/constants/generic";
import { getWithdrawalRequestCount } from "@/store/services/withdrawalsRequests";

export function getWithdrawalRequestCountQueryKey(cityId: string) {
  return ["withdrawals-count", cityId];
}

const useWithdrawalRequestCount = (cityId: string) => {
  return useQuery(
    getWithdrawalRequestCountQueryKey(cityId),
    () => getWithdrawalRequestCount(cityId),
    {
      staleTime: FIFTEEN_MINUTES_IN_MS,
      cacheTime: ONE_DAY_IN_MS,
      enabled: !!cityId
    }
  );
};

export default useWithdrawalRequestCount;
