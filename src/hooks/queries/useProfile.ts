import { useQuery } from "@tanstack/react-query";

import {
  ONE_DAY_IN_MS,
  FORTY_FIVE_MINUTES_IN_MS
} from "@common/constants/generic";

import type { UserEntity } from "@common/entities/user";
import { getMe, getUser } from "@/store/services/user";
import { DocumentData } from "firebase/firestore";
import useAuth from "@/hooks/useAuth";

export function getProfileQueryKey(uid: string) {
  return ["profile", uid];
}

/**
 * Hook de perfil que busca /auth/me para o usuário logado (dados completos do JWT,
 * incluindo role normalizada e cityId) e /user/{id} para perfis de terceiros.
 */
const useProfile = <T = UserEntity>(
  uid: string,
  select?: (data: DocumentData) => T
) => {
  const { userUid } = useAuth();
  const isSelf = !!uid && uid === userUid;

  return useQuery(
    getProfileQueryKey(uid),
    isSelf ? getMe : () => getUser(uid),
    {
      select,
      staleTime: FORTY_FIVE_MINUTES_IN_MS,
      cacheTime: ONE_DAY_IN_MS,
      enabled: !!uid
    }
  );
};

export default useProfile;
