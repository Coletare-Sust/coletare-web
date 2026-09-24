import { useQuery } from "@tanstack/react-query";

import {
  ONE_DAY_IN_MS,
  FIFTEEN_MINUTES_IN_MS
} from "@common/constants/generic";
import type { PageEntity } from "@/common/entities/pagination";
import type { WithdrawalsRequestEntity } from "@/common/entities/WithdrawalsRequest";
import { getWithdrawalsRequestsPage } from "@/store/services/withdrawalsRequests";

interface WithdrawalRequestFilters {
  status?: boolean;
  type?: string;
  residueType?: string;
}

export function getPaginatedWithdrawalsRequestsQueryKey(
  cityId: string,
  page: number,
  size: number,
  filters?: WithdrawalRequestFilters
) {
  return [
    "withdrawals",
    cityId,
    "page",
    page,
    size,
    filters?.status ?? "",
    filters?.type ?? "",
    filters?.residueType ?? ""
  ];
}

const usePaginatedWithdrawalsRequests = (
  cityId: string,
  page = 0,
  size = 10,
  filters?: WithdrawalRequestFilters
) => {
  return useQuery<PageEntity<WithdrawalsRequestEntity> | null>(
    getPaginatedWithdrawalsRequestsQueryKey(cityId, page, size, filters),
    () => getWithdrawalsRequestsPage(cityId, page, size, filters),
    {
      enabled: Boolean(cityId),
      keepPreviousData: true,
      staleTime: FIFTEEN_MINUTES_IN_MS,
      cacheTime: ONE_DAY_IN_MS
    }
  );
};

export default usePaginatedWithdrawalsRequests;
