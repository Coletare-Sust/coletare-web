import { useQuery } from "@tanstack/react-query";

import {
  ONE_DAY_IN_MS,
  FORTY_FIVE_MINUTES_IN_MS,
  FIFTEEN_MINUTES_IN_MS
} from "@common/constants/generic";

import { getAllWithdrawalsRequests } from "@/store/services/withdrawalsRequests";
import { DocumentData } from "firebase/firestore";
import { WithdrawalsRequestEntity } from "@/common/entities/WithdrawalsRequest";

export function getAllWithdrawalsRequestsQueryKey(cityId: string) {
  return ["withdrawals", cityId];
}

export const getAllWithdrawalsRequestsQueryFn = (cityId: string) => {
  return () => getAllWithdrawalsRequests(cityId);
};

const useAllWithdrawalsRequest = <T = WithdrawalsRequestEntity[]>(
  cityId: string,
  select?: (data: DocumentData) => T
) => {
  return useQuery(
    getAllWithdrawalsRequestsQueryKey(cityId),
    getAllWithdrawalsRequestsQueryFn(cityId),
    {
      select,
      staleTime: FIFTEEN_MINUTES_IN_MS,
      cacheTime: ONE_DAY_IN_MS,
      enabled: !!cityId
    }
  );
};

export default useAllWithdrawalsRequest;
