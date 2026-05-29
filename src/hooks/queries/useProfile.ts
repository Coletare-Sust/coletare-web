import { useQuery } from "@tanstack/react-query";

import {
  ONE_DAY_IN_MS,
  FORTY_FIVE_MINUTES_IN_MS
} from "@common/constants/generic";

import type { UserEntity } from "@common/entities/user";
import { getUser } from "@/store/services/user";
import { DocumentData } from "firebase/firestore";
import {
  DEV_LOGIN_ENABLED,
  DEV_LOGIN_UID
} from "@/common/constants/devAuth";

export function getProfileQueryKey(uid: string) {
  return ["profile", uid];
}

export const getProfileQueryFn = (uid: string) => {
  if (DEV_LOGIN_ENABLED && uid === DEV_LOGIN_UID) {
    return () =>
      Promise.resolve({
        id: "demo-city",
        uid: DEV_LOGIN_UID,
        name: "Administrador Demo",
        role: "platformAdmin",
        status: "Ativo",
        color: "green",
        email: "admin@coletare.local"
      });
  }

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
