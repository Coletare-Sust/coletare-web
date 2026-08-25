import { useQuery } from "@tanstack/react-query";

import { FORTY_FIVE_MINUTES_IN_MS } from "@common/constants/generic";
import { getUserPermissions } from "@/store/services/access";

export function getUserPermissionsQueryKey(userId?: string | null) {
  return ["user-permissions", userId];
}

const useUserPermissions = (userId?: string | null) => {
  return useQuery(
    getUserPermissionsQueryKey(userId),
    () => getUserPermissions(userId as string),
    {
      enabled: !!userId,
      staleTime: FORTY_FIVE_MINUTES_IN_MS
    }
  );
};

export default useUserPermissions;
