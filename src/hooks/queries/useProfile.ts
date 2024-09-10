import { useQuery } from "@tanstack/react-query";

import {
  ONE_DAY_IN_MS,
  FORTY_FIVE_MINUTES_IN_MS
} from "@common/constants/generic";

import type { UserEntity } from "@common/entities/user";
import { getUser } from "@/store/services/user";
import { DocumentData } from "firebase/firestore";

export function getProfileQueryKey(uid: string) {
  return ["profile", uid];
}

export const getProfileQueryFn = (uid: string) => {
  return () => getUser(uid);
};

const useProfile = <T = UserEntity>(
  uid: string,
  select?: (data: DocumentData) => T
) => {
  return useQuery(getProfileQueryKey(uid), getProfileQueryFn(uid), {
    select,
    staleTime: FORTY_FIVE_MINUTES_IN_MS,
    cacheTime: ONE_DAY_IN_MS,
    enabled: !!uid
  });
};

export default useProfile;
