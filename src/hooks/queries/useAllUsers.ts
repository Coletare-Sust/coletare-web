import { useQuery } from "@tanstack/react-query";
import { ONE_DAY_IN_MS, FORTY_FIVE_MINUTES_IN_MS } from "@common/constants/generic";
import type { UserEntity } from "@common/entities/user";
import { getUsers } from "@/store/services/user";

export function getAllUsersQueryKey() {
  return ["users"];
}

export const getAllUsersQueryFn = () => {
  return () => getUsers();
};

const useAllUsers = <T = UserEntity[]>(select?: (data: UserEntity[]) => T) => {
  return useQuery(getAllUsersQueryKey(), getAllUsersQueryFn(), {
    select,
    staleTime: FORTY_FIVE_MINUTES_IN_MS,
    cacheTime: ONE_DAY_IN_MS
  });
};

export default useAllUsers;
