import { useQuery } from "@tanstack/react-query";

import { ONE_DAY_IN_MS } from "@common/constants/generic";
import { getPermissions } from "@/store/services/access";

export function getPermissionsQueryKey() {
  return ["permissions"];
}

const usePermissions = () => {
  return useQuery(getPermissionsQueryKey(), getPermissions, {
    staleTime: ONE_DAY_IN_MS,
    cacheTime: ONE_DAY_IN_MS
  });
};

export default usePermissions;
