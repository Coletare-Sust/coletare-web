import { useQuery } from "@tanstack/react-query";

import {
  ONE_DAY_IN_MS,
  FORTY_FIVE_MINUTES_IN_MS
} from "@common/constants/generic";

import type { UserEntity } from "@common/entities/user";
import { getUser } from "@/store/services/user";
import { DocumentData } from "firebase/firestore";

export function getOneUserQueryKey(id: string) {
  return ["user", id];
}

export const getOneUserQueryFn = (id: string) => {
  return () => getUser(id);
};

const useOneUser = <T = UserEntity>(
  id: string,
  select?: (data: DocumentData) => T
) => {
  return useQuery(getOneUserQueryKey(id), getOneUserQueryFn(id), {
    select,
    staleTime: FORTY_FIVE_MINUTES_IN_MS,
    cacheTime: ONE_DAY_IN_MS
  });
};

export default useOneUser;
